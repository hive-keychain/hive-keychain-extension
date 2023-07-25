import { Icons } from '@popup/icons.enum';
import { MenuItem } from 'src/interfaces/menu-item.interface';
import { ImportExportUtils } from 'src/utils/import-export.utils';

const ImportExportSubMenuItems: MenuItem[] = [
  {
    label: 'popup_html_import_permissions',
    icon: Icons.IMPORT,
    action: () => {
      ImportExportUtils.importBackup();

      //TODO delete old way bellow, file & related
      // SettingsUtils.importSettings();
    },
  },
  {
    label: 'popup_html_export_permissions',
    icon: Icons.EXPORT,
    action: () => {
      ImportExportUtils.exportBackup();

      //TODO delete old way bellow, file & related
      // SettingsUtils.exportSettings();
    },
  },
];

export default ImportExportSubMenuItems;
