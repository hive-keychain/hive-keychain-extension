import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import React from 'react';
import settings from 'src/__tests__/popup/pages/app-container/settings/mocks/settings';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
const { menuPages, constants, methods } = settings;
const { menuItems } = constants;
describe('account-sub-menu.component tests:\n', () => {
  methods.afterEach;
  beforeEach(async () => {
    await settings.beforeEach(<App />);
  });
  it('Must show all menu items', () => {
    menuItems.settings.forEach((menuItem) => {
      assertion.getByLabelText(alButton.menuPreFix + menuItem.icon);
    });
  });
  it('Must open each menu item', async () => {
    for (let i = 0; i < menuItems.settingsFiltered.length; i++) {
      const menuIcon = menuItems.settingsFiltered[i].icon;
      const ariaLabelPage = menuPages.filter(
        (menu) => menu.icon === menuIcon,
      )[0].ariaLabel;
      await clickAwait([alButton.menuPreFix + menuIcon]);
      assertion.getByLabelText(ariaLabelPage);
      await clickAwait([alIcon.arrowBack]);
    }
  });
  it('Must open a new window when clicking support', async () => {
    await clickAwait([alButton.menuPreFix + Icons.SUPPORT]);
    expect(methods.spyChromeTabs()).toBeCalledWith(menuItems.urlSupport);
  });
});