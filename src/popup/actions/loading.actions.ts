import { ActionType } from '@popup/actions/action-type.enum';

export const addToLoadingList = (item: string) => {
  return {
    type: ActionType.ADD_TO_LOADING_LIST,
    payload: item,
  };
};

export const removeFromLoadingList = (item: string) => {
  return {
    type: ActionType.REMOVE_FROM_LOADING_LIST,
    payload: item,
  };
};
