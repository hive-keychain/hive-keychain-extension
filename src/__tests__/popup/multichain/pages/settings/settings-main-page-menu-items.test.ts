import { Screen } from '@interfaces/screen.interface';
import { getSettingsMainPageMenuItems } from 'src/popup/multichain/pages/settings/settings-main-page-menu-items';

describe('getSettingsMainPageMenuItems', () => {
  it('uses the unified settings menu order with Hive and EVM settings', () => {
    const menuItems = getSettingsMainPageMenuItems({
      hasEvmAccounts: true,
      hasHiveAccounts: true,
    });

    expect(menuItems.map((item) => item.nextScreen)).toEqual([
      Screen.SETTINGS_CONTACTS,
      Screen.SETTINGS_NETWORK,
      Screen.SETTINGS_CONNECTED_DAPPS,
      Screen.SETTINGS_HIVE,
      Screen.SETTINGS_EVM,
      Screen.SETTINGS_ADVANCED,
      Screen.SETTINGS_PREFERENCES_AND_DISPLAY,
      Screen.SETTINGS_HELP_AND_ABOUT,
    ]);
  });

  it('omits chain-specific settings when user has no Hive or EVM accounts', () => {
    const menuItems = getSettingsMainPageMenuItems({
      hasEvmAccounts: false,
      hasHiveAccounts: false,
    });

    expect(
      menuItems.some((item) => item.nextScreen === Screen.SETTINGS_HIVE),
    ).toBe(false);
    expect(
      menuItems.some((item) => item.nextScreen === Screen.SETTINGS_EVM),
    ).toBe(false);
  });

  it('shows only EVM settings when user has no Hive accounts', () => {
    const menuItems = getSettingsMainPageMenuItems({
      hasEvmAccounts: true,
      hasHiveAccounts: false,
    });

    expect(menuItems.map((item) => item.nextScreen)).toEqual([
      Screen.SETTINGS_CONTACTS,
      Screen.SETTINGS_NETWORK,
      Screen.SETTINGS_CONNECTED_DAPPS,
      Screen.SETTINGS_EVM,
      Screen.SETTINGS_ADVANCED,
      Screen.SETTINGS_PREFERENCES_AND_DISPLAY,
      Screen.SETTINGS_HELP_AND_ABOUT,
    ]);
  });

  it('shows only Hive settings when user has no EVM accounts', () => {
    const menuItems = getSettingsMainPageMenuItems({
      hasEvmAccounts: false,
      hasHiveAccounts: true,
    });

    expect(menuItems.map((item) => item.nextScreen)).toEqual([
      Screen.SETTINGS_CONTACTS,
      Screen.SETTINGS_NETWORK,
      Screen.SETTINGS_CONNECTED_DAPPS,
      Screen.SETTINGS_HIVE,
      Screen.SETTINGS_ADVANCED,
      Screen.SETTINGS_PREFERENCES_AND_DISPLAY,
      Screen.SETTINGS_HELP_AND_ABOUT,
    ]);
  });

  it('places preferences and display above help and about', () => {
    const menuItems = getSettingsMainPageMenuItems({
      hasEvmAccounts: false,
      hasHiveAccounts: false,
    });

    const preferencesIndex = menuItems.findIndex(
      (item) => item.nextScreen === Screen.SETTINGS_PREFERENCES_AND_DISPLAY,
    );
    const helpIndex = menuItems.findIndex(
      (item) => item.nextScreen === Screen.SETTINGS_HELP_AND_ABOUT,
    );

    expect(preferencesIndex).toBe(helpIndex - 1);
    expect(menuItems[preferencesIndex].label).toBe(
      'popup_html_preferences_and_display',
    );
  });
});
