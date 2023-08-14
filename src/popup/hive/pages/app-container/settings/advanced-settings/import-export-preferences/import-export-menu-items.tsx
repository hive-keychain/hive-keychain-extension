import { NewIcons } from 'src/common-ui/icons.enum';
import { MenuItem } from 'src/interfaces/menu-item.interface';
import SettingsUtils from 'src/popup/hive/utils/settings.utils';

const ImportExportSubMenuItems: MenuItem[] = [
  {
    label: 'popup_html_import_permissions',
    icon: NewIcons.IMPORT_SETTINGS,
    action: () => {
      SettingsUtils.importSettings();
    },
  },
  {
    label: 'popup_html_export_permissions',
    icon: NewIcons.EXPORT_SETTINGS,
    action: () => {
      SettingsUtils.exportSettings();
    },
  },
];

export default ImportExportSubMenuItems;
