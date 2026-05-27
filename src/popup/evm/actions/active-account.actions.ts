import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import {
  EvmActiveAccount,
  EvmErc1155Token,
  EvmErc721Token,
  NativeAndErc20Token,
} from '@popup/evm/interfaces/active-account.interface';
import { EvmUserHistory } from '@popup/evm/interfaces/evm-tokens-history.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmWallet } from '@popup/evm/interfaces/wallet.interface';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import {
  CatchupStatus,
  DiscoveredNftsResponse,
  DiscoveredTokensResponse,
  EvmLightNodeUtils,
  isCatchupStatusPending,
  PricingStatus,
} from '@popup/evm/utils/evm-light-node.utils';
import { EvmLocalHistoryUtils } from '@popup/evm/utils/evm-local-history.utils';
import { EvmTokensHistoryUtils } from '@popup/evm/utils/evm-tokens-history.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmNFTUtils } from '@popup/evm/utils/nft.utils';
import { AppThunk } from '@popup/multichain/actions/interfaces';
import {
  Chain,
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';

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
  const shouldLoadMoreCatchup = result.catchupStatus === CatchupStatus.RUNNING;
  if ('pricingStatus' in result) {
    return (
      shouldLoadMoreCatchup ||
      !result.pricingStatus ||
      result.pricingStatus !== PricingStatus.READY
    );
  }
  return shouldLoadMoreCatchup;
};

const shouldLoadMoreHistory = (history: EvmUserHistory): boolean => {
  return isCatchupStatusPending(history.catchupStatus);
};

const isSameEvmChain = (currentChain: Chain, chain: EvmChain) => {
  return (
    currentChain.type === ChainType.EVM &&
    (currentChain as EvmChain).chainId === chain.chainId
  );
};

const isActiveAccountRequestCurrent = (
  currentChain: Chain,
  activeAccount: EvmActiveAccount,
  chain: EvmChain,
  wallet: EvmWallet,
) => {
  return (
    isSameEvmChain(currentChain, chain) &&
    activeAccount.wallet?.address?.toLowerCase() ===
      wallet.address.toLowerCase()
  );
};

const getHistoryEventKey = (event: EvmUserHistory['events'][number]) => {
  return `${event.transactionHash.toLowerCase()}-${event.transactionIndex}`;
};

const sortHistoryEvents = (events: EvmUserHistory['events']) => {
  return [...events].sort((a, b) => {
    if (a.timestamp !== b.timestamp) return b.timestamp - a.timestamp;
    if (a.blockNumber !== b.blockNumber) return b.blockNumber - a.blockNumber;
    return b.transactionIndex - a.transactionIndex;
  });
};

const mergeEvmHistory = (
  currentHistory: EvmUserHistory,
  nextHistory: EvmUserHistory,
) => {
  const currentEvents = currentHistory?.events ?? [];
  const mergedEvents = [...currentEvents];
  const eventKeys = new Set(currentEvents.map(getHistoryEventKey));

  for (const event of nextHistory.events ?? []) {
    const eventKey = getHistoryEventKey(event);
    if (eventKeys.has(eventKey)) continue;
    eventKeys.add(eventKey);
    mergedEvents.push(event);
  }

  return {
    ...nextHistory,
    events: sortHistoryEvents(mergedEvents),
  };
};

