import { MenuItem } from '@interfaces/menu-item.interface';
import { Screen } from '@interfaces/screen.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';

interface SettingsChainSettingsMenuItemsParams {
  hasEvmAccounts: boolean;
  hasHiveAccounts: boolean;
}

export const getSettingsChainSettingsMenuItems = ({
  hasEvmAccounts,
  hasHiveAccounts,
}: SettingsChainSettingsMenuItemsParams): MenuItem[] => {
  const menuItems: MenuItem[] = [];

  if (hasHiveAccounts) {
    menuItems.push({
      label: 'hive_settings',
      icon: SVGIcons.MENU_HIVE_SETTINGS,
      nextScreen: Screen.SETTINGS_HIVE,
    });
  }

  if (hasEvmAccounts) {
    menuItems.push({
      label: 'evm_settings',
      icon: SVGIcons.MENU_EVM_SETTINGS,
      nextScreen: Screen.SETTINGS_EVM,
    });
  }

  return menuItems;
};
