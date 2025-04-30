import { PrivateKeyType } from '@interfaces/keys.interface';
import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';

export const addToLoadingList = (
  operation: string,
  privateKeyType?: PrivateKeyType,
  operationParams?: string[],
  hideDots?: boolean,
  closable?: boolean,
) => {
  return {
    type: MultichainActionType.ADD_TO_LOADING_LIST,
    payload: {
      operation: operation,
      operationParams: operationParams,
      privateKeyType: privateKeyType,
      hideDots: hideDots,
      closable,
    },
  };
};

export const removeFromLoadingList = (operation: string) => {
  return {
    type: MultichainActionType.REMOVE_FROM_LOADING_LIST,
    payload: { operation: operation },
  };
};

export const addCaptionToLoading = (caption: string) => {
  return {
    type: MultichainActionType.ADD_CAPTION_TO_LOADING_PAGE,
    payload: { caption: caption },
  };
};

export const setLoadingPercentage = (percentage: number) => {
  return {
    type: MultichainActionType.ADD_LOADING_PERCENTAGE,
    payload: { loadingPercentage: percentage },
  };
};
