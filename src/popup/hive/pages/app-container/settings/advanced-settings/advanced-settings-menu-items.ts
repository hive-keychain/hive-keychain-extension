import { NewIcons } from 'src/common-ui/icons.enum';
import { MenuItem } from 'src/interfaces/menu-item.interface';
import { Screen } from 'src/reference-data/screen.enum';

const getAdvancedSettingsMenuItems = (isLedgerSupported: boolean) => {
  let settings: MenuItem[] = [
    {
      label: 'popup_html_rpc_node',
      icon: NewIcons.RPC_NODES,
      nextScreen: Screen.SETTINGS_RPC_NODES,
    },
    {
      label: 'popup_html_autolock',
      icon: NewIcons.AUTOLOCK,
      nextScreen: Screen.SETTINGS_AUTO_LOCK,
    },
    {
      label: 'popup_html_change_password',
      icon: NewIcons.CHANGE_PASSWORD,
      nextScreen: Screen.SETTINGS_CHANGE_PASSWORD,
    },
    {
      label: 'popup_html_keychainify',
      icon: NewIcons.KEYCHAINIFY,
      nextScreen: Screen.SETTINGS_KEYCHAINIFY,
    },
    {
      label: 'popup_html_analytics',
      icon: NewIcons.ANALYTICS,
      nextScreen: Screen.SETTINGS_ANALYTICS,
    },
    {
      label: 'ledger_link_ledger_device',
      icon: NewIcons.LINK_LEDGER,
      action: async () => {
        const extensionId = (await chrome.management.getSelf()).id;
        chrome.tabs.create({
          url: `chrome-extension://${extensionId}/link-ledger-device.html`,
        });
      },
    },
    {
      label: 'popup_html_import_export_settings',
      icon: NewIcons.IMPORT_EXPORT_SETTINGS,
      nextScreen: Screen.SETTINGS_IMPORT_EXPORT,
    },
    {
      label: 'popup_html_clear',
      icon: NewIcons.CLEAR_ALL,
      nextScreen: Screen.SETTINGS_CLEAR_ALL_DATA,
    },
  ];

  if (!isLedgerSupported)
    settings = settings.filter((e) => e.label !== 'ledger_link_ledger_device');

  return settings;
};

export default getAdvancedSettingsMenuItems;
