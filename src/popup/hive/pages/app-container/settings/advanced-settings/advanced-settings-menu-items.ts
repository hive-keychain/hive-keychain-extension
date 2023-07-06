import { Icons } from 'src/common-ui/icons.enum';
import { MenuItem } from 'src/interfaces/menu-item.interface';
import { Screen } from 'src/reference-data/screen.enum';

const getAdvancedSettingsMenuItems = (isLedgerSupported: boolean) => {
  let settings: MenuItem[] = [
    {
      label: 'popup_html_rpc_node',
      icon: Icons.RPC,
      nextScreen: Screen.SETTINGS_RPC_NODES,
    },
    {
      label: 'popup_html_autolock',
      icon: Icons.AUTO_LOCK,
      nextScreen: Screen.SETTINGS_AUTO_LOCK,
    },
    {
      label: 'popup_html_change_password',
      icon: Icons.PASSWORD,
      nextScreen: Screen.SETTINGS_CHANGE_PASSWORD,
    },
    {
      label: 'popup_html_keychainify',
      icon: Icons.LINK,
      nextScreen: Screen.SETTINGS_KEYCHAINIFY,
    },
    {
      label: 'popup_html_analytics',
      icon: Icons.ANALYTICS,
      nextScreen: Screen.SETTINGS_ANALYTICS,
    },
    {
      label: 'ledger_link_ledger_device',
      icon: Icons.USB,
      action: async () => {
        const extensionId = (await chrome.management.getSelf()).id;
        chrome.tabs.create({
          url: `chrome-extension://${extensionId}/link-ledger-device.html`,
        });
      },
    },
    {
      label: 'popup_html_import_export_settings',
      icon: Icons.IMPORT_EXPORT,
      nextScreen: Screen.SETTINGS_IMPORT_EXPORT,
    },
    {
      label: 'popup_html_clear',
      icon: Icons.CLEAR,
      nextScreen: Screen.SETTINGS_CLEAR_ALL_DATA,
    },
  ];

  if (!isLedgerSupported)
    settings = settings.filter((e) => e.label !== 'ledger_link_ledger_device');

  return settings;
};

export default getAdvancedSettingsMenuItems;
