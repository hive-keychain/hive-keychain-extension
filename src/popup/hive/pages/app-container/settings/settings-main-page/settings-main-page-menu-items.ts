import { NewIcons } from 'src/common-ui/icons.enum';
import { MenuItem } from 'src/interfaces/menu-item.interface';
import { Screen } from 'src/reference-data/screen.enum';

const SettingsMenuItems = (logout: () => void): MenuItem[] => {
  return [
    {
      label: 'popup_html_accounts',
      icon: NewIcons.ACCOUNTS,
      nextScreen: Screen.SETTINGS_ACCOUNTS,
    },
    {
      label: 'popup_html_user_preferences',
      icon: NewIcons.USER_PREFERENCES,
      nextScreen: Screen.SETTINGS_USER_PREFERENCES,
    },
    {
      label: 'popup_html_advanced_settings',
      icon: NewIcons.ADVANCED_SETTINGS,
      nextScreen: Screen.SETTINGS_ADVANCED,
    },
    {
      label: 'popup_html_governance',
      icon: NewIcons.GOVERNANCE,
      nextScreen: Screen.GOVERNANCE_PAGE,
    },
    {
      label: 'popup_html_contact_support',
      icon: NewIcons.CONTACT_SUPPORT,
      action: () => {
        chrome.tabs.create({ url: 'https://discord.gg/E6P6Gjv9MC' });
      },
    },
    {
      label: 'popup_html_about',
      icon: NewIcons.INFO_CIRCLE,
      nextScreen: Screen.SETTINGS_ABOUT,
    },
    {
      label: 'popup_html_logout',
      icon: NewIcons.LOGOUT,
      action: () => {
        logout();
      },
    },
  ];
};

export default SettingsMenuItems;
