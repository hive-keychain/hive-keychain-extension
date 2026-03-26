import TransferUtils from '@popup/hive/utils/transfer.utils';
import { AppThunk } from '@popup/multichain/actions/interfaces';
import { HiveActionType } from 'src/popup/hive/actions/action-type.enum';

export const fetchRecurrentTransfers =
  (name: string): AppThunk =>
  async (dispatch) => {
    const result = await TransferUtils.getRecurrentTransfers(name);
    const recurrentTransfers = [...(result?.recurrent_transfers ?? [])].sort(
      (a, b) => a.to.localeCompare(b.to) || a.pair_id - b.pair_id,
    );
    dispatch({
      type: HiveActionType.FETCH_RECURRENT_TRANSFERS,
      payload: recurrentTransfers,
    });
  };
