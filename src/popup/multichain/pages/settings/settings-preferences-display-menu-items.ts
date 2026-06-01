import { MenuItem } from '@interfaces/menu-item.interface';
import { DetachedExtensionTabUtils } from '@popup/multichain/utils/detached-extension-tab.utils';
import { Theme } from '@popup/theme.context';
import { SVGIcons } from 'src/common-ui/icons.enum';

interface SettingsPreferencesDisplayMenuItemsParams {
  isToolbarPopup: boolean;
  theme: Theme;
  toggleTheme: () => void;
}

export const getSettingsPreferencesDisplayMenuItems = ({
  isToolbarPopup,
  theme,
  toggleTheme,
}: SettingsPreferencesDisplayMenuItemsParams): MenuItem[] => {
  const themeIcon =
    theme === Theme.DARK ? SVGIcons.MENU_THEME_LIGHT : SVGIcons.MENU_THEME_DARK;

  const menuItems: MenuItem[] = [
    {
      label: 'popup_html_theme',
      icon: themeIcon,
      action: toggleTheme,
    },
  ];

  if (isToolbarPopup) {
    menuItems.push({
      label: 'popup_html_detach_window',
      icon: SVGIcons.MENU_USER_PREFERENCES_DETACH_EXTENSION,
      action: () => {
        DetachedExtensionTabUtils.openDetachedExtensionTab();
      },
    });
  }

  return menuItems;
};
