import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import AccountSubMenuItems from '@popup/pages/app-container/settings/accounts/account-sub-menu-items';
import React from 'react';
import accountSubMenu from 'src/__tests__/popup/pages/app-container/settings/accounts/mocks/account-sub-menu';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
const { ariaLabelPage, methods, extraMocks } = accountSubMenu;
describe('account-sub-menu.component tests:\n', () => {
  methods.afterEach;
  beforeEach(async () => {
    await accountSubMenu.beforeEach(<App />);
  });
  it('Must show sub menu items', () => {
    AccountSubMenuItems.forEach((item) => {
      assertion.getByLabelText(alButton.menuPreFix + item.icon);
    });
  });
  it('Must open each sub menu item', async () => {
    const filteredSubMenu = AccountSubMenuItems.filter(
      (item) => item.icon !== Icons.EXPORT,
    );
    for (let i = 0; i < filteredSubMenu.length; i++) {
      const icon = filteredSubMenu[i].icon;
      const ariaLabel = alButton.menuPreFix + icon;
      await clickAwait([ariaLabel]);
      assertion.getByLabelText(ariaLabelPage[i]);
      await clickAwait([alIcon.arrowBack]);
    }
  });
  it('Must call export account action', async () => {
    extraMocks.createObjectURL();
    extraMocks.aClick;
    await clickAwait([alButton.menuPreFix + Icons.EXPORT]);
    expect(extraMocks.spyDownloadAccount).toBeCalledTimes(1);
  });
});
