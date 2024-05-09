import { Screen } from '@interfaces/screen.interface';
import { store } from '@popup/multichain/store';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { MenuItem } from 'src/interfaces/menu-item.interface';
import AccountUtils from 'src/popup/hive/utils/account.utils';

const AccountSubMenuItems: MenuItem[] = [
  {
    label: 'popup_html_add_account',
    icon: SVGIcons.MENU_ACCOUNTS_ADD_ACCOUNT,
    nextScreen: Screen.SETTINGS_ADD_ACCOUNT,
  },
  {
    label: 'popup_html_create_account',
    icon: SVGIcons.MENU_ACCOUNTS_CREATE_ACCOUNT,
    nextScreen: Screen.CREATE_ACCOUNT_PAGE_STEP_ONE,
  },
  {
    label: 'popup_html_manage_accounts',
    icon: SVGIcons.MENU_ACCOUNTS_MANAGE_ACCOUNTS,
    nextScreen: Screen.SETTINGS_MANAGE_ACCOUNTS,
  },
  {
    label: 'popup_html_manage_accounts_authorities',
    icon: SVGIcons.MENU_ACCOUNTS_MANAGE_AUTHORITIES,
    nextScreen: Screen.SETTINGS_MANAGE_ACCOUNTS_AUTHORITIES,
  },
  {
    label: 'popup_html_export',
    icon: SVGIcons.MENU_ACCOUNTS_EXPORT,
    action: () => {
      AccountUtils.downloadAccounts(
        store.getState().hive.accounts,
        store.getState().mk,
      );
    },
  },
];

export default AccountSubMenuItems;
