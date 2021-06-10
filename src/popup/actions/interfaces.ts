import { RootState } from "@popup/store/index";
import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";

export interface actionPayload<T> {
  readonly type: string;
  readonly payload?: T;
}

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;
