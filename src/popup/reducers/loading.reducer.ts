import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload } from '@popup/actions/interfaces';

export const LoadingReducer = (
  state: string[] = [],
  { type, payload }: ActionPayload<string>,
): string[] => {
  switch (type) {
    case ActionType.ADD_TO_LOADING_LIST:
      return [...state, payload!];
    case ActionType.REMOVE_FROM_LOADING_LIST:
      return state.filter((item) => item !== payload!);
    default:
      return state;
  }
};
