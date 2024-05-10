import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import { EvmActiveAccount } from '@popup/evm/interfaces/active-account.interface';
import { ActionPayload } from '@popup/multichain/actions/interfaces';

const EvmActiveAccountReducer = (
  state: EvmActiveAccount = {
    address: '',
    balances: [],
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

export default EvmActiveAccountReducer;
