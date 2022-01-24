import { Icons } from '@popup/icons.enum';
import { MenuItem } from 'src/interfaces/menu-item.interface';
import { Screen } from 'src/reference-data/screen.enum';

const UserPreferencesMenuItems: MenuItem[] = [
  {
    label: 'popup_html_operations',
    icon: Icons.AUTHORIZED_OPERATIONS,
    nextScreen: Screen.SETTINGS_AUTHORIZED_OPERATIONS,
  },
  // {
  //   label: 'popup_html_operation_popup',
  //   icon: 'accounts',
  //   nextScreen: Screen.SETTINGS_OPERATION_POPUP,
  // },
  {
    label: 'popup_html_automated_tasks',
    icon: Icons.AUTOMATED_TASKS,
    nextScreen: Screen.SETTINGS_AUTOMATED_TASKS,
  },
];

export default UserPreferencesMenuItems;
