import { Screen } from '@interfaces/screen.interface';
import { Theme } from '@popup/theme.context';
import { getSettingsMainPageMenuItems } from 'src/popup/multichain/pages/settings/settings-main-page-menu-items';

describe('getSettingsMainPageMenuItems', () => {
  const toggleTheme = jest.fn();

  beforeEach(() => {
    toggleTheme.mockClear();
  });

  it('uses the unified settings menu order with Hive and EVM settings', () => {
    const menuItems = getSettingsMainPageMenuItems({
      hasEvmAccounts: true,
      hasHiveAccounts: true,
      theme: Theme.LIGHT,
      toggleTheme,
    });

    expect(menuItems.map((item) => item.nextScreen ?? item.label)).toEqual([
      Screen.SETTINGS_CONTACTS,
      Screen.SETTINGS_NETWORK,
      Screen.SETTINGS_CONNECTED_DAPPS,
      Screen.SETTINGS_HIVE,
      Screen.SETTINGS_EVM,
      Screen.SETTINGS_ADVANCED,
      'popup_html_theme',
      Screen.SETTINGS_HELP_AND_ABOUT,
    ]);
  });

  it('omits chain-specific settings when user has no Hive or EVM accounts', () => {
    const menuItems = getSettingsMainPageMenuItems({
      hasEvmAccounts: false,
      hasHiveAccounts: false,
      theme: Theme.LIGHT,
      toggleTheme,
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
      theme: Theme.LIGHT,
      toggleTheme,
    });

    expect(menuItems.map((item) => item.nextScreen ?? item.label)).toEqual([
      Screen.SETTINGS_CONTACTS,
      Screen.SETTINGS_NETWORK,
      Screen.SETTINGS_CONNECTED_DAPPS,
      Screen.SETTINGS_EVM,
      Screen.SETTINGS_ADVANCED,
      'popup_html_theme',
      Screen.SETTINGS_HELP_AND_ABOUT,
    ]);
  });

  it('shows only Hive settings when user has no EVM accounts', () => {
    const menuItems = getSettingsMainPageMenuItems({
      hasEvmAccounts: false,
      hasHiveAccounts: true,
      theme: Theme.LIGHT,
      toggleTheme,
    });

    expect(menuItems.map((item) => item.nextScreen ?? item.label)).toEqual([
      Screen.SETTINGS_CONTACTS,
      Screen.SETTINGS_NETWORK,
      Screen.SETTINGS_CONNECTED_DAPPS,
      Screen.SETTINGS_HIVE,
      Screen.SETTINGS_ADVANCED,
      'popup_html_theme',
      Screen.SETTINGS_HELP_AND_ABOUT,
    ]);
  });

  it('places theme toggle above help and about with action callback', () => {
    const menuItems = getSettingsMainPageMenuItems({
      hasEvmAccounts: false,
      hasHiveAccounts: false,
      theme: Theme.LIGHT,
      toggleTheme,
    });

    const themeIndex = menuItems.findIndex(
      (item) => item.label === 'popup_html_theme',
    );
    const helpIndex = menuItems.findIndex(
      (item) => item.nextScreen === Screen.SETTINGS_HELP_AND_ABOUT,
    );

    expect(themeIndex).toBe(helpIndex - 1);
    expect(menuItems[themeIndex].action).toBe(toggleTheme);
  });
});
