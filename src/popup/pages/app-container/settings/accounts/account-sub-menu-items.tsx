import { MenuItem } from 'src/interfaces/menu-item.interface';
import { Screen } from 'src/reference-data/screen.enum';

const AccountSubMenuItems: MenuItem[] = [
  {
    label: 'popup_html_add_account',
    icon: 'add_account',
    nextScreen: Screen.SETTINGS_ADD_ACCOUNT,
  },
  {
    label: 'popup_html_manage_accounts',
    icon: 'accounts',
    nextScreen: Screen.SETTINGS_MANAGE_ACCOUNTS,
  },
];

export default AccountSubMenuItems;