const mapDiscoveredNftsResponseToActiveAccountNfts = async (
  response: DiscoveredNftsResponse,
): Promise<(EvmErc721Token | EvmErc1155Token)[]> => {
  const getCollectionDisplayName = (
    collection: (typeof response.collections)[number],
  ) => {
    return (
      collection.name?.trim() ||
      collection.symbol?.trim() ||
      EvmFormatUtils.formatAddress(collection.contractAddress)
    );
  };

  const getFallbackContractType = (
    collection: (typeof response.collections)[number],
  ) => {
    if (collection.contractType === 'ERC721') {
      return EVMSmartContractType.ERC721;
    }
    if (collection.contractType === 'ERC1155') {
      return EVMSmartContractType.ERC1155;
    }
    return collection.nfts.some((nft) => Number.parseInt(nft.balance, 10) > 1)
      ? EVMSmartContractType.ERC1155
      : EVMSmartContractType.ERC721;
  };

  const getMetadata = (
    nft: (typeof response.collections)[number]['nfts'][number],
  ) => {
    const metadata = {
      name: nft.name?.trim() || `#${nft.tokenId}`,
      description: '',
      image: nft.imageUrl ?? '',
      attributes: [],
    };

    metadata.image = EvmNFTUtils.getImgFromMetadata(metadata);

    return metadata;
  };

  return response.collections.flatMap((collection) => {
    const contractType = getFallbackContractType(collection);
    if (contractType === EVMSmartContractType.ERC721) {
      return [
        {
          tokenInfo: {
            type: EVMSmartContractType.ERC721,
            name: getCollectionDisplayName(collection),
            symbol: collection.symbol ?? '',
            logo: '',
            chainId: String(response.chainId),
            backgroundColor: '',
            priceUsd: 0,
            contractAddress: collection.contractAddress,
            possibleSpam: collection.possibleSpam,
            verifiedContract: collection.verifiedContract,
            isProxy: false,
            proxyTarget: null,
          },
          collection: collection.nfts.map((nft) => ({
            id: nft.tokenId,
            metadata: getMetadata(nft),
          })),
        } as EvmErc721Token,
      ];
    }

    if (contractType === EVMSmartContractType.ERC1155) {
      return [
        {
          tokenInfo: {
            type: EVMSmartContractType.ERC1155,
            name: getCollectionDisplayName(collection),
            symbol: collection.symbol ?? '',
            logo: '',
            chainId: String(response.chainId),
            backgroundColor: '',
            priceUsd: 0,
            contractAddress: collection.contractAddress,
            possibleSpam: collection.possibleSpam,
            verifiedContract: collection.verifiedContract,
            isProxy: false,
            proxyTarget: null,
          },
          collection: collection.nfts.map((nft) => ({
            id: nft.tokenId,
            balance: Number.parseInt(nft.balance, 10) || 0,
            metadata: getMetadata(nft),
          })),
        } as EvmErc1155Token,
      ];
    }

    return [];
  });
};

const getTokenInfosWithCustomErc20 = async (
  chain: EvmChain,
  wallet: EvmWallet,
  tokenInfos: NativeAndErc20Token['tokenInfo'][],
) => {
  const customTokenInfos = await EvmTokensUtils.getCustomErc20TokenInfos(
    chain,
    process.env.FORCED_EVM_WALLET_ADDRESS ?? wallet.address,
  );

  return EvmTokensUtils.mergeCustomErc20TokenInfos(
    tokenInfos,
    customTokenInfos,
  );
};

const getCustomChainNfts = async (chain: EvmChain, wallet: EvmWallet) => {
  return EvmTokensUtils.getCustomNftCollectionsForWallet(
    chain,
    process.env.FORCED_EVM_WALLET_ADDRESS ?? wallet.address,
  );
};

export const loadEvmHistory =
  (retryCount = 0): AppThunk =>
  async (dispatch, getState) => {
    const chain = getState().chain as Chain;
    const initialWallet = getState().evm.activeAccount.wallet;
    const initialHistory = getState().evm.activeAccount.history.value;
    if (chain.type === ChainType.EVM && (chain as EvmChain).isCustom === true) {
      const evmChain = chain as EvmChain;
      const walletAddress =
        process.env.FORCED_EVM_WALLET_ADDRESS ?? initialWallet.address;

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

      const newHistory =
        await EvmLocalHistoryUtils.getLocalUserHistoryForCustomChain(
          evmChain.chainId,
          walletAddress,
        );

      if (
        !isActiveAccountRequestCurrent(
          getState().chain as Chain,
          getState().evm.activeAccount,
          evmChain,
          initialWallet,
        )
      ) {
        return;
      }

      dispatch({
        type: EvmActionType.SET_ACTIVE_ACCOUNT,
        payload: {
          ...getState().evm.activeAccount,
          history: {
            value: mergeEvmHistory(
              getState().evm.activeAccount.history.value ?? initialHistory,
              newHistory,
            ),
            loading: false,
            initialized: true,
          },
        } as EvmActiveAccount,
      });
      return;
    }

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

    const evmChain = chain as EvmChain;
    const newHistory = await EvmTokensHistoryUtils.fetchHistory2(
      process.env.FORCED_EVM_WALLET_ADDRESS ?? initialWallet.address,
      evmChain,
      initialHistory ?? null,
    );

    if (
      !isActiveAccountRequestCurrent(
        getState().chain as Chain,
        getState().evm.activeAccount,
        evmChain,
        initialWallet,
      )
    ) {
      return;
    }

    const mergedHistory = mergeEvmHistory(
      getState().evm.activeAccount.history.value ?? initialHistory,
      newHistory,
    );
    const shouldLoadMore = shouldLoadMoreHistory(newHistory);

    dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT,
      payload: {
        ...getState().evm.activeAccount,
        history: {
          value: mergedHistory,
          loading: shouldLoadMore ? mergedHistory.events.length === 0 : false,
          initialized: true,
        },
      } as EvmActiveAccount,
    });

    if (shouldLoadMore) {
      const retryDelay = getLoadMoreTokensRetryDelay(retryCount);
      setTimeout(() => {
        dispatch(loadEvmHistory(retryCount + 1));
      }, retryDelay);
    }
  };

