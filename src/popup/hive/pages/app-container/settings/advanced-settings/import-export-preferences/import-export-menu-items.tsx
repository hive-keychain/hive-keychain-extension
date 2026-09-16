import { MenuItem } from '@interfaces/menu-item.interface';
import AccountUtils from '@popup/hive/utils/account.utils';
import ImportAccountsFileUtils from '@popup/hive/utils/import-accounts-file.utils';
import { store } from '@popup/multichain/store';
import { SVGIcons } from 'src/common-ui/icons.enum';

const ImportExportSubMenuItems: MenuItem[] = [
  {
    label: 'popup_html_import_permissions',
    icon: SVGIcons.MENU_ADVANCED_SETTINGS_IMPORT_SETTINGS,
    action: () => {
      ImportAccountsFileUtils.startImportAccountsFromFile(store);
    },
  },
  {
    label: 'popup_html_export_permissions',
    icon: SVGIcons.MENU_ADVANCED_SETTINGS_EXPORT_SETTINGS,
    action: () => {
      AccountUtils.downloadAccounts(
        store.getState().hive.accounts,
        store.getState().mk,
      );
    },
  },
];

export default ImportExportSubMenuItems;
