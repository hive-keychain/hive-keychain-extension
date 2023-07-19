import { ThemeToggle } from '@popup/hive/pages/app-container/settings/user-preferences/theme-toggle/theme-toggle.component';
import { NewIcons } from 'src/common-ui/icons.enum';
import { MenuItem } from 'src/interfaces/menu-item.interface';
import { Screen } from 'src/reference-data/screen.enum';

const UserPreferencesMenuItems: MenuItem[] = [
  {
    label: 'popup_html_operations',
    icon: NewIcons.AUTHORIZED_OPERATIONS,
    nextScreen: Screen.SETTINGS_AUTHORIZED_OPERATIONS,
  },
  {
    label: 'popup_html_automated_tasks',
    icon: NewIcons.AUTOMATED_TASKS,
    nextScreen: Screen.SETTINGS_AUTOMATED_TASKS,
  },
  {
    label: 'popup_html_favorite_accounts',
    icon: NewIcons.FAVORITE_ACCOUNTS,
    nextScreen: Screen.SETTINGS_FAVORITE_ACCOUNTS,
  },
  {
    label: 'popup_html_theme',
    icon: NewIcons.THEME,
    action: () => {
      console.log('should switch theme');
    },
    rightPanel: ThemeToggle,
  },
];

export default UserPreferencesMenuItems;
