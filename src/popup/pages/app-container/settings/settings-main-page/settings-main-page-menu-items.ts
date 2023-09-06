import { Icons } from '@popup/icons.enum';
import { MenuItem } from 'src/interfaces/menu-item.interface';
import { Screen } from 'src/reference-data/screen.enum';

const SettingsMenuItems: MenuItem[] = [
  {
    label: 'popup_html_accounts',
    icon: Icons.ACCOUNTS,
    nextScreen: Screen.SETTINGS_ACCOUNTS,
  },
  {
    label: 'popup_html_user_preferences',
    icon: Icons.PREFERENCES,
    nextScreen: Screen.SETTINGS_USER_PREFERENCES,
  },
  {
    label: 'popup_html_advanced_settings',
    icon: Icons.SETTINGS,
    nextScreen: Screen.SETTINGS_ADVANCED,
  },
  {
    label: 'popup_html_governance',
    icon: Icons.HIVE_WHITE,
    importedIcon: true,
    nextScreen: Screen.GOVERNANCE_PAGE,
  },
  {
    label: 'popup_html_contact_support',
    icon: Icons.SUPPORT,
    action: () => {
      chrome.tabs.create({ url: 'https://discord.gg/E6P6Gjv9MC' });
    },
  },

  {
    label: 'popup_html_about',
    icon: Icons.INFO,
    nextScreen: Screen.SETTINGS_ABOUT,
  },
];

export default SettingsMenuItems;
