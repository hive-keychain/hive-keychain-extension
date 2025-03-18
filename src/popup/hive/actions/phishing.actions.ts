import { AppThunk } from '@popup/multichain/actions/interfaces';
import { HiveActionType } from 'src/popup/hive/actions/action-type.enum';
import PhishingUtils from 'src/utils/phishing.utils';

export const fetchPhishingAccounts = (): AppThunk => async (dispatch) => {
  dispatch({
    type: HiveActionType.FETCH_PHISHING_ACCOUNTS,
    payload: await PhishingUtils.getPhishingAccounts(),
  });
};
