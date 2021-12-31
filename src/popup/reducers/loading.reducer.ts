import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload } from '@popup/actions/interfaces';

export interface LoadingOperation {
  name: string;
  done: boolean;
}

export const LoadingReducer = (
  state: LoadingOperation[] = [],
  { type, payload }: ActionPayload<string>,
): LoadingOperation[] => {
  switch (type) {
    case ActionType.ADD_TO_LOADING_LIST:
      return [...state, { name: payload!, done: false }];
    case ActionType.REMOVE_FROM_LOADING_LIST:
      const newState = [...state];
      for (let loadingOperation of newState) {
        if (loadingOperation.name === payload) {
          loadingOperation.done = true;
        }
      }

      return newState.some(
        (loadingOperation) => loadingOperation.done === false,
      )
        ? newState
        : [];
    default:
      return state;
  }
};
