import { PrivateKeyType } from '@interfaces/keys.interface';
import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { ActionPayload } from '@popup/multichain/actions/interfaces';

export interface LoadingOperation {
  name: string;
  operationParams?: string[];
  hideDots?: boolean;
  done: boolean;
  closable?: boolean;
}

export interface LoadingState {
  loadingOperations: LoadingOperation[];
  caption?: string;
  loadingPercentage?: number;
}

export interface LoadingPayload {
  operation: string;
  operationParams?: string[];
  hideDots?: boolean;
  closable?: boolean;
  privateKeyType?: PrivateKeyType;
}

export interface SetCaptionPayload {
  caption: string;
}

export interface SetLoadingPercentagePayload {
  loadingPercentage: number;
}

export const LoadingReducer = (
  state: LoadingState = { loadingOperations: [], caption: undefined },
  {
    type,
    payload,
  }: ActionPayload<
    LoadingPayload | SetCaptionPayload | SetLoadingPercentagePayload
  >,
): LoadingState => {
  switch (type) {
    case MultichainActionType.ADD_TO_LOADING_LIST: {
      const loadingPayload = payload as LoadingPayload;
      if (
        state.loadingOperations.find(
          (loadingItem) => loadingItem.name === loadingPayload?.operation,
        )
      ) {
        const newState = { loadingOperations: [...state.loadingOperations] };
        for (let loadingOperation of newState.loadingOperations) {
          if (loadingOperation.name === loadingPayload?.operation) {
            loadingOperation.done = false;
          }
        }
        return newState;
      } else {
        const newState: LoadingState = {
          loadingOperations: [...state.loadingOperations],
          caption: state.caption,
        };
        newState.loadingOperations.push({
          name: loadingPayload!.operation!,
          operationParams: loadingPayload!.operationParams,
          hideDots: loadingPayload!.hideDots,
          closable: loadingPayload!.closable,
          done: false,
        });
        if (
          loadingPayload?.privateKeyType &&
          loadingPayload.privateKeyType === PrivateKeyType.LEDGER
        ) {
          newState.caption = 'popup_html_validate_transaction_on_ledger';
        }
        return newState;
      }
    }

    case MultichainActionType.REMOVE_FROM_LOADING_LIST: {
      const loadingPayload = payload as LoadingPayload;
      const newState: LoadingState = {
        loadingOperations: [...state.loadingOperations],
        caption: state.caption,
        loadingPercentage: state.loadingPercentage,
      };
      for (let loadingOperation of newState.loadingOperations) {
        if (loadingOperation.name === loadingPayload?.operation) {
          loadingOperation.done = true;
        }
      }

      return newState.loadingOperations.some(
        (loadingOperation) => loadingOperation.done === false,
      )
        ? newState
        : {
            loadingOperations: [],
            caption: undefined,
            loadingPercentage: undefined,
          };
    }
    case MultichainActionType.ADD_CAPTION_TO_LOADING_PAGE: {
      const setCaptionPayload = payload as SetCaptionPayload;
      const newState: LoadingState = {
        loadingOperations: [...state.loadingOperations],
        caption: setCaptionPayload.caption,
        loadingPercentage: state.loadingPercentage,
      };
      return newState;
    }
    case MultichainActionType.ADD_LOADING_PERCENTAGE: {
      const setLoadingPercentagePayload =
        payload as SetLoadingPercentagePayload;
      const newState: LoadingState = {
        loadingOperations: [...state.loadingOperations],
        caption: state.caption,
        loadingPercentage: setLoadingPercentagePayload.loadingPercentage,
      };
      return newState;
    }
    default:
      return state;
  }
};
