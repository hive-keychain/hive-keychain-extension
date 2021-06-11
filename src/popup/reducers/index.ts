import { combineReducers } from "redux";
import { accountReducer } from "./account.reducer";
import { mkReducer } from "./mk.reducer";
import test from "./test";

export default combineReducers({
  testMsg: test,
  mk: mkReducer,
  accounts: accountReducer
});
