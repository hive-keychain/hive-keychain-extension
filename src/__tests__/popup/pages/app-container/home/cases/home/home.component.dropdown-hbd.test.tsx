import App from '@popup/App';
import '@testing-library/jest-dom';
import React from 'react';
import home from 'src/__tests__/popup/pages/app-container/home/mocks/home/home';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alDropdown from 'src/__tests__/utils-for-testing/aria-labels/al-dropdown';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('home.component dropdown hbd tests:\n', () => {
  beforeEach(async () => {
    await home.beforeEach(<App />, accounts.twoAccounts);
  });
  afterEach(() => {
    afterTests.clean();
  });
  it('Must open transfer funds page when clicking on send hbd', async () => {
    await clickAwait([alDropdown.arrow.hbd, alDropdown.span.send]);
    assertion.getByLabelText(alComponent.transfersFundsPage);
  });
  it('Must show convert page when clicking convert', async () => {
    await clickAwait([alDropdown.arrow.hbd, alDropdown.span.convert]);
    assertion.getByLabelText(alComponent.conversionPage);
  });
  it('Must show hbd savings page when clicking savings', async () => {
    await clickAwait([alDropdown.arrow.hbd, alDropdown.span.savings]);
    assertion.getByLabelText(alComponent.savingsPage);
  });
});
