import { ActionType } from 'src/popup/hive/actions/action-type.enum';
import { AppStatus } from 'src/popup/hive/reducers/app-status.reducer';

export const setProcessingDecryptAccount = (
  processingDecryptAccount: boolean,
) => {
  return {
    type: ActionType.SET_APP_STATUS,
    payload: {
      processingDecryptAccount: processingDecryptAccount,
    } as Partial<AppStatus>,
  };
};

export const setIsLedgerSupported = (isLedgerSupported: boolean) => {
  return {
    type: ActionType.SET_APP_STATUS,
    payload: {
      isLedgerSupported,
    } as Partial<AppStatus>,
  };
};
