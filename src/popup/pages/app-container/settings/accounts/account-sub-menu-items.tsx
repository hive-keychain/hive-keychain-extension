import { Icons } from '@popup/icons.enum';
import { MenuItem } from 'src/interfaces/menu-item.interface';
import { Screen } from 'src/reference-data/screen.enum';
import AccountUtils from 'src/utils/account.utils';

const AccountSubMenuItems: MenuItem[] = [
  {
    label: 'popup_html_add_account',
    icon: Icons.ADD_ACCOUNT,
    nextScreen: Screen.SETTINGS_ADD_ACCOUNT,
  },
  {
    label: 'popup_html_manage_accounts',
    icon: Icons.MANAGE_ACCOUNTS,
    nextScreen: Screen.SETTINGS_MANAGE_ACCOUNTS,
  },
  {
    label: 'popup_html_export',
    icon: Icons.EXPORT,
    action: () => {
      AccountUtils.downloadAccounts();
    },
  },
];

export default AccountSubMenuItems;
