import { MenuItem } from 'src/interfaces/menu-item.interface';
import { Screen } from 'src/reference-data/screen.enum';

const AdvancedSettingsMenuItems: MenuItem[] = [
  {
    label: 'popup_html_rpc_node',
    icon: 'accounts',
    nextScreen: Screen.SETTINGS_RPC_NODES,
  },
  {
    label: 'popup_html_autolock',
    icon: 'accounts',
    nextScreen: Screen.SETTINGS_AUTO_LOCK,
  },
  {
    label: 'popup_html_change_password',
    icon: 'add_account',
    nextScreen: Screen.SETTINGS_CHANGE_PASSWORD,
  },
  {
    label: 'popup_html_keychainify',
    icon: 'add_account',
    nextScreen: Screen.SETTINGS_KEYCHAINIFY,
  },
  {
    label: 'popup_html_import_export',
    icon: 'accounts',
    nextScreen: Screen.SETTINGS_IMPORT_EXPORT,
  },
  {
    label: 'popup_html_clear',
    icon: 'accounts',
    nextScreen: Screen.SETTINGS_CLEAR_ALL_DATA,
  },
];

export default AdvancedSettingsMenuItems;
