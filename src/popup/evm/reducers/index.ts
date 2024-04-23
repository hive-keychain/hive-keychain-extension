import EvmAccountsReducer from '@popup/evm/reducers/accounts.reducer';
import EvmActiveAccountReducer from '@popup/evm/reducers/active-account.reducer';
import { combineReducers } from 'redux';

const evmReducers = combineReducers({
  accounts: EvmAccountsReducer,
  activeAccount: EvmActiveAccountReducer,
});

export default evmReducers;
