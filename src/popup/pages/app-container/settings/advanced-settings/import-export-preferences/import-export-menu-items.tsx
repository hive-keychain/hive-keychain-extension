import { MenuItem } from 'src/interfaces/menu-item.interface';
import SettingsUtils from 'src/utils/settings.utils';

const ImportExportSubMenuItems: MenuItem[] = [
  {
    label: 'popup_html_import_permissions',
    icon: 'add_account',
    action: () => {
      SettingsUtils.importSettings();
    },
  },
  {
    label: 'popup_html_export_permissions',
    icon: 'add_account',
    action: () => {
      SettingsUtils.exportSettings();
    },
  },
];

export default ImportExportSubMenuItems;
