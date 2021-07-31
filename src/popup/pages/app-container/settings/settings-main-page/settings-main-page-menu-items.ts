import { MenuItem } from 'src/interfaces/menu-item.interface';
import { Screen } from 'src/reference-data/screen.enum';

const SettingsMenuItems: MenuItem[] = [
  {
    label: 'popup_html_accounts',
    icon: 'accounts',
    nextScreen: Screen.SETTINGS_ACCOUNTS,
  },
  {
    label: 'popup_html_advanced_settings',
    icon: 'accounts',
    nextScreen: Screen.SETTINGS_ADVANCED,
  },
];

export default SettingsMenuItems;
