import { PendingRecurrentTransfer } from '@interfaces/transaction.interface';
import { HiveActionType } from '@popup/hive/actions/action-type.enum';

export const recurrentTransfersReducer = (
  state: PendingRecurrentTransfer[] = [],
  action: any,
) => {
  switch (action.type) {
    case HiveActionType.FETCH_RECURRENT_TRANSFERS:
      return action.payload;
    default:
      return state;
  }
};
