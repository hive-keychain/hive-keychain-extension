import evmReducers from '@popup/evm/reducers';
import hiveReducers from '@popup/hive/reducers';
import { HasFinishedSignupReducer } from '@popup/multichain/reducers/has-finished-signup.reducer';
import { LoadingReducer } from '@popup/multichain/reducers/loading.reducer';
import { MessageReducer } from '@popup/multichain/reducers/message.reducer';
import { MkReducer } from '@popup/multichain/reducers/mk.reducer';
import { NavigationReducer } from '@popup/multichain/reducers/navigation.reducer';
import { TitleContainerReducer } from '@popup/multichain/reducers/title-container.reducer';
import { combineReducers } from 'redux';

export default combineReducers({
  mk: MkReducer,
  errorMessage: MessageReducer,
  navigation: NavigationReducer,
  loading: LoadingReducer,
  titleContainer: TitleContainerReducer,
  hive: hiveReducers,
  evm: evmReducers,
  hasFinishedSignup: HasFinishedSignupReducer,
});
