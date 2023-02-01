import { PrivateKeyType } from '@interfaces/keys.interface';
import { ActionType } from '@popup/actions/action-type.enum';

export const addToLoadingList = (
  operation: string,
  privateKeyType?: PrivateKeyType,
) => {
  return {
    type: ActionType.ADD_TO_LOADING_LIST,
    payload: { operation: operation, privateKeyType: privateKeyType },
  };
};

export const removeFromLoadingList = (operation: string) => {
  return {
    type: ActionType.REMOVE_FROM_LOADING_LIST,
    payload: { operation: operation },
  };
};
