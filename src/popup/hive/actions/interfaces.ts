import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { RootState } from 'src/popup/hive/store/index';
import { ActionType } from './action-type.enum';

export interface ActionPayload<T> {
  readonly type: ActionType;
  readonly payload?: T;
}

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;
