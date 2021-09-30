import { MenuItem } from 'src/interfaces/menu-item.interface';
import { Screen } from 'src/reference-data/screen.enum';

const UserPreferencesMenuItems: MenuItem[] = [
  {
    label: 'popup_html_rpc_node',
    icon: 'accounts',
    nextScreen: Screen.SETTINGS_RPC_NODES,
  },
];

export default UserPreferencesMenuItems;
