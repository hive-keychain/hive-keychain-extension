import { Icons } from '@popup/icons.enum';
import { MenuItem } from 'src/interfaces/menu-item.interface';
import SettingsUtils from 'src/utils/settings.utils';

const ImportExportSubMenuItems: MenuItem[] = [
  {
    label: 'popup_html_import_permissions',
    icon: Icons.IMPORT,
    action: () => {
      SettingsUtils.importSettings();
    },
  },
  {
    label: 'popup_html_export_permissions',
    icon: Icons.EXPORT,
    action: () => {
      SettingsUtils.exportSettings();
    },
  },
];

export default ImportExportSubMenuItems;
