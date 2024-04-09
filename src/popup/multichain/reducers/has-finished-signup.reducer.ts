import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { ActionPayload } from '@popup/multichain/actions/interfaces';

export const HasFinishedSignupReducer = (
  state: boolean | null = null,
  { type, payload }: ActionPayload<boolean>,
): boolean | null => {
  switch (type) {
    case MultichainActionType.SET_HAS_FINISHED_SIGNUP:
      return payload!;
    default:
      return state;
  }
};
