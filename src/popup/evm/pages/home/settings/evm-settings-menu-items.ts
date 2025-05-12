import { Screen } from '@interfaces/screen.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { MenuItem } from 'src/interfaces/menu-item.interface';

export const EvmSettingsMenuItems = (logout: () => void): MenuItem[] => {
  return [
    {
      label: 'evm_seeds_and_accounts',
      icon: SVGIcons.MENU_ACCOUNTS,
      nextScreen: Screen.EVM_ACCOUNTS_SETTINGS,
    },
    {
      label: 'evm_menu_advanced',
      icon: SVGIcons.MENU_ADVANCED_SETTINGS,
      nextScreen: Screen.EVM_ADVANCED_SETTINGS,
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
      action: () => {
        logout();
      },
    },
  ];
};
