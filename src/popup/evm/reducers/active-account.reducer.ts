import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import { EvmActiveAccount } from '@popup/evm/interfaces/active-account.interface';
import { EvmUserHistory } from '@popup/evm/interfaces/evm-tokens-history.interface';
import { EvmWallet } from '@popup/evm/interfaces/wallet.interface';
import { ActionPayload } from '@popup/multichain/actions/interfaces';

const EMPTY_EVM_HISTORY: EvmUserHistory = {
  events: [],
  nextCursor: null,
  fullyFetch: false,
};

export const EvmActiveAccountReducer = (
  state: EvmActiveAccount = {
    address: '',
    wallet: {} as EvmWallet,
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
      value: EMPTY_EVM_HISTORY,
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
