import { MenuItem } from '@interfaces/menu-item.interface';
import { DetachedExtensionTabUtils } from '@popup/multichain/utils/detached-extension-tab.utils';
import { Theme } from '@popup/theme.context';
import { SVGIcons } from 'src/common-ui/icons.enum';

interface SettingsPreferencesDisplayMenuItemsParams {
  theme: Theme;
  toggleTheme: () => void;
}

export const getThemeMenuItem = ({
  theme,
  toggleTheme,
}: Pick<
  SettingsPreferencesDisplayMenuItemsParams,
  'theme' | 'toggleTheme'
>): MenuItem => {
  const themeIcon =
    theme === Theme.DARK ? SVGIcons.MENU_THEME_LIGHT : SVGIcons.MENU_THEME_DARK;

  return {
    label: 'popup_html_theme',
    icon: themeIcon,
    action: toggleTheme,
  };
};

export const getSettingsPreferencesDisplayMenuItems = ({
  theme,
  toggleTheme,
}: SettingsPreferencesDisplayMenuItemsParams): MenuItem[] => [
  getThemeMenuItem({ theme, toggleTheme }),
  {
    label: 'popup_html_open_in_side_panel',
    icon: SVGIcons.MENU_USER_PREFERENCES_DETACH_EXTENSION,
    action: () => {
      void DetachedExtensionTabUtils.openDetachedExtension();
    },
  },
];