export const loadMoreTokensInActiveAccount =
  (chain: EvmChain, wallet: EvmWallet, retryCount = 0): AppThunk =>
  async (dispatch, getState) => {
    if (chain.isCustom === true) {
      return;
    }
    if (
      !isActiveAccountRequestCurrent(
        getState().chain as Chain,
        getState().evm.activeAccount,
        chain,
        wallet,
      )
    ) {
      return;
    }
    const result = await EvmLightNodeUtils.getDiscoveredTokens(
      chain.chainId,
      process.env.FORCED_EVM_WALLET_ADDRESS ?? wallet.address,
    );
    if (
      !isActiveAccountRequestCurrent(
        getState().chain as Chain,
        getState().evm.activeAccount,
        chain,
        wallet,
      )
    ) {
      return;
    }
    const balances = await EvmTokensUtils.getTokenBalances(
      process.env.FORCED_EVM_WALLET_ADDRESS ?? wallet.address,
      chain,
      result.tokens.filter(
        (token) =>
          token.type === EVMSmartContractType.ERC20 ||
          token.type === EVMSmartContractType.NATIVE,
      ),
    );
    if (
      !isActiveAccountRequestCurrent(
        getState().chain as Chain,
        getState().evm.activeAccount,
        chain,
        wallet,
      )
    ) {
      return;
    }
    const currentTokens = getState().evm.activeAccount.nativeAndErc20Tokens;
    const nextBalances =
      balances.length === 0 && currentTokens.value.length > 0
        ? currentTokens.value
        : balances;

    dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT_TOKENS,
      payload: {
        nativeAndErc20Tokens: {
          value: nextBalances,
          loading: shouldLoadMoreDiscoveredAssets(result)
            ? nextBalances.length === 0
            : false,
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
  (chain: EvmChain, wallet: EvmWallet): AppThunk =>
  async (dispatch, getState) => {
    if (chain.isCustom === true) {
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
      const additionalAssetLoadPromises = [dispatch(loadEvmHistory())];

      const nativeMeta = EvmTokensUtils.buildFallbackNativeTokenInfo(chain);
      const [tokenInfos, customNfts] = await Promise.all([
        getTokenInfosWithCustomErc20(chain, wallet, [nativeMeta]),
        getCustomChainNfts(chain, wallet),
      ]);
      const balances = await EvmTokensUtils.getTokenBalances(
        process.env.FORCED_EVM_WALLET_ADDRESS ?? wallet.address,
        chain,
        tokenInfos,
      );
      if (
        !isActiveAccountRequestCurrent(
          getState().chain as Chain,
          getState().evm.activeAccount,
          chain,
          wallet,
        )
      ) {
        return;
      }

      dispatch({
        type: EvmActionType.SET_ACTIVE_ACCOUNT,
        payload: {
          nativeAndErc20Tokens: {
            value: balances,
            loading: false,
            initialized: true,
          },
          nfts: {
            value: customNfts,
            loading: false,
            initialized: true,
          },
        },
      });

      dispatch({
        type: EvmActionType.SET_ACTIVE_ACCOUNT,
        payload: { isReady: true },
      });
      await Promise.all(additionalAssetLoadPromises);
      return;
    }

    // TODO remove after testing period
    await EvmLightNodeUtils.registerAddress(
      chain.chainId,
      wallet.address,
      false,
    );
    if (!isSameEvmChain(getState().chain as Chain, chain)) {
      return;
    }
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
    const additionalAssetLoadPromises = [
      dispatch(loadEvmActiveAccountNfts(chain, wallet)),
      dispatch(loadEvmHistory()),
    ];

    const result: DiscoveredTokensResponse =
      await EvmLightNodeUtils.getDiscoveredTokens(
        chain.chainId,
        process.env.FORCED_EVM_WALLET_ADDRESS ?? wallet.address,
      );
    if (
      !isActiveAccountRequestCurrent(
        getState().chain as Chain,
        getState().evm.activeAccount,
        chain,
        wallet,
      )
    ) {
      return;
    }

    const balances = await EvmTokensUtils.getTokenBalances(
      process.env.FORCED_EVM_WALLET_ADDRESS ?? wallet.address,
      chain,
      result.tokens.filter(
        (token) =>
          token.type === EVMSmartContractType.ERC20 ||
          token.type === EVMSmartContractType.NATIVE,
      ),
    );
    if (
      !isActiveAccountRequestCurrent(
        getState().chain as Chain,
        getState().evm.activeAccount,
        chain,
        wallet,
      )
    ) {
      return;
    }

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
    await Promise.all(additionalAssetLoadPromises);
  };

export const loadMoreNftsInActiveAccount =
  (chain: EvmChain, wallet: EvmWallet, retryCount = 0): AppThunk =>
  async (dispatch, getState) => {
    if (chain.isCustom === true) {
      return;
    }
    if (
      !isActiveAccountRequestCurrent(
        getState().chain as Chain,
        getState().evm.activeAccount,
        chain,
        wallet,
      )
    ) {
      return;
    }
    const result = await EvmLightNodeUtils.getDiscoveredNfts(
      chain.chainId,
      process.env.FORCED_EVM_WALLET_ADDRESS ?? wallet.address,
    );
    const nfts = await mapDiscoveredNftsResponseToActiveAccountNfts(result);
    const shouldLoadMore = shouldLoadMoreDiscoveredAssets(result);
    if (
      !isActiveAccountRequestCurrent(
        getState().chain as Chain,
        getState().evm.activeAccount,
        chain,
        wallet,
      )
    ) {
      return;
    }
    const currentNfts = getState().evm.activeAccount.nfts;
    const nextNfts =
      nfts.length === 0 && currentNfts.value.length > 0
        ? currentNfts.value
        : nfts;

    dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT,
      payload: {
        nfts: {
          value: nextNfts,
          loading: shouldLoadMore ? nextNfts.length === 0 : false,
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
  (chain: EvmChain, wallet: EvmWallet): AppThunk =>
  async (dispatch, getState) => {
    if (chain.isCustom === true) {
      dispatch({
        type: EvmActionType.SET_ACTIVE_ACCOUNT,
        payload: {
          nfts: {
            value: getState().evm.activeAccount.nfts.value,
            loading: true,
            initialized: false,
          },
        },
      });
      const nfts = await getCustomChainNfts(chain, wallet);
      if (
        !isActiveAccountRequestCurrent(
          getState().chain as Chain,
          getState().evm.activeAccount,
          chain,
          wallet,
        )
      ) {
        return;
      }
      dispatch({
        type: EvmActionType.SET_ACTIVE_ACCOUNT,
        payload: {
          nfts: {
            value: nfts,
            loading: false,
            initialized: true,
          },
        },
      });
      return;
    }
    dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT,
      payload: { nfts: { value: [], loading: true, initialized: false } },
    });
    const result = await EvmLightNodeUtils.getDiscoveredNfts(
      chain.chainId,
      process.env.FORCED_EVM_WALLET_ADDRESS ?? wallet.address,
    );
    const nfts = await mapDiscoveredNftsResponseToActiveAccountNfts(result);
    const shouldLoadMore = shouldLoadMoreDiscoveredAssets(result);
    if (
      !isActiveAccountRequestCurrent(
        getState().chain as Chain,
        getState().evm.activeAccount,
        chain,
        wallet,
      )
    ) {
      return;
    }
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
