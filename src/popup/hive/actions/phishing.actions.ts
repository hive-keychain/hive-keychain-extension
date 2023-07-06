import { getPhishingAccounts } from '@hiveapp/utils/phishing.utils';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';
import { AppThunk } from 'src/popup/hive/actions/interfaces';

export const fetchPhishingAccounts = (): AppThunk => async (dispatch) => {
  dispatch({
    type: ActionType.FETCH_PHISHING_ACCOUNTS,
    payload: await getPhishingAccounts(),
  });
};
