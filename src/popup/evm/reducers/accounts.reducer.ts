import { EvmActionType } from '@popup/evm/actions/action-type.evm.enum';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { ActionPayload } from '@popup/multichain/actions/interfaces';

const EvmAccountsReducer = (
  state: EvmAccount[] = [],
  { type, payload }: ActionPayload<EvmAccount[]>,
): EvmAccount[] => {
  switch (type) {
    case EvmActionType.SET_ACCOUNTS:
      return payload!;
    default:
      return state;
  }
};

export default EvmAccountsReducer;
