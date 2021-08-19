import { ActiveAccountReducer } from '@popup/reducers/active-account.reducer';
import { ActiveRpcReducer } from '@popup/reducers/active-rpc.reducer';
import BittrexReducer from '@popup/reducers/bittrex.reducer';
import { combineReducers } from 'redux';
import { AccountReducer } from './account.reducer';
import { MessageReducer } from './message.reducer';
import { MkReducer } from './mk.reducer';
import { NavigationReducer } from './navigation.reducer';

export default combineReducers({
  mk: MkReducer,
  accounts: AccountReducer,
  activeAccount: ActiveAccountReducer,
  errorMessage: MessageReducer,
  navigation: NavigationReducer,
  activeRpc: ActiveRpcReducer,
  bittrex: BittrexReducer,
});
