import { ActionType } from '@popup/actions/action-type.enum';
import {
  LoadingOperation,
  LoadingReducer,
} from '@popup/reducers/loading.reducer';

describe('loading.reducer tests:\n', () => {
  const loadingOperationSample = {
    name: 'INIT',
    done: true,
  } as LoadingOperation;
  const loadingOperationSample2 = {
    name: 'INIT2',
    done: false,
  } as LoadingOperation;
  const loadingOperationSample3 = {
    name: 'INIT3',
    done: true,
  } as LoadingOperation;
  const emptyLoadingOpState = [] as LoadingOperation[];
  const notEmptyLoadingOpState = [loadingOperationSample] as LoadingOperation[];
  const notEmptyLoadingOpState2 = [
    loadingOperationSample,
    loadingOperationSample2,
  ] as LoadingOperation[];
  const notEmptyLoadingOpState3 = [
    loadingOperationSample,
    loadingOperationSample2,
    loadingOperationSample3,
  ] as LoadingOperation[];
  test('Calling ADD_TO_LOADING_LIST with a new loadingOperation, must return the added operation', () => {
    const opName = 'INIT';
    const addToLoadingListAction = {
      type: ActionType.ADD_TO_LOADING_LIST,
      payload: opName,
    };
    const previousState = emptyLoadingOpState;
    expect(LoadingReducer(previousState, addToLoadingListAction)).toEqual([
      { done: false, name: opName },
    ]);
  });
  test('Calling ADD_TO_LOADING_LIST with an existing loadingOperation, must return the found operation with done[false]', () => {
    const opName = 'INIT';
    const addToLoadingListAction = {
      type: ActionType.ADD_TO_LOADING_LIST,
      payload: opName,
    };
    const previousState = notEmptyLoadingOpState;
    expect(LoadingReducer(previousState, addToLoadingListAction)).toEqual([
      { done: false, name: opName },
    ]);
  });
  test('Calling REMOVE_FROM_LOADING_LIST with an existing loadingOperation(one operation not done yet), must return the operation found with done[false]', () => {
    const opName = 'INIT';
    const removeFromLoadingListAction = {
      type: ActionType.REMOVE_FROM_LOADING_LIST,
      payload: opName,
    };
    const previousState = notEmptyLoadingOpState2;
    expect(LoadingReducer(previousState, removeFromLoadingListAction)).toEqual([
      { done: true, name: opName },
      loadingOperationSample2,
    ]);
  });
  test('Calling REMOVE_FROM_LOADING_LIST with an existing loadingOperation(only one operation), must return an empty array', () => {
    const opName = 'INIT';
    const removeFromLoadingListAction = {
      type: ActionType.REMOVE_FROM_LOADING_LIST,
      payload: opName,
    };
    const previousState = notEmptyLoadingOpState;
    expect(LoadingReducer(previousState, removeFromLoadingListAction)).toEqual(
      [],
    );
  });
  test('Calling REMOVE_FROM_LOADING_LIST with an existing loadingOperation(but previous operations done), must return an empty array', () => {
    const opName = 'INIT2';
    const removeFromLoadingListAction = {
      type: ActionType.REMOVE_FROM_LOADING_LIST,
      payload: opName,
    };
    const previousState = notEmptyLoadingOpState3;
    expect(LoadingReducer(previousState, removeFromLoadingListAction)).toEqual(
      [],
    );
  });
  test('Calling LoadingReducer with any other action must return actual state', () => {
    const otherAction = {
      type: ActionType.ADD_CUSTOM_RPC,
    };
    const previousState = notEmptyLoadingOpState3;
    expect(LoadingReducer(previousState, otherAction)).toEqual(
      notEmptyLoadingOpState3,
    );
  });
});
