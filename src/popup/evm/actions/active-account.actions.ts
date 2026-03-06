import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import {
  EvmActiveAccount,
  EvmErc1155Token,
  EvmErc721Token,
  NativeAndErc20Token,
} from '@popup/evm/interfaces/active-account.interface';
import { EvmUserHistory } from '@popup/evm/interfaces/evm-tokens-history.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import {
  CatchupStatus,
  DiscoveredNftsResponse,
  DiscoveredTokensResponse,
  EvmLightNodeUtils,
  PricingStatus,
} from '@popup/evm/utils/evm-light-node.utils';
import { EvmTokensHistoryUtils } from '@popup/evm/utils/evm-tokens-history.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { AppThunk } from '@popup/multichain/actions/interfaces';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { HDNodeWallet } from 'ethers';

const EMPTY_EVM_HISTORY: EvmUserHistory = {
  events: [],
  nextCursor: '',
  fullyFetch: false,
};

const LOAD_MORE_TOKENS_INITIAL_DELAY_MS = 1000;
const LOAD_MORE_TOKENS_MAX_DELAY_MS = 30000;

const getLoadMoreTokensRetryDelay = (retryCount: number): number => {
  return Math.min(
    LOAD_MORE_TOKENS_INITIAL_DELAY_MS * 2 ** retryCount,
    LOAD_MORE_TOKENS_MAX_DELAY_MS,
  );
};

const shouldLoadMoreDiscoveredAssets = (
  result: DiscoveredTokensResponse | DiscoveredNftsResponse,
): boolean => {
  const shouldLoadMoreCatchup =
    !result.catchupStatus || result.catchupStatus === CatchupStatus.RUNNING;
  if ('pricingStatus' in result) {
    return (
      shouldLoadMoreCatchup ||
      !result.pricingStatus ||
      result.pricingStatus !== PricingStatus.READY
    );
  }
  return shouldLoadMoreCatchup;
};

const mapDiscoveredNftsResponseToActiveAccountNfts = (
  response: DiscoveredNftsResponse,
): (EvmErc721Token | EvmErc1155Token)[] => {
  console.log(response);
  return response.collections.flatMap((collection) => {
    if (collection.contractType === 'ERC721') {
      return [
        {
          tokenInfo: {
            type: EVMSmartContractType.ERC721,
            name: collection.name ?? '',
            symbol: collection.symbol ?? '',
            logo: '',
            chainId: String(response.chainId),
            backgroundColor: '',
            priceUsd: 0,
            contractAddress: collection.contractAddress,
            possibleSpam: collection.possibleSpam,
            verifiedContract: collection.verifiedContract,
          },
          collection: collection.nfts.map((nft) => ({
            id: nft.tokenId,
            metadata: {
              name: nft.name ?? '',
              description: '',
              image: nft.imageUrl ?? '',
              attributes: [],
            },
          })),
        } as EvmErc721Token,
      ];
    }

    if (collection.contractType === 'ERC1155') {
      return [
        {
          tokenInfo: {
            type: EVMSmartContractType.ERC1155,
            name: collection.name ?? '',
            symbol: collection.symbol ?? '',
            logo: '',
            chainId: String(response.chainId),
            backgroundColor: '',
            priceUsd: 0,
            contractAddress: collection.contractAddress,
            possibleSpam: collection.possibleSpam,
            verifiedContract: collection.verifiedContract,
          },
          collection: collection.nfts.map((nft) => ({
            id: nft.tokenId,
            balance: Number.parseInt(nft.balance, 10) || 0,
            metadata: {
              name: nft.name ?? '',
              description: '',
              image: nft.imageUrl ?? '',
              attributes: [],
            },
          })),
        } as EvmErc1155Token,
      ];
    }

    return [];
  });
};

export const loadEvmHistory = (): AppThunk => async (dispatch, getState) => {
  dispatch({
    type: EvmActionType.SET_ACTIVE_ACCOUNT,
    payload: {
      ...getState().evm.activeAccount,
      history: {
        value: getState().evm.activeAccount.history.value,
        loading: true,
        initialized: false,
      },
    } as EvmActiveAccount,
  });

  const newHistory = await EvmTokensHistoryUtils.fetchHistory2(
    process.env.FORCED_EVM_WALLET_ADDRESS ??
      getState().evm.activeAccount.wallet.address,
    getState().chain,
    getState().evm.activeAccount.history.value ?? null,
  );

  dispatch({
    type: EvmActionType.SET_ACTIVE_ACCOUNT,
    payload: {
      ...getState().evm.activeAccount,
      history: {
        value: newHistory,
        loading: false,
        initialized: true,
      },
    } as EvmActiveAccount,
  });
};

