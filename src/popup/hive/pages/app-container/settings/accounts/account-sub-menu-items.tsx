import AccountUtils from '@hiveapp/utils/account.utils';
import { Icons } from 'src/common-ui/icons.enum';
import { MenuItem } from 'src/interfaces/menu-item.interface';
import { store } from 'src/popup/hive/store';
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
  {
    label: 'popup_html_export',
    icon: Icons.EXPORT,
    action: () => {
      AccountUtils.downloadAccounts(
        store.getState().accounts,
        store.getState().mk,
      );
    },
  },
];

export default AccountSubMenuItems;