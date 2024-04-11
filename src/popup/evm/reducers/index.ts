import EvmAccountsReducer from '@popup/evm/reducers/accounts.reducer';
import { combineReducers } from 'redux';

const evmReducers = combineReducers({ accounts: EvmAccountsReducer });

export default evmReducers;
