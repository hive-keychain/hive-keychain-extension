import App from '@popup/App';
import '@testing-library/jest-dom';
import React from 'react';
import home from 'src/__tests__/popup/pages/app-container/home/mocks/home/home';
import alDropdown from 'src/__tests__/utils-for-testing/aria-labels/al-dropdown';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('home.component dropdown hp tests:\n', () => {
  const { hpDropdownLabelPage } = home;
  beforeEach(async () => {
    await home.beforeEach(<App />, accounts.twoAccounts);
    await clickAwait([alDropdown.arrow.hp]);
  });
  afterEach(() => {
    afterTests.clean();
  });
  it('Must open each page when clicking on menu item', async () => {
    for (let i = 0; i < hpDropdownLabelPage.length; i++) {
      const { ariaLabelPreFixed, pageComponent } = hpDropdownLabelPage[i];
      await clickAwait([ariaLabelPreFixed]);
      assertion.getByLabelText(pageComponent);
      await clickAwait([alIcon.closePage]);
      await clickAwait([alDropdown.arrow.hp]);
    }
  });
});
