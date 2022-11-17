import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload } from '@popup/actions/interfaces';

export interface AppStatus {
  processingDecryptAccount: boolean;
}
const INITIAL_STATE: AppStatus = {
  processingDecryptAccount: false,
};

export const AppStatusReducer = (
  state: AppStatus = INITIAL_STATE,
  { type, payload }: ActionPayload<Partial<AppStatus>>,
) => {
  switch (type) {
    case ActionType.SET_APP_STATUS:
      return { ...state, ...payload };
    default:
      return state;
  }
};
