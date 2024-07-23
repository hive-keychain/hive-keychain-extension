import { MenuItem } from '@interfaces/menu-item.interface';
import AccountUtils from '@popup/hive/utils/account.utils';
import { store } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import { SVGIcons } from 'src/common-ui/icons.enum';

const ExportAccountsSubMenuItems: MenuItem[] = [
  {
    label: 'popup_html_export_as_encrypted_file',
    icon: SVGIcons.MENU_ACCOUNTS_EXPORT,
    action: () => {
      AccountUtils.downloadAccounts(
        store.getState().hive.accounts,
        store.getState().mk,
      );
    },
  },
  {
    label: 'popup_html_export_all_accounts_as_QR',
    icon: SVGIcons.MENU_EXPORT_ACCOUNTS_QR,
    nextScreen: Screen.SETTINGS_EXPORT_ALL_ACCOUNTS_QR,
  },
];

export default ExportAccountsSubMenuItems;