export const loadMoreTokensInActiveAccount =
  (chain: EvmChain, wallet: HDNodeWallet, retryCount = 0): AppThunk =>
  async (dispatch, getState) => {
    const result = await EvmLightNodeUtils.getDiscoveredTokens(
      chain.chainId,
      process.env.FORCED_EVM_WALLET_ADDRESS ?? wallet.address,
    );
    const balances = await EvmTokensUtils.getTokenBalances(
      process.env.FORCED_EVM_WALLET_ADDRESS ?? wallet.address,
      chain,
      result.tokens.filter(
        (token) =>
          token.type === EVMSmartContractType.ERC20 ||
          token.type === EVMSmartContractType.NATIVE,
      ),
    );

    dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT_TOKENS,
      payload: {
        nativeAndErc20Tokens: {
          value: balances,
          loading: balances.length > 0 ? false : true,
          initialized: true,
        },
      },
    });

    if (shouldLoadMoreDiscoveredAssets(result)) {
      const retryDelay = getLoadMoreTokensRetryDelay(retryCount);
      setTimeout(() => {
        dispatch(loadMoreTokensInActiveAccount(chain, wallet, retryCount + 1));
      }, retryDelay);
    }
  };

export const loadEvmActiveAccount =
  (chain: EvmChain, wallet: HDNodeWallet): AppThunk =>
  async (dispatch, getState) => {
    dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT,
      payload: {
        address: wallet.address,
        nativeAndErc20Tokens: {
          value: [] as NativeAndErc20Token[],
          loading: true,
          initialized: false,
        },
        nfts: {
          value: [] as (EvmErc721Token | EvmErc1155Token)[],
          loading: true,
          initialized: false,
        },
        history: {
          value: EMPTY_EVM_HISTORY,
          loading: true,
          initialized: false,
        },
        wallet: wallet,
        isReady: false,
      } as EvmActiveAccount,
    });

    const result: DiscoveredTokensResponse =
      await EvmLightNodeUtils.getDiscoveredTokens(
        chain.chainId,
        process.env.FORCED_EVM_WALLET_ADDRESS ?? wallet.address,
      );

    const balances = await EvmTokensUtils.getTokenBalances(
      process.env.FORCED_EVM_WALLET_ADDRESS ?? wallet.address,
      chain,
      result.tokens.filter(
        (token) =>
          token.type === EVMSmartContractType.ERC20 ||
          token.type === EVMSmartContractType.NATIVE,
      ),
    );

    dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT_TOKENS,
      payload: {
        nativeAndErc20Tokens: {
          value: balances,
          loading: false,
          initialized: true,
        },
      },
    });

    dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT,
      payload: { isReady: true },
    });
    if (shouldLoadMoreDiscoveredAssets(result)) {
      setTimeout(() => {
        dispatch(loadMoreTokensInActiveAccount(chain, wallet));
      }, 1000);
    }
  };

export const loadMoreNftsInActiveAccount =
  (chain: EvmChain, wallet: HDNodeWallet, retryCount = 0): AppThunk =>
  async (dispatch, getState) => {
    const result = await EvmLightNodeUtils.getDiscoveredNfts(
      chain.chainId,
      process.env.FORCED_EVM_WALLET_ADDRESS ?? wallet.address,
    );
    const nfts = mapDiscoveredNftsResponseToActiveAccountNfts(result);
    const shouldLoadMore = shouldLoadMoreDiscoveredAssets(result);

    dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT,
      payload: {
        nfts: {
          value: nfts,
          loading: shouldLoadMore ? nfts.length === 0 : false,
          initialized: true,
        },
      },
    });

    if (shouldLoadMore) {
      const retryDelay = getLoadMoreTokensRetryDelay(retryCount);
      setTimeout(() => {
        dispatch(loadMoreNftsInActiveAccount(chain, wallet, retryCount + 1));
      }, retryDelay);
    }
  };

export const loadEvmActiveAccountNfts =
  (chain: EvmChain, wallet: HDNodeWallet): AppThunk =>
  async (dispatch, getState) => {
    dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT,
      payload: { nfts: { value: [], loading: true, initialized: false } },
    });
    const result = await EvmLightNodeUtils.getDiscoveredNfts(
      chain.chainId,
      process.env.FORCED_EVM_WALLET_ADDRESS ?? wallet.address,
    );
    const nfts = mapDiscoveredNftsResponseToActiveAccountNfts(result);
    const shouldLoadMore = shouldLoadMoreDiscoveredAssets(result);
    dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT,
      payload: {
        nfts: {
          value: nfts,
          loading: shouldLoadMore ? nfts.length === 0 : false,
          initialized: true,
        },
      },
    });

    if (shouldLoadMore) {
      setTimeout(() => {
        dispatch(loadMoreNftsInActiveAccount(chain, wallet));
      }, 1000);
    }
  };
