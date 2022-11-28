import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import { HBDDropdownMenuItems } from '@popup/pages/app-container/home/wallet-info-section/wallet-info-dropdown-menus.list';
import '@testing-library/jest-dom';
import React from 'react';
import home from 'src/__tests__/popup/pages/app-container/home/mocks/home/home';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alDropdown from 'src/__tests__/utils-for-testing/aria-labels/al-dropdown';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('home.component dropdown hbd tests:\n', () => {
  beforeEach(async () => {
    await home.beforeEach(<App />, accounts.twoAccounts);
    await clickAwait([alDropdown.arrow.hbd]);
  });
  afterEach(() => {
    afterTests.clean();
  });

  it('Must open each menu item', async () => {
    const hbdDropdownLabelPage = [
      {
        ariaLabelPreFixed:
          alDropdown.walletInfo.preFix +
          HBDDropdownMenuItems.filter((item) => item.icon === Icons.SEND)[0]
            .icon,
        pageComponent: alComponent.transfersFundsPage,
      },
      {
        ariaLabelPreFixed:
          alDropdown.walletInfo.preFix +
          HBDDropdownMenuItems.filter((item) => item.icon === Icons.CONVERT)[0]
            .icon,
        pageComponent: alComponent.conversionPage,
      },
      {
        ariaLabelPreFixed:
          alDropdown.walletInfo.preFix +
          HBDDropdownMenuItems.filter((item) => item.icon === Icons.SAVINGS)[0]
            .icon,
        pageComponent: alComponent.savingsPage,
      },
    ];

    for (let i = 0; i < hbdDropdownLabelPage.length; i++) {
      const { ariaLabelPreFixed, pageComponent } = hbdDropdownLabelPage[i];
      await clickAwait([ariaLabelPreFixed]);
      assertion.getByLabelText(pageComponent);
      await clickAwait([alIcon.closePage]);
      await clickAwait([alDropdown.arrow.hbd]);
    }
  });
});
