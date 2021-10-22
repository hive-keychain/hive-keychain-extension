import { Transaction, Transactions } from '@interfaces/transaction.interface';
import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload } from '@popup/actions/interfaces';

const TransactionReducer = (
  state: Transactions = { loading: false, list: [] },
  { type, payload }: ActionPayload<Transaction[]>,
) => {
  switch (type) {
    case ActionType.SET_ACTIVE_ACCOUNT: // action related to active account. Here used to reset the transaction list
      return { loading: true, list: [] };
    case ActionType.INIT_TRANSACTIONS:
      return { loading: false, list: payload! };
    case ActionType.ADD_TRANSACTIONS:
      if (
        !state.list[0] ||
        state.list[0].key.split('!')[0] === payload![0].key.split('!')[0]
      ) {
        return { ...state, list: [...state.list, ...payload!] };
      } else {
        return state;
      }
    default:
      return state;
  }
};

export default TransactionReducer;
