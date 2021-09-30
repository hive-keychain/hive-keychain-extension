import { MenuItem } from 'src/interfaces/menu-item.interface';
import { Screen } from 'src/reference-data/screen.enum';

const AdvancedSettingsMenuItems: MenuItem[] = [
  {
    label: 'popup_html_rpc_node',
    icon: 'white-link',
    nextScreen: Screen.SETTINGS_RPC_NODES,
  },
  {
    label: 'popup_html_autolock',
    icon: 'autolock',
    nextScreen: Screen.SETTINGS_AUTO_LOCK,
  },
  {
    label: 'popup_html_change_password',
    icon: 'password',
    nextScreen: Screen.SETTINGS_CHANGE_PASSWORD,
  },
  {
    label: 'popup_html_keychainify',
    icon: 'white-link',
    nextScreen: Screen.SETTINGS_KEYCHAINIFY,
  },
  {
    label: 'popup_html_import_export',
    icon: 'import',
    nextScreen: Screen.SETTINGS_IMPORT_EXPORT,
  },
  {
    label: 'popup_html_clear',
    icon: 'clear',
    nextScreen: Screen.SETTINGS_CLEAR_ALL_DATA,
  },
];

export default AdvancedSettingsMenuItems;
