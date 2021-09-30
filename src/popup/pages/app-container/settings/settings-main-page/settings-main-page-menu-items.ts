import { MenuItem } from 'src/interfaces/menu-item.interface';
import { Screen } from 'src/reference-data/screen.enum';

const SettingsMenuItems: MenuItem[] = [
  {
    label: 'popup_html_accounts',
    icon: 'accounts',
    nextScreen: Screen.SETTINGS_ACCOUNTS,
  },
  {
    label: 'popup_html_user_preferences',
    icon: 'preferences',
    nextScreen: Screen.SETTINGS_USER_PREFERENCES,
  },
  {
    label: 'popup_html_advanced_settings',
    icon: 'preferences',
    nextScreen: Screen.SETTINGS_ADVANCED,
  },
  {
    label: 'popup_html_about',
    icon: 'info',
    nextScreen: Screen.SETTINGS_ABOUT,
  },
];

export default SettingsMenuItems;
