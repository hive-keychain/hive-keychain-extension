import { AppThunk } from '@popup/multichain/actions/interfaces';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';
import { getPhishingAccounts } from 'src/popup/hive/utils/phishing.utils';

export const fetchPhishingAccounts = (): AppThunk => async (dispatch) => {
  dispatch({
    type: ActionType.FETCH_PHISHING_ACCOUNTS,
    payload: await getPhishingAccounts(),
  });
};
