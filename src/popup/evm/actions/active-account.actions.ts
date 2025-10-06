import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import {
  EvmActiveAccount,
  EvmErc1155Token,
  EvmErc721Token,
  NativeAndErc20Token,
} from '@popup/evm/interfaces/active-account.interface';
import { EvmUserHistory } from '@popup/evm/interfaces/evm-tokens-history.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmActiveAccountUtils } from '@popup/evm/utils/evm-active-account.utils';
import { EvmTokensHistoryUtils } from '@popup/evm/utils/evm-tokens-history.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { AppThunk } from '@popup/multichain/actions/interfaces';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { HDNodeWallet } from 'ethers';

export const loadEvmActiveAccount =
  (chain: EvmChain, wallet: HDNodeWallet): AppThunk =>
  async (dispatch, getState) => {
    console.log('loadEvmActiveAccount actions', chain, wallet.address);
    await EvmActiveAccountUtils.saveActiveAccountWallet(chain, wallet.address);
    dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT,
      payload: {
        address: wallet.address,
        nativeAndErc20Tokens: {
          value: [] as NativeAndErc20Token[],
          loading: true,
        },
        nfts: {
          value: [] as (EvmErc721Token | EvmErc1155Token)[],
          loading: true,
        },
        history: { value: {} as EvmUserHistory, loading: true },
        wallet: wallet,
        isInitialized: false,
      } as EvmActiveAccount,
    });

    const allTokens = await EvmTokensUtils.discoverTokens(
      process.env.FORCED_EVM_WALLET_ADDRESS ?? wallet.address,
      chain,
    );
    console.log({ allTokens });

    const allTokensInfo = await EvmTokensUtils.getTokensFullDetails(
      allTokens,
      chain,
    );
    console.log({ allTokensInfo });

    Promise.all([
      EvmTokensUtils.getTokenBalances(
        process.env.FORCED_EVM_WALLET_ADDRESS ?? wallet.address,
        chain,
        allTokensInfo.filter(
          (token) =>
            token.type === EVMSmartContractType.ERC20 ||
            token.type === EVMSmartContractType.NATIVE,
        ),
      ).then((res) => {
        dispatch({
          type: EvmActionType.SET_ACTIVE_ACCOUNT_TOKENS,
          payload: { nativeAndErc20Tokens: { value: res, loading: false } },
        });
      }),
      EvmTokensUtils.getNfts(wallet, chain, allTokensInfo, allTokens).then(
        ([erc721, erc1155]) => {
          dispatch({
            type: EvmActionType.SET_ACTIVE_ACCOUNT_NFT,
            payload: {
              nfts: { value: [...erc721, ...erc1155], loading: false },
            },
          });
        },
      ),
      EvmTokensHistoryUtils.fetchHistory(wallet.address, chain).then((res) => {
        dispatch({
          type: EvmActionType.SET_ACTIVE_ACCOUNT_HISTORY,
          payload: { history: { value: res, loading: false } },
        });
      }),
    ]).then(() => {
      dispatch({
        type: EvmActionType.SET_ACTIVE_ACCOUNT,
        payload: { isInitialized: true },
      });
    });
  };

export const manualDiscoverErc20Tokens =
  (): AppThunk => async (dispatch, getState) => {
    console.log('manualDiscoverErc20Tokens action');
    dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT,
      payload: { nativeAndErc20Tokens: { value: [], loading: true } },
    });

    const tokens = await EvmTokensUtils.manualDiscoverErc20Tokens(
      getState().evm.activeAccount.wallet.address,
      getState().chain,
    );

    console.log(tokens, 'tokens in manualDiscoverErc20Tokens');

    const allTokensInfo = await EvmTokensUtils.getTokensFullDetails(
      tokens,
      getState().chain,
    );

    const tokenBalances = (await EvmTokensUtils.getTokenBalances(
      process.env.FORCED_EVM_WALLET_ADDRESS ??
        getState().evm.activeAccount.wallet.address,
      getState().chain,
      allTokensInfo.filter(
        (token) =>
          token.type === EVMSmartContractType.ERC20 ||
          token.type === EVMSmartContractType.NATIVE,
      ),
    )) as NativeAndErc20Token[];
    dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT,
      payload: {
        nativeAndErc20Tokens: { value: tokenBalances, loading: false },
      },
    });
  };

export const manualDiscoverNfts =
  (): AppThunk => async (dispatch, getState) => {
    dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT,
      payload: { nfts: { value: [], loading: true } },
    });

    // const tokenList = await EvmTokensUtils.manualDiscoverNfts(
    //   getState().evm.activeAccount.wallet.address,
    //   getState().chain,
    // );

    dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT,
      payload: { nfts: { value: [], loading: false } },
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
      },
    } as EvmActiveAccount,
  });

  const newHistory = await EvmTokensHistoryUtils.fetchHistory(
    getState().evm.activeAccount.wallet.address,
    getState().chain,
    getState().evm.activeAccount.history.value,
  );

  dispatch({
    type: EvmActionType.SET_ACTIVE_ACCOUNT,
    payload: {
      ...getState().evm.activeAccount,
      history: {
        value: newHistory,
        loading: false,
      },
    } as EvmActiveAccount,
  });
};
