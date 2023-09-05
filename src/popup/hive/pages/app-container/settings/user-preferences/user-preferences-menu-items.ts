import { ThemeToggle } from '@popup/hive/pages/app-container/settings/user-preferences/theme-toggle/theme-toggle.component';
import { NewIcons } from 'src/common-ui/icons.enum';
import { MenuItem } from 'src/interfaces/menu-item.interface';
import { Screen } from 'src/reference-data/screen.enum';
import Logger from 'src/utils/logger.utils';

const UserPreferencesMenuItems: MenuItem[] = [
  {
    label: 'popup_html_operations',
    icon: NewIcons.MENU_USER_PREFERENCES_OPERATIONS,
    nextScreen: Screen.SETTINGS_AUTHORIZED_OPERATIONS,
  },
  {
    label: 'popup_html_automated_tasks',
    icon: NewIcons.MENU_USER_PREFERENCES_AUTOMATED_TASKS,
    nextScreen: Screen.SETTINGS_AUTOMATED_TASKS,
  },
  {
    label: 'popup_html_favorite_accounts',
    icon: NewIcons.MENU_USER_PREFERENCES_FAVORITE_ACCOUNTS,
    nextScreen: Screen.SETTINGS_FAVORITE_ACCOUNTS,
  },
  {
    label: 'popup_html_theme',
    icon: NewIcons.MENU_USER_PREFERENCES_THEME,
    action: () => {
      Logger.log('should switch theme');
    },
    rightPanel: ThemeToggle,
  },
];

export default UserPreferencesMenuItems;
