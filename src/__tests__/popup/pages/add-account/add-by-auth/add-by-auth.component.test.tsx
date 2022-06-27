import App from '@popup/App';
import '@testing-library/jest-dom';
import React from 'react';
import addByAuthMocks from 'src/__tests__/popup/pages/add-account/add-by-auth/mocks/add-by-auth-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  actAdvanceTime,
  clickAwait,
  typeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';
config.useChrome();
jest.setTimeout(10000);

describe('add-by-auth tests:\n', () => {
  beforeEach(async () => {
    jest.useFakeTimers('legacy');
    actAdvanceTime(4300);
    mockPreset.setOrDefault({
      app: { hasStoredAccounts: true },
    });
    renders.wInitialState(<App />, {
      ...initialStates.iniState,
      accounts: accounts.twoAccounts,
    });
    await assertion.awaitMk(mk.user.one);
    await clickAwait([
      alButton.menu,
      alButton.menuSettingsPeople,
      alButton.menuSettingsPersonAdd,
      alButton.addByAuth,
    ]);
  });
  afterEach(() => {
    afterTests.clean();
  });
  it('Must load add by auth page', async () => {
    await assertion.awaitFor(alComponent.addByAuthPage, QueryDOM.BYLABEL);
  });
  it('Must show error trying to add existing account', async () => {
    const errorMessage = mocksImplementation.i18nGetMessageCustom(
      'popup_html_account_already_existing',
    );
    await typeAwait([
      { ariaLabel: alInput.username, text: userData.one.username },
      { ariaLabel: alInput.authorizedAccount, text: 'theghost1980' },
    ]);
    await clickAwait([alButton.submit]);
    await assertion.awaitFor(errorMessage, QueryDOM.BYTEXT);
  });
  it('Must show error if empty username', async () => {
    const errorMessage = mocksImplementation.i18nGetMessageCustom(
      'popup_accounts_fill',
    );
    await typeAwait([
      { ariaLabel: alInput.authorizedAccount, text: 'theghost1980' },
    ]);
    await clickAwait([alButton.submit]);
    await assertion.awaitFor(errorMessage, QueryDOM.BYTEXT);
  });
  it('Must show error if empty authorized account', async () => {
    const errorMessage = mocksImplementation.i18nGetMessageCustom(
      'popup_accounts_fill',
    );
    await typeAwait([{ ariaLabel: alInput.username, text: 'aggroed' }]);
    await clickAwait([alButton.submit]);
    await assertion.awaitFor(errorMessage, QueryDOM.BYTEXT);
  });
  it('Must show error with empty username and authorized account', async () => {
    const errorMessage = mocksImplementation.i18nGetMessageCustom(
      'popup_accounts_fill',
    );
    await clickAwait([alButton.submit]);
    await assertion.awaitFor(errorMessage, QueryDOM.BYTEXT);
  });
  it('Must show error if account not present in local accounts', async () => {
    const account = 'theghost1980';
    const errorMessage = mocksImplementation.i18nGetMessageCustom(
      'popup_no_auth_account',
      [account],
    );
    await typeAwait([
      { ariaLabel: alInput.username, text: 'aggroed' },
      { ariaLabel: alInput.authorizedAccount, text: account },
    ]);
    await clickAwait([alButton.submit]);
    await assertion.awaitFor(errorMessage, QueryDOM.BYTEXT);
  });
  it('Must show error if account not found on hive', async () => {
    const errorMessage = mocksImplementation.i18nGetMessageCustom(
      'popup_accounts_incorrect_user',
    );
    await typeAwait([
      { ariaLabel: alInput.username, text: 'theghost1980' },
      { ariaLabel: alInput.authorizedAccount, text: userData.one.username },
    ]);
    mockPreset.setOrDefault({
      app: { getAccounts: [] },
    });
    await clickAwait([alButton.submit]);
    await assertion.awaitFor(errorMessage, QueryDOM.BYTEXT);
  });
  it('Must show error if account is not authorized', async () => {
    const username = 'theghost1980';
    const authorizedAccount = userData.one.username;
    const errorMessage = mocksImplementation.i18nGetMessageCustom(
      'popup_accounts_no_auth',
      [authorizedAccount, username],
    );
    await typeAwait([
      { ariaLabel: alInput.username, text: username },
      { ariaLabel: alInput.authorizedAccount, text: authorizedAccount },
    ]);
    addByAuthMocks.reMockWith('posting', []);
    await clickAwait([alButton.submit]);
    await assertion.awaitFor(errorMessage, QueryDOM.BYTEXT);
  });
  it('Must add account auth, if valid posting auth, and navigate to settings main page', async () => {
    const username = 'theghost1980';
    const authorizedAccount = userData.one.username;
    await typeAwait([
      { ariaLabel: alInput.username, text: username },
      { ariaLabel: alInput.authorizedAccount, text: authorizedAccount },
    ]);
    addByAuthMocks.reMockWith('posting', [[userData.one.username, 1]]);
    await clickAwait([alButton.submit]);
    await assertion.awaitFor(alComponent.settingsMainPage, QueryDOM.BYLABEL);
  });
  it('Must add account auth, if valid active auth, and navigate to settings main page', async () => {
    const username = 'theghost1980';
    const authorizedAccount = userData.one.username;
    await typeAwait([
      { ariaLabel: alInput.username, text: username },
      { ariaLabel: alInput.authorizedAccount, text: authorizedAccount },
    ]);
    addByAuthMocks.reMockWith('active', [[userData.one.username, 1]]);
    await clickAwait([alButton.submit]);
    await assertion.awaitFor(alComponent.settingsMainPage, QueryDOM.BYLABEL);
  });
});
