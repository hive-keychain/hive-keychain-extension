import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload } from '@popup/actions/interfaces';

export const LoadingReducer = (
  state = false,
  { type, payload }: ActionPayload<boolean>,
): boolean => {
  switch (type) {
    case ActionType.SET_LOADING:
      return payload!;
    default:
      return state;
  }
};
