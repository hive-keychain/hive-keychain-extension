import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import { EvmActiveAccount } from '@popup/evm/interfaces/active-account.interface';
import { EvmUserHistory } from '@popup/evm/interfaces/evm-tokens-history.interface';
import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { HDNodeWallet } from 'ethers';

export const EvmActiveAccountReducer = (
  state: EvmActiveAccount = {
    address: '',
    nativeAndErc20Tokens: [],
    nfts: [],
    wallet: {} as HDNodeWallet,
    history: {} as EvmUserHistory,
    isInitialized: false,
  },
  { type, payload }: ActionPayload<EvmActiveAccount>,
): EvmActiveAccount => {
  switch (type) {
    case EvmActionType.SET_ACTIVE_ACCOUNT:
      return payload!;
    default:
      return state;
  }
};
