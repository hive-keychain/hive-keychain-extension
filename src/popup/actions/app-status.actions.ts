import { ActionType } from '@popup/actions/action-type.enum';
import { AppStatus } from '@popup/reducers/app-status.reducer';

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
