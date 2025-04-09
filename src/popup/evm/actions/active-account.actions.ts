import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import {
  EvmActiveAccount,
  EvmErc1155Token,
  EvmErc721Token,
  NativeAndErc20Token,
} from '@popup/evm/interfaces/active-account.interface';
import {
  EvmSmartContractInfoErc1155,
  EvmSmartContractInfoErc721,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmActiveAccountUtils } from '@popup/evm/utils/evm-active-account.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { AppThunk } from '@popup/multichain/actions/interfaces';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { HDNodeWallet } from 'ethers';

export const loadEvmActiveAccount =
  (chain: EvmChain, wallet: HDNodeWallet): AppThunk =>
  async (dispatch, getState) => {
    dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT,
      payload: {
        address: wallet.address,
        nativeAndErc20Tokens: [] as NativeAndErc20Token[],
        wallet: wallet,
        erc1155Tokens: [] as EvmErc1155Token[],
        nfts: [] as EvmErc721Token[],
        isInitialized: false,
      } as EvmActiveAccount,
    });

    const allTokens = await EvmTokensUtils.discoverTokens(
      process.env.FORCED_EVM_WALLET_ADDRESS ?? wallet.address,
      chain,
    );

    const allTokensInfo = await EvmTokensUtils.getTokensFullDetails(
      allTokens,
      chain,
    );

    console.log({ allTokens, allTokensInfo });

    let nativeAndErc20Tokens = await EvmTokensUtils.getTokenBalances(
      process.env.FORCED_EVM_WALLET_ADDRESS ?? wallet.address,
      chain,
      allTokensInfo.filter(
        (token) => token.type === EVMSmartContractType.ERC20,
      ),
    );

    let erc721Tokens = await EvmTokensUtils.getErc721Tokens(
      process.env.FORCED_EVM_WALLET_ADDRESS ?? wallet.address,
      chain,
      allTokensInfo.filter(
        (token) => token.type === EVMSmartContractType.ERC721,
      ) as EvmSmartContractInfoErc721[],
    );

    let erc1155Tokens = await EvmTokensUtils.getErc1155Tokens(
      allTokens,
      allTokensInfo.filter(
        (token) => token.type === EVMSmartContractType.ERC1155,
      ) as EvmSmartContractInfoErc1155[],
      chain,
    );

    await EvmActiveAccountUtils.saveActiveAccountWallet(chain, wallet.address);

    dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT,
      payload: {
        address: wallet.address,
        nativeAndErc20Tokens: nativeAndErc20Tokens,
        nfts: [...erc721Tokens, ...erc1155Tokens],
        wallet: wallet,
        isInitialized: true,
      } as EvmActiveAccount,
    });
  };
