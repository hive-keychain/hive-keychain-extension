import { Screen } from '@interfaces/screen.interface';
import { getSettingsMainPageMenuItems } from 'src/popup/multichain/pages/settings/settings-main-page-menu-items';

describe('getSettingsMainPageMenuItems', () => {
  it('uses the unified settings menu order', () => {
    const menuItems = getSettingsMainPageMenuItems({
      hasEvmAccounts: true,
      hasHiveAccounts: true,
      logout: jest.fn(),
    });

    expect(menuItems.map((item) => item.nextScreen ?? item.label)).toEqual([
      Screen.SETTINGS_CONTACTS,
      Screen.SETTINGS_NETWORK,
      Screen.SETTINGS_CONNECTED_DAPPS,
      Screen.SETTINGS_EVM,
      Screen.SETTINGS_HIVE,
      Screen.SETTINGS_ADVANCED,
      Screen.SETTINGS_HELP,
      Screen.SETTINGS_ABOUT,
      'popup_html_logout',
    ]);
  });

  it('hides chain-specific settings when no account exists for that chain', () => {
    const menuItems = getSettingsMainPageMenuItems({
      hasEvmAccounts: true,
      hasHiveAccounts: false,
      logout: jest.fn(),
    });

    expect(menuItems.map((item) => item.nextScreen ?? item.label)).toEqual([
      Screen.SETTINGS_CONTACTS,
      Screen.SETTINGS_NETWORK,
      Screen.SETTINGS_CONNECTED_DAPPS,
      Screen.SETTINGS_EVM,
      Screen.SETTINGS_ADVANCED,
      Screen.SETTINGS_HELP,
      Screen.SETTINGS_ABOUT,
      'popup_html_logout',
    ]);
  });
});
