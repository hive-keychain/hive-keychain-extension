import { Icons } from '@popup/icons.enum';
import { MenuItem } from 'src/interfaces/menu-item.interface';
import { Screen } from 'src/reference-data/screen.enum';

const AccountSubMenuItems: MenuItem[] = [
  {
    label: 'popup_html_add_account',
    icon: Icons.ADD_ACCOUNT,
    nextScreen: Screen.SETTINGS_ADD_ACCOUNT,
  },
  {
    label: 'popup_html_create_account',
    icon: Icons.CREATE_ACCOUNT,
    nextScreen: Screen.CREATE_ACCOUNT_PAGE_STEP_ONE,
  },
  {
    label: 'popup_html_manage_accounts',
    icon: Icons.MANAGE_ACCOUNTS,
    nextScreen: Screen.SETTINGS_MANAGE_ACCOUNTS,
  },
  {
    label: 'popup_html_manage_accounts_authorities',
    icon: Icons.MANAGE_AUTHORITIES,
    nextScreen: Screen.SETTINGS_MANAGE_ACCOUNTS_AUTHORITIES,
  },
];

export default AccountSubMenuItems;
