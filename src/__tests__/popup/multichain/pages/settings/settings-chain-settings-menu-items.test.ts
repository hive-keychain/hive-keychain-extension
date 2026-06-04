import { Screen } from '@interfaces/screen.interface';
import { getSettingsChainSettingsMenuItems } from 'src/popup/multichain/pages/settings/settings-chain-settings-menu-items';

describe('getSettingsChainSettingsMenuItems', () => {
  it('includes Hive and EVM settings when both account types exist', () => {
    const menuItems = getSettingsChainSettingsMenuItems({
      hasHiveAccounts: true,
      hasEvmAccounts: true,
    });

    expect(menuItems.map((item) => item.nextScreen)).toEqual([
      Screen.SETTINGS_HIVE,
      Screen.SETTINGS_EVM,
    ]);
  });

  it('includes only Hive settings when no EVM accounts exist', () => {
    const menuItems = getSettingsChainSettingsMenuItems({
      hasHiveAccounts: true,
      hasEvmAccounts: false,
    });

    expect(menuItems).toHaveLength(1);
    expect(menuItems[0].nextScreen).toBe(Screen.SETTINGS_HIVE);
  });

  it('includes only EVM settings when no Hive accounts exist', () => {
    const menuItems = getSettingsChainSettingsMenuItems({
      hasHiveAccounts: false,
      hasEvmAccounts: true,
    });

    expect(menuItems).toHaveLength(1);
    expect(menuItems[0].nextScreen).toBe(Screen.SETTINGS_EVM);
  });
});
