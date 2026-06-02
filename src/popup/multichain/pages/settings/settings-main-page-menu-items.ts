import { MenuItem } from '@interfaces/menu-item.interface';
import { Screen } from '@interfaces/screen.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';

interface SettingsMainPageMenuItemsParams {
  hasEvmAccounts: boolean;
  hasHiveAccounts: boolean;
}

export const getSettingsMainPageMenuItems = ({
  hasEvmAccounts,
  hasHiveAccounts,
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
    {
      label: 'popup_html_preferences_and_display',
      icon: SVGIcons.MENU_USER_PREFERENCES_THEME,
      nextScreen: Screen.SETTINGS_PREFERENCES_AND_DISPLAY,
    },
  ];

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

  menuItems.push(
    {
      label: 'popup_html_advanced_settings',
      icon: SVGIcons.MENU_ADVANCED_SETTINGS,
      nextScreen: Screen.SETTINGS_ADVANCED,
    },
    {
      label: 'popup_html_help_and_about',
      icon: SVGIcons.MENU_HELP,
      nextScreen: Screen.SETTINGS_HELP_AND_ABOUT,
    },
  );

  return menuItems;
};
