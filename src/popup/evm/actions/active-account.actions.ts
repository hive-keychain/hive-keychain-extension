import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import {
  EvmActiveAccount,
  EvmErc1155Token,
  EvmErc721Token,
  NativeAndErc20Token,
} from '@popup/evm/interfaces/active-account.interface';
import { EVMTokenType } from '@popup/evm/interfaces/evm-tokens.interface';
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
        erc721Tokens: [] as EvmErc721Token[],
      } as EvmActiveAccount,
    });

    const allTokens = await EvmTokensUtils.discoverTokens(
      wallet.address,
      chain,
    );

    let nativeAndErc20Tokens = await EvmTokensUtils.getTokenBalances(
      wallet.address,
      chain,
      allTokens.filter((token) => token.type === EVMTokenType.ERC20),
    );

    let erc721Tokens = await EvmTokensUtils.getErc721Tokens(
      wallet.address,
      chain,
      allTokens.filter((token) => token.type === EVMTokenType.ERC721),
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
