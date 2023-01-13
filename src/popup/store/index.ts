import reducers from '@popup/reducers';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
// import {composeWithDevTools} from 'remote-redux-devtools';
import AccountUtils from 'src/utils/account.utils';
import ActiveAccountUtils from 'src/utils/active-account.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import MkUtils from 'src/utils/mk.utils';
import RpcUtils from 'src/utils/rpc.utils';

// const composeEnhancers = composeWithDevTools({
//   realtime: true,
//   port: 8000,
// });
/* istanbul ignore next */
const store = createStore(
  reducers,
  /* preloadedState, */ applyMiddleware(thunk),
);

let previousAccounts = store.getState().accounts;
let previousRpc = store.getState().activeRpc;
let previousActiveAccountName = store.getState().activeAccount?.name;
let previousMk = store.getState().mk;
let previousHiveEngineConfig = store.getState().hiveEngineConfig;
/* istanbul ignore next */
store.subscribe(() => {
  const { accounts, mk, activeRpc, activeAccount, hiveEngineConfig } =
    store.getState();
  if (!AccountUtils.isAccountListIdentical(previousAccounts, accounts)) {
    previousAccounts = accounts;
    AccountUtils.saveAccounts(accounts, mk);
  }
  if (previousRpc && previousRpc.uri !== activeRpc?.uri && activeRpc) {
    previousRpc = activeRpc;
    RpcUtils.saveCurrentRpc(activeRpc);
  }
  if (activeAccount && previousActiveAccountName !== activeAccount.name) {
    previousActiveAccountName = activeAccount.name;
    ActiveAccountUtils.saveActiveAccountNameInLocalStorage(
      activeAccount.name as string,
    );
  }
  if (previousMk !== mk) {
    previousMk = mk;
    MkUtils.saveMkInLocalStorage(mk);
  }
  if (
    previousHiveEngineConfig &&
    hiveEngineConfig &&
    (previousHiveEngineConfig.accountHistoryApi !==
      hiveEngineConfig.accountHistoryApi ||
      previousHiveEngineConfig.rpc !== hiveEngineConfig.rpc)
  ) {
    previousHiveEngineConfig = hiveEngineConfig;
    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.HIVE_ENGINE_ACTIVE_CONFIG,
      hiveEngineConfig,
    );
  }
});

export { store };

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
