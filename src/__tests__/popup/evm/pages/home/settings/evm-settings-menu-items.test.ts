import { Screen } from '@interfaces/screen.interface';
import { getSettingsMainPageMenuItems } from 'src/popup/multichain/pages/settings/settings-main-page-menu-items';

describe('getSettingsMainPageMenuItems', () => {
  it('uses the unified settings menu order', () => {
    const menuItems = getSettingsMainPageMenuItems({
      hasEvmAccounts: true,
      hasHiveAccounts: true,
    });

    expect(menuItems.map((item) => item.nextScreen ?? item.label)).toEqual([
      Screen.SETTINGS_CONTACTS,
      Screen.SETTINGS_NETWORK,
      Screen.SETTINGS_CONNECTED_DAPPS,
      Screen.SETTINGS_PREFERENCES_AND_DISPLAY,
      Screen.SETTINGS_CHAIN_SETTINGS,
      Screen.SETTINGS_ADVANCED,
      Screen.SETTINGS_HELP_AND_ABOUT,
    ]);
  });

  it('omits chain settings when user has no Hive or EVM accounts', () => {
    const menuItems = getSettingsMainPageMenuItems({
      hasEvmAccounts: false,
      hasHiveAccounts: false,
    });

    expect(
      menuItems.some(
        (item) => item.nextScreen === Screen.SETTINGS_CHAIN_SETTINGS,
      ),
    ).toBe(false);
  });

  it('hides chain-specific settings when no account exists for that chain', () => {
    const menuItems = getSettingsMainPageMenuItems({
      hasEvmAccounts: true,
      hasHiveAccounts: false,
    });

    expect(menuItems.map((item) => item.nextScreen ?? item.label)).toEqual([
      Screen.SETTINGS_CONTACTS,
      Screen.SETTINGS_NETWORK,
      Screen.SETTINGS_CONNECTED_DAPPS,
      Screen.SETTINGS_PREFERENCES_AND_DISPLAY,
      Screen.SETTINGS_CHAIN_SETTINGS,
      Screen.SETTINGS_ADVANCED,
      Screen.SETTINGS_HELP_AND_ABOUT,
    ]);
  });
});
