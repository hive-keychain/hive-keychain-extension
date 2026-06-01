import { MenuItem } from '@interfaces/menu-item.interface';
import { Screen } from '@interfaces/screen.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';

interface SettingsMainPageMenuItemsParams {
  hasEvmAccounts: boolean;
  hasHiveAccounts: boolean;
  logout: () => void;
}

export const getSettingsMainPageMenuItems = ({
  hasEvmAccounts,
  hasHiveAccounts,
  logout,
}: SettingsMainPageMenuItemsParams): MenuItem[] => {
  const menuItems: MenuItem[] = [
    {
      label: 'popup_html_contacts',
      icon: SVGIcons.MENU_CONTACTS,
      nextScreen: Screen.SETTINGS_CONTACTS,
    },
    {
      label: 'popup_html_network',
      icon: SVGIcons.MENU_ADVANCED_SETTINGS_RPC_NODE,
      nextScreen: Screen.SETTINGS_NETWORK,
    },
    {
      label: 'popup_html_connected_dapps',
      icon: SVGIcons.MENU_PLUGINS,
      nextScreen: Screen.SETTINGS_CONNECTED_DAPPS,
    },
  ];

  if (hasEvmAccounts) {
    menuItems.push({
      label: 'evm_settings',
      icon: SVGIcons.BLOCKCHAIN_ETHEREUM,
      nextScreen: Screen.SETTINGS_EVM,
    });
  }

  if (hasHiveAccounts) {
    menuItems.push({
      label: 'hive_settings',
      icon: SVGIcons.BLOCKCHAIN_HIVE,
      nextScreen: Screen.SETTINGS_HIVE,
    });
  }

  menuItems.push(
    {
      label: 'popup_html_advanced_settings',
      icon: SVGIcons.MENU_ADVANCED_SETTINGS,
      nextScreen: Screen.SETTINGS_ADVANCED,
    },
    {
      label: 'popup_html_help',
      icon: SVGIcons.MENU_HELP,
      nextScreen: Screen.SETTINGS_HELP,
    },
    {
      label: 'popup_html_about',
      icon: SVGIcons.MENU_ABOUT,
      nextScreen: Screen.SETTINGS_ABOUT,
    },
    {
      label: 'popup_html_logout',
      icon: SVGIcons.MENU_LOGOUT,
      action: logout,
    },
  );

  return menuItems;
};
