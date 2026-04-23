import { LocalAccount } from '@interfaces/local-account.interface';
import { Screen } from '@interfaces/screen.interface';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { waitFor } from '@testing-library/react';
import { ReactElement } from 'react';
import { Store } from 'redux';
import accountsFixture from 'src/__tests__/utils-for-testing/data/accounts';
import {
  LoadingValuesConfiguration,
  TestsAppLoadingValues,
  TestsConfigureModules,
} from 'src/__tests__/utils-for-testing/loading-values-configuration/loading-values-configuration';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { RootState } from 'src/popup/multichain/store';

/**
 * Mirrors `initApplication` account load + `selectComponent` in HiveApp (empty nav stack).
 * Uses the same AccountUtils mock defaults as LoadingValuesConfiguration.
 */
export function getExpectedScreenAfterHiveAppInit(
  initialState: RootState,
  params?: { app?: TestsAppLoadingValues },
): Screen {
  const mk = initialState.mk ?? '';
  const hasStoredAccounts =
    params?.app?.accountsRelated?.AccountUtils?.hasStoredAccounts ?? true;

  let accountsFromStorage: LocalAccount[] = [];
  if (hasStoredAccounts && mk) {
    accountsFromStorage =
      (params?.app?.accountsRelated?.AccountUtils
        ?.getAccountsFromLocalStorage as LocalAccount[]) ??
      accountsFixture.twoAccounts;
  }

  const hasFinishedSignup = initialState.hasFinishedSignup;

  if (mk && mk.length > 0 && accountsFromStorage.length > 0) {
    return Screen.HOME_PAGE;
  }
  if (mk && mk.length > 0) {
    return Screen.ACCOUNT_PAGE_INIT_ACCOUNT;
  }
  if (
    mk &&
    mk.length === 0 &&
    accountsFromStorage.length === 0 &&
    !hasFinishedSignup
  ) {
    return Screen.SIGN_UP_PAGE;
  }
  return Screen.SIGN_IN_PAGE;
}

/**
 * Belongs to: E2E testing.
 * It will render the component using:
 * initialState: initial Redux state wanted for the app.
 * Params:
 *  1. modules: Configure/add/update modules needed before loading.
 *  2. app: All values needed when loading the app that will affect the state & app behaviour.
 * @see Important: ->> If no params, the function will load default values on app state.
 */
const renderWithConfiguration = async (
  reactComponent: ReactElement,
  initialState: RootState,
  params?: {
    modules?: TestsConfigureModules;
    app?: TestsAppLoadingValues;
    /** Override first screen when initial state is unusual (e.g. pre-seeded navigation stack). */
    expectedScreenAfterInit?: Screen;
    /** HiveApp mounts with `navigateTo(HOME)`; dispatch this after init to open inner screens without removed action buttons. */
    navigateToAfterMount?: Screen;
  },
): Promise<Store<RootState>> => {
  LoadingValuesConfiguration.set(params);
  const { store } = customRender(reactComponent, {
    initialState: initialState,
  });
  //Necessary line bellow. It will wait for promises/timers to execute and render after all async processes.
  //Reference: https://github.com/jestjs/jest/issues/2157#issuecomment-279171856
  await waitFor(() => {});
  const expectedScreen =
    params?.expectedScreenAfterInit ??
    getExpectedScreenAfterHiveAppInit(initialState, params);
  await waitFor(
    () => {
      expect(store.getState().navigation.stack[0]?.currentPage).toBe(
        expectedScreen,
      );
    },
    { timeout: 15000 },
  );
  if (params?.navigateToAfterMount) {
    store.dispatch(navigateTo(params.navigateToAfterMount));
    await waitFor(() => {
      expect(store.getState().navigation.stack[0]?.currentPage).toBe(
        params.navigateToAfterMount,
      );
    });
  }
  return store;
};
//
const reactTestingLibrary = { renderWithConfiguration };

export default reactTestingLibrary;
