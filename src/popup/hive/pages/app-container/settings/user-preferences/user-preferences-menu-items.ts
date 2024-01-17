import { MenuItem } from '@interfaces/menu-item.interface';
import { ThemeToggle } from '@popup/hive/pages/app-container/settings/user-preferences/theme-toggle/theme-toggle.component';
import { Theme } from '@popup/theme.context';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { Screen } from 'src/reference-data/screen.enum';

const UserPreferencesMenuItems = (
  setTheme: (...params: any) => void,
): MenuItem[] => {
  return [
    {
      label: 'popup_html_operations',
      icon: SVGIcons.MENU_USER_PREFERENCES_OPERATIONS,
      nextScreen: Screen.SETTINGS_AUTHORIZED_OPERATIONS,
    },
    {
      label: 'popup_html_automated_tasks',
      icon: SVGIcons.MENU_USER_PREFERENCES_AUTOMATED_TASKS,
      nextScreen: Screen.SETTINGS_AUTOMATED_TASKS,
    },
    {
      label: 'popup_html_favorite_accounts',
      icon: SVGIcons.MENU_USER_PREFERENCES_FAVORITE_ACCOUNTS,
      nextScreen: Screen.SETTINGS_FAVORITE_ACCOUNTS,
    },
    {
      label: 'popup_html_theme',
      icon: SVGIcons.MENU_USER_PREFERENCES_THEME,
      action: () => {
        setTheme((oldTheme: Theme) => {
          return oldTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
        });
      },
      rightPanel: ThemeToggle,
    },
  ];
};

export default UserPreferencesMenuItems;
