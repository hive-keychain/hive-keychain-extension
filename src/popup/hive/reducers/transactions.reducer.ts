import { Transaction, Transactions } from '@interfaces/transaction.interface';
import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { HiveActionType } from 'src/popup/hive/actions/action-type.enum';
import ArrayUtils from 'src/utils/array.utils';

const TransactionReducer = (
  state: Transactions = { loading: false, list: [], lastUsedStart: -1 },
  { type, payload }: ActionPayload<[Transaction[], number]>,
) => {
  switch (type) {
    case HiveActionType.SET_ACTIVE_ACCOUNT: // action related to active account. Here used to reset the transaction list
      return { loading: true, list: [], lastUsedStart: -1 };
    case HiveActionType.INIT_TRANSACTIONS:
      return { loading: false, list: payload! };
    case HiveActionType.ADD_TRANSACTIONS:
      return {
        ...state,
        list: ArrayUtils.mergeWithoutDuplicate(state.list, payload![0], 'key'),
        lastUsedStart: payload![1],
      };
    default:
      return state;
  }
};

export default TransactionReducer;
