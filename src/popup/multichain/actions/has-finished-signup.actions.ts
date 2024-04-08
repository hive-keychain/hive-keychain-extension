import { ActionType } from '@popup/hive/actions/action-type.enum';
import { ActionPayload } from '@popup/multichain/actions/interfaces';

export const setHasFinishedSignup = (
  hasFinishedSignup: boolean,
): ActionPayload<boolean> => {
  return {
    type: ActionType.SET_HAS_FINISHED_SIGNUP,
    payload: hasFinishedSignup,
  };
};
