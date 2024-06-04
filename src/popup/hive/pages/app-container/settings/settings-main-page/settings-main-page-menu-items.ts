import { SVGIcons } from 'src/common-ui/icons.enum';
import { MenuItem } from 'src/interfaces/menu-item.interface';
import { Screen } from 'src/reference-data/screen.enum';

const SettingsMenuItems = (logout: () => void): MenuItem[] => {
  return [
    {
      label: 'popup_html_accounts',
      icon: SVGIcons.MENU_ACCOUNTS,
      nextScreen: Screen.SETTINGS_ACCOUNTS,
    },
    {
      label: 'popup_html_user_preferences',
      icon: SVGIcons.MENU_USER_PREFERENCES,
      nextScreen: Screen.SETTINGS_USER_PREFERENCES,
    },
    {
      label: 'popup_html_advanced_settings',
      icon: SVGIcons.MENU_ADVANCED_SETTINGS,
      nextScreen: Screen.SETTINGS_ADVANCED,
    },
    // {
    //   label: 'popup_html_tokens',
    //   icon: NewIcons.MENU_TOKENS,
    //   nextScreen: Screen.TOKENS_FILTER,
    // },
    {
      label: 'popup_html_governance',
      icon: SVGIcons.MENU_GOVERNANCE,
      nextScreen: Screen.GOVERNANCE_PAGE,
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

export default SettingsMenuItems;
