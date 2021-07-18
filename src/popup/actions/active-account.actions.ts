import { ActionType } from '@popup/actions/action-type.enum';
import { AppThunk } from '@popup/actions/interfaces';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import HiveUtils from 'src/utils/hive.utils';

export const loadActiveAccount =
  (account: LocalAccount, initTransactions?: boolean): AppThunk =>
  async (dispatch, getState) => {
    dispatch({
      type: ActionType.SET_ACTIVE_ACCOUNT,
      payload: {
        name: account.name,
      },
    });
    dispatch(getAccountRC(account.name));
    // if (initTransactions) {
    //   dispatch(initAccountTransactions(name));
    // }
    const extendedAccount = (
      await HiveUtils.getClient().database.getAccounts([account.name])
    )[0];
    dispatch({
      type: ActionType.SET_ACTIVE_ACCOUNT,
      payload: {
        account: extendedAccount,
        keys: account.keys,
      },
    });
  };

// export const initAccountTransactions =
//   (accountName: string): AppThunk =>
//   async (dispatch, getState) => {
//     const memoKey = getState().accounts.find((a) => a.name === accountName)!
//       .keys.memo;
//     const transfers = await getAccountTransactions(accountName, null, memoKey);

//     dispatch({
//       type: INIT_TRANSACTIONS,
//       payload: transfers,
//     });
//   };

export const getAccountRC =
  (username: string): AppThunk =>
  async (dispatch) => {
    const rc = await HiveUtils.getClient().rc.getRCMana(username);
    dispatch({
      type: ActionType.SET_ACTIVE_ACCOUNT_RC,
      payload: rc,
    });
  };
