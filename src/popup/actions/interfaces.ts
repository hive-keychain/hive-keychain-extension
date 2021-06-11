import { RootState } from "@popup/store/index";
import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import { ActionType } from "./action-type.enum";

export interface actionPayload<T> {
  readonly type: ActionType;
  readonly payload?: T;
}

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;
