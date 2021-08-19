import reducers from '@popup/reducers';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
// import {composeWithDevTools} from 'remote-redux-devtools';
import AccountUtils from 'src/utils/account.utils';
import RpcUtils from 'src/utils/rpc.utils';

// const composeEnhancers = composeWithDevTools({
//   realtime: true,
//   port: 8000,
// });
const store = createStore(
  reducers,
  /* preloadedState, */ applyMiddleware(thunk),
);

let previousAccounts = store.getState().accounts;
let previousRpc = store.getState().activeRpc;
store.subscribe(() => {
  const { accounts, mk, navigation, activeAccount, activeRpc, bittrex } =
    store.getState();
  console.log(navigation, mk, accounts, activeAccount, activeRpc, bittrex);
  if (!AccountUtils.isAccountListIdentical(previousAccounts, accounts)) {
    previousAccounts = accounts;
    if (accounts.length > 0) {
      AccountUtils.saveAccounts(accounts, mk);
    }
  }
  if (previousRpc && previousRpc.uri !== activeRpc?.uri && activeRpc) {
    RpcUtils.saveCurrentRpc(activeRpc);
  }
});

export { store };

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
