import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import { EvmActiveAccount } from '@popup/evm/interfaces/active-account.interface';
import { EvmUserHistory } from '@popup/evm/interfaces/evm-tokens-history.interface';
import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { HDNodeWallet } from 'ethers';

export const EvmActiveAccountReducer = (
  state: EvmActiveAccount = {
    address: '',
    wallet: {} as HDNodeWallet,
    nativeAndErc20Tokens: {
      value: [],
      loading: true,
    },
    nfts: {
      value: [],
      loading: true,
      initialized: false,
    },
    history: {
      value: {} as EvmUserHistory,
      loading: true,
      initialized: false,
    },

    isReady: false,
  },
  { type, payload }: ActionPayload<Partial<EvmActiveAccount>>,
): EvmActiveAccount => {
  switch (type) {
    case EvmActionType.SET_ACTIVE_ACCOUNT:
    case EvmActionType.SET_ACTIVE_ACCOUNT_HISTORY:
    case EvmActionType.SET_ACTIVE_ACCOUNT_NFT:
    case EvmActionType.SET_ACTIVE_ACCOUNT_TOKENS:
      return { ...state, ...payload };
    default:
      return state;
  }
};
