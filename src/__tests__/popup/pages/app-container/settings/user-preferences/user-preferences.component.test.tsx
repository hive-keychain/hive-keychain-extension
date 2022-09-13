import UserPreferencesMenuItems from '@popup/pages/app-container/settings/user-preferences/user-preferences-menu-items';
import userPreferences from 'src/__tests__/popup/pages/app-container/settings/user-preferences/mocks/user-preferences';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('user-preferences.component tests:\n', () => {
  let _asFragment: () => DocumentFragment;
  const { methods, constants } = userPreferences;
  const { menuPage } = constants;
  methods.afterEach;
  beforeEach(async () => {
    _asFragment = await userPreferences.beforeEach();
  });
  it('Must load each menu items', () => {
    UserPreferencesMenuItems.forEach((item) => {
      assertion.getByLabelText(alButton.menuPreFix + item.icon);
    });
  });
  it('Must open each menu item', async () => {
    for (let i = 0; i < menuPage.length; i++) {
      const menuButton = alButton.menuPreFix + menuPage[i].icon;
      await clickAwait([menuButton]);
      await assertion.awaitFor(menuPage[i].pageAriaLabel, QueryDOM.BYLABEL);
      await clickAwait([alIcon.arrowBack]);
    }
  });
});
