import reducers from '@popup/reducers';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
// import {composeWithDevTools} from 'remote-redux-devtools';
import AccountUtils from 'src/utils/account.utils';
import ActiveAccountUtils from 'src/utils/active-account.utils';
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
let previousActiveAccountName = store.getState().activeAccount?.name;

store.subscribe(() => {
  const { accounts, mk, activeRpc, activeAccount } = store.getState();
  if (!AccountUtils.isAccountListIdentical(previousAccounts, accounts)) {
    previousAccounts = accounts;
    AccountUtils.saveAccounts(accounts, mk);
  }
  if (previousRpc && previousRpc.uri !== activeRpc?.uri && activeRpc) {
    RpcUtils.saveCurrentRpc(activeRpc);
  }
  if (activeAccount && previousActiveAccountName !== activeAccount.name) {
    ActiveAccountUtils.saveActiveAccountNameInLocalStorage(
      activeAccount.name as string,
    );
  }
});

export { store };

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
