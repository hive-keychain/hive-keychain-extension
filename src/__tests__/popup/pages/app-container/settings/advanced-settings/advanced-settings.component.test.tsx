import App from '@popup/App';
import React from 'react';
import advanceSettings from 'src/__tests__/popup/pages/app-container/settings/advanced-settings/mocks/advance-settings';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('advanced-settings.component tests:\n', () => {
  const { methods, constants, menuPages } = advanceSettings;
  const { menuItems } = constants;
  methods.afterEach;
  beforeEach(async () => {
    await advanceSettings.beforeEach(<App />);
  });
  it('Must load advance settings items', () => {
    for (let i = 0; i < menuItems.advanceSettings.length; i++) {
      assertion.getByLabelText(
        alButton.menuPreFix + menuItems.advanceSettings[i].icon,
      );
    }
  });
  it('Must open each menu page', async () => {
    for (let i = 0; i < menuItems.advanceSettings.length; i++) {
      const arialLabel =
        alButton.menuPreFix + menuItems.advanceSettings[i].icon;
      await clickAwait([arialLabel]);
      await assertion.awaitFor(menuPages[i].ariaLabel, QueryDOM.BYLABEL);
      await clickAwait([alIcon.arrowBack]);
      await assertion.awaitFor(alComponent.settingsPage, QueryDOM.BYLABEL);
    }
  });
});
