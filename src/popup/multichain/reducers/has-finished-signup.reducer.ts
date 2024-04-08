import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';

export const HasFinishedSignupReducer = (
  state: boolean | null = null,
  { type, payload }: ActionPayload<boolean>,
): boolean | null => {
  switch (type) {
    case ActionType.SET_HAS_FINISHED_SIGNUP:
      return payload!;
    default:
      return state;
  }
};
