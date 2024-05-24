import EvmAccountsReducer from '@popup/evm/reducers/accounts.reducer';
import EvmActiveAccountReducer from '@popup/evm/reducers/active-account.reducer';
import { AppStatusReducer } from '@popup/evm/reducers/app-status.reducer';
import { EvmPricesReducer } from '@popup/evm/reducers/prices.reducer';
import { combineReducers } from 'redux';

const evmReducers = combineReducers({
  accounts: EvmAccountsReducer,
  activeAccount: EvmActiveAccountReducer,
  appStatus: AppStatusReducer,
  prices: EvmPricesReducer,
});

export default evmReducers;
