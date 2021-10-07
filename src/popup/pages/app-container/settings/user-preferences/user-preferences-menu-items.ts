import { MenuItem } from 'src/interfaces/menu-item.interface';
import { Screen } from 'src/reference-data/screen.enum';

const UserPreferencesMenuItems: MenuItem[] = [
  {
    label: 'popup_html_authorized_operations',
    icon: 'accounts',
    nextScreen: Screen.SETTINGS_AUTHORIZED_OPERATIONS,
  },
  {
    label: 'popup_html_operation_popup',
    icon: 'accounts',
    nextScreen: Screen.SETTINGS_OPERATION_POPUP,
  },
  {
    label: 'popup_html_automated_tasks',
    icon: 'accounts',
    nextScreen: Screen.SETTINGS_AUTOMATED_TASKS,
  },
];

export default UserPreferencesMenuItems;
