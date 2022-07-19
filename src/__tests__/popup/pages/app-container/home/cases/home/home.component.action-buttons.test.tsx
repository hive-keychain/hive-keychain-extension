import App from '@popup/App';
import '@testing-library/jest-dom';
import React from 'react';
import home from 'src/__tests__/popup/pages/app-container/home/mocks/home/home';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  actRunAllTimers,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
const { extraMocks } = home;
describe('home.component action-buttons tests:\n', () => {
  beforeEach(async () => {
    await home.beforeEach(<App />, accounts.twoAccounts);
  });
  afterEach(() => {
    afterTests.clean();
  });
  it('Must open transfer funds page when clicking on send', async () => {
    await clickAwait([alButton.actionBtn.send]);
    assertion.getByLabelText(alComponent.transfersFundsPage);
  });
  it('Must show wallet history when clicking on history', async () => {
    home.extraMocks.getLastTransaction();
    await clickAwait([alButton.actionBtn.history]);
    actRunAllTimers();
    await assertion.awaitFor(alComponent.walletItemList, QueryDOM.BYLABEL);
  });
  it('Must show tokens page when clicking on tokens', async () => {
    await clickAwait([alButton.actionBtn.tokens]);
    actRunAllTimers();
    await assertion.awaitFor(alComponent.userTokens, QueryDOM.BYLABEL);
  });
  it('Must show governance page when clicking on governance', async () => {
    await clickAwait([alButton.actionBtn.governance]);
    actRunAllTimers();
    assertion.getByLabelText(alComponent.governancePage);
  });
});
