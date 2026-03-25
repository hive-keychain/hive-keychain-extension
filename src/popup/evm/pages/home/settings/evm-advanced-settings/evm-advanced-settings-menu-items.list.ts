import { Screen } from '@interfaces/screen.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { MenuItem } from 'src/interfaces/menu-item.interface';

export const getEvmAdvancedSettingsMenuItems = (isLedgerSupported: boolean) => {
  let settings: MenuItem[] = [
    {
      label: 'popup_html_rpc_node',
      icon: SVGIcons.MENU_ADVANCED_SETTINGS_RPC_NODE,
      nextScreen: Screen.EVM_RPC_NODES_SETTINGS,
    },
    {
      label: 'evm_menu_security',
      icon: SVGIcons.MENU_ADVANCED_SETTINGS_SECURITY,
      nextScreen: Screen.EVM_SECURITY_SETTINGS,
    },
    {
      label: 'evm_menu_provider_compatibility',
      icon: SVGIcons.WALLET_SETTINGS,
      nextScreen: Screen.EVM_PROVIDER_SETTINGS,
    },
    {
      label: 'popup_html_autolock',
      icon: SVGIcons.MENU_ADVANCED_SETTINGS_AUTO_LOCK,
      nextScreen: Screen.SETTINGS_AUTO_LOCK,
    },
    {
      label: 'popup_html_change_password',
      icon: SVGIcons.MENU_ADVANCED_SETTINGS_CHANGE_PASSWORD,
      nextScreen: Screen.SETTINGS_CHANGE_PASSWORD,
    },

    {
      label: 'ledger_link_ledger_device',
      icon: SVGIcons.MENU_ADVANCED_SETTINGS_LINK_LEDGER_DEVICE,
      action: async () => {
        const extensionId = (await chrome.management.getSelf()).id;
        chrome.tabs.create({
          url: `chrome-extension://${extensionId}/link-ledger-device.html`,
        });
      },
    },
    // {
    //   label: 'popup_html_import_export_settings',
    //   icon: SVGIcons.MENU_ADVANCED_SETTINGS_IMPORT_EXPORT,
    //   nextScreen: Screen.SETTINGS_IMPORT_EXPORT,
    // },
    {
      label: 'popup_html_clear',
      icon: SVGIcons.MENU_ADVANCED_SETTINGS_CLEAR_ALL,
      nextScreen: Screen.SETTINGS_CLEAR_ALL_DATA,
    },
  ];

  if (!isLedgerSupported)
    settings = settings.filter((e) => e.label !== 'ledger_link_ledger_device');

  return settings;
};
