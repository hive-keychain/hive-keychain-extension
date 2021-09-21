import { ActionType } from '@popup/actions/action-type.enum';
import { AppThunk } from '@popup/actions/interfaces';
import { getPhishingAccounts } from 'src/utils/phishing.utils';

export const fetchPhishingAccounts = (): AppThunk => async (dispatch) => {
  dispatch({
    type: ActionType.FETCH_PHISHING_ACCOUNTS,
    payload: await getPhishingAccounts(),
  });
};
