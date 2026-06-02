import { Screen } from '@interfaces/screen.interface';
import { DetachedExtensionTabUtils } from '@popup/multichain/utils/detached-extension-tab.utils';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { MenuItem } from 'src/interfaces/menu-item.interface';

export const getAdvancedSettingsMenuItems = (isLedgerSupported: boolean) => {
  let settings: MenuItem[] = [
    {
      label: 'popup_html_autolock',
      icon: SVGIcons.MENU_ADVANCED_SETTINGS_AUTO_LOCK,
      nextScreen: Screen.SETTINGS_AUTO_LOCK,
    },
    {
      label: 'popup_html_shortcuts',
      icon: SVGIcons.MENU_ADVANCED_SETTINGS_SHORTCUTS,
      nextScreen: Screen.SETTINGS_SHORTCUTS,
    },
    {
      label: 'popup_html_change_password',
      icon: SVGIcons.MENU_ADVANCED_SETTINGS_CHANGE_PASSWORD,
      nextScreen: Screen.SETTINGS_CHANGE_PASSWORD,
    },
    // {
    //   label: 'popup_html_analytics',
    //   icon: SVGIcons.MENU_ADVANCED_SETTINGS_ANALYTICS,
    //   nextScreen: Screen.SETTINGS_ANALYTICS,
    // },
    {
      label: 'ledger_link_ledger_device',
      icon: SVGIcons.MENU_ADVANCED_SETTINGS_LINK_LEDGER_DEVICE,
      action: async () => {
        await DetachedExtensionTabUtils.openExtensionPage(
          'link-ledger-device.html',
        );
      },
    },
    {
      label: 'popup_html_import_export_settings',
      icon: SVGIcons.MENU_ADVANCED_SETTINGS_IMPORT_EXPORT,
      nextScreen: Screen.SETTINGS_IMPORT_EXPORT,
    },
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

export default getAdvancedSettingsMenuItems;
