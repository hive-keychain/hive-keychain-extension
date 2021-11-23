import { ActionType } from '@popup/actions/action-type.enum';

export const setLoading = (value: boolean) => {
  return {
    type: ActionType.SET_LOADING,
    payload: value,
  };
};
