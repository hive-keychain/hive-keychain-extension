import { PrivateKeyType } from '@interfaces/keys.interface';
import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload } from '@popup/actions/interfaces';

export interface LoadingOperation {
  name: string;
  operationParams?: string[];
  hideDots?: boolean;
  done: boolean;
}

export interface LoadingState {
  loadingOperations: LoadingOperation[];
  caption?: string;
}

export interface LoadingPayload {
  operation: string;
  operationParams?: string[];
  hideDots?: boolean;
  privateKeyType?: PrivateKeyType;
}

export const LoadingReducer = (
  state: LoadingState = { loadingOperations: [], caption: undefined },
  { type, payload }: ActionPayload<LoadingPayload>,
): LoadingState => {
  switch (type) {
    case ActionType.ADD_TO_LOADING_LIST:
      if (
        state.loadingOperations.find(
          (loadingItem) => loadingItem.name === payload?.operation,
        )
      ) {
        const newState = { loadingOperations: [...state.loadingOperations] };
        for (let loadingOperation of newState.loadingOperations) {
          if (loadingOperation.name === payload?.operation) {
            loadingOperation.done = false;
          }
        }
        return newState;
      } else {
        const newState: LoadingState = {
          loadingOperations: [...state.loadingOperations],
        };
        newState.loadingOperations.push({
          name: payload!.operation!,
          operationParams: payload!.operationParams,
          hideDots: payload!.hideDots,
          done: false,
        });
        if (
          payload?.privateKeyType &&
          payload.privateKeyType === PrivateKeyType.LEDGER
        ) {
          newState.caption = 'popup_html_validate_transaction_on_ledger';
        }
        return newState;
      }

    case ActionType.REMOVE_FROM_LOADING_LIST:
      const newState: LoadingState = {
        loadingOperations: [...state.loadingOperations],
      };
      for (let loadingOperation of newState.loadingOperations) {
        if (loadingOperation.name === payload?.operation) {
          loadingOperation.done = true;
        }
      }

      return newState.loadingOperations.some(
        (loadingOperation) => loadingOperation.done === false,
      )
        ? newState
        : { loadingOperations: [], caption: undefined };
    default:
      return state;
  }
};
