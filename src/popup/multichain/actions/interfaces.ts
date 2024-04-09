import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { RootState } from '@popup/multichain/store/index';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { HiveActionType } from '../../hive/actions/action-type.enum';

export interface ActionPayload<T> {
  readonly type: HiveActionType | MultichainActionType;
  readonly payload?: T;
}

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;
