import { MenuItem } from '@interfaces/menu-item.interface';
import { Screen } from '@interfaces/screen.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';

export const SettingsHiveMenuItems: MenuItem[] = [
  {
    label: 'popup_html_account_authorities',
    icon: SVGIcons.MENU_ACCOUNTS_MANAGE_AUTHORITIES,
    nextScreen: Screen.SETTINGS_MANAGE_ACCOUNTS_AUTHORITIES,
  },
  {
    label: 'popup_html_automated_tasks',
    icon: SVGIcons.MENU_USER_PREFERENCES_AUTOMATED_TASKS,
    nextScreen: Screen.SETTINGS_AUTOMATED_TASKS,
  },
  {
    label: 'popup_html_multisig',
    icon: SVGIcons.MENU_USER_PREFERENCES_MULTISIG,
    nextScreen: Screen.SETTINGS_MULTISIG,
  },
  {
    label: 'popup_html_keychainify',
    icon: SVGIcons.MENU_ADVANCED_SETTINGS_KEYCHAINIFY,
    nextScreen: Screen.SETTINGS_KEYCHAINIFY,
  },
  {
    label: 'html_popup_settings_notifications',
    icon: SVGIcons.MENU_USER_PREFERENCES_NOTIFICATIONS,
    nextScreen: Screen.SETTINGS_NOTIFICATIONS_CONFIGURATION,
  },
  {
    label: 'popup_html_governance',
    icon: SVGIcons.MENU_GOVERNANCE,
    nextScreen: Screen.GOVERNANCE_PAGE,
  },
];
