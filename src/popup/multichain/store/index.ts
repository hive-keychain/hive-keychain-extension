import { LocalAccount } from '@interfaces/local-account.interface';
import { setHasFinishedSignup } from '@popup/multichain/actions/has-finished-signup.actions';
import reducers from '@popup/multichain/reducers';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import ActiveAccountUtils from 'src/popup/hive/utils/active-account.utils';
import MkUtils from 'src/popup/hive/utils/mk.utils';
import RpcUtils from 'src/popup/hive/utils/rpc.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

/* istanbul ignore next */
const store = createStore(
  reducers,
  /* preloadedState, */ applyMiddleware(thunk),
);

if (store.getState().hive) {
  let previousAccounts = store.getState().hive.accounts as LocalAccount[];
  let previousRpc = store.getState().hive.activeRpc;
  let previousActiveAccountName = store.getState().hive.activeAccount?.name;
  let previousMk = store.getState().mk;
  let previousHiveEngineConfig = store.getState().hive.hiveEngineConfig;

  /* istanbul ignore next */

  store.subscribe(() => {
    const {
      mk,
      hive: { accounts, activeRpc, activeAccount, hiveEngineConfig },
      hasFinishedSignup,
    } = store.getState();
    if (!AccountUtils.isAccountListIdentical(previousAccounts, accounts)) {
      if (
        previousAccounts.length === 0 &&
        previousAccounts.length !== accounts.length &&
        !hasFinishedSignup
      ) {
        LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.HAS_FINISHED_SIGNUP,
          true,
        );
        store.dispatch(setHasFinishedSignup(true));
        // AnalyticsUtils.sendAddFirstAccountEvent();
      }
      previousAccounts = accounts;
      if (accounts.length !== 0) {
        AccountUtils.saveAccounts(accounts, mk);
      }
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
}

export { store };

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
