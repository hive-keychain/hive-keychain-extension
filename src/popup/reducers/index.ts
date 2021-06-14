import { combineReducers } from "redux";
import { AccountReducer } from "./account.reducer";
import { ErrorMessageReducer } from "./error-message.reducer";
import { MkReducer } from "./mk.reducer";
import { NavigationReducer } from "./navigation.reducer";

export default combineReducers({
  mk: MkReducer,
  accounts: AccountReducer,
  errorMessage: ErrorMessageReducer,
  navigation: NavigationReducer
});
