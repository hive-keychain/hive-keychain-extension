import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import {
  EvmActiveAccount,
  EvmErc1155Token,
  EvmErc721Token,
  NativeAndErc20Token,
} from '@popup/evm/interfaces/active-account.interface';
import {
  EvmSmartContractInfoErc721,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmActiveAccountUtils } from '@popup/evm/utils/evm-active-account.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { AppThunk } from '@popup/multichain/actions/interfaces';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { HDNodeWallet } from 'ethers';

const forcedWallet = '0x64F0Abfdad091f2A61fe4E469F9d04C538C79Ea2';

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
        erc721Tokens: [] as EvmErc721Token[],
      } as EvmActiveAccount,
    });

    const allTokens = await EvmTokensUtils.discoverTokens(
      // wallet.address,
      forcedWallet,
      chain,
    );

    console.log({ allTokens });

    let nativeAndErc20Tokens = await EvmTokensUtils.getTokenBalances(
      // wallet.address,
      forcedWallet,
      chain,
      allTokens.filter((token) => token.type === EVMSmartContractType.ERC20),
    );

    let erc721Tokens = await EvmTokensUtils.getErc721Tokens(
      // wallet.address,
      forcedWallet,
      chain,
      allTokens.filter(
        (token) => token.type === EVMSmartContractType.ERC721,
      ) as EvmSmartContractInfoErc721[],
    );

    await EvmActiveAccountUtils.saveActiveAccountWallet(chain, wallet.address);

    dispatch({
      type: EvmActionType.SET_ACTIVE_ACCOUNT,
      payload: {
        address: wallet.address,
        nativeAndErc20Tokens: nativeAndErc20Tokens,
        erc721Tokens: erc721Tokens,
        erc1155Tokens: [],
        wallet: wallet,
      } as EvmActiveAccount,
    });
  };
