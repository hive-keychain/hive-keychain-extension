import { Theme } from '@popup/theme.context';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { getSettingsPreferencesDisplayMenuItems } from 'src/popup/multichain/pages/settings/settings-preferences-display-menu-items';

describe('getSettingsPreferencesDisplayMenuItems', () => {
  const toggleTheme = jest.fn();

  beforeEach(() => {
    toggleTheme.mockClear();
  });

  it('always includes theme toggle', () => {
    const menuItems = getSettingsPreferencesDisplayMenuItems({
      isToolbarPopup: false,
      theme: Theme.LIGHT,
      toggleTheme,
    });

    expect(menuItems).toHaveLength(1);
    expect(menuItems[0].label).toBe('popup_html_theme');
    expect(menuItems[0].icon).toBe(SVGIcons.MENU_THEME_DARK);
    expect(menuItems[0].action).toBe(toggleTheme);
  });

  it('uses light theme icon when dark mode is active', () => {
    const menuItems = getSettingsPreferencesDisplayMenuItems({
      isToolbarPopup: false,
      theme: Theme.DARK,
      toggleTheme,
    });

    expect(menuItems[0].icon).toBe(SVGIcons.MENU_THEME_LIGHT);
  });

  it('includes detach when opened from toolbar popup', () => {
    const menuItems = getSettingsPreferencesDisplayMenuItems({
      isToolbarPopup: true,
      theme: Theme.LIGHT,
      toggleTheme,
    });

    expect(menuItems).toHaveLength(2);
    expect(menuItems[1].label).toBe('popup_html_detach_window');
    expect(menuItems[1].icon).toBe(SVGIcons.MENU_USER_PREFERENCES_DETACH_EXTENSION);
    expect(menuItems[1].action).toBeDefined();
  });

  it('omits detach when not in toolbar popup', () => {
    const menuItems = getSettingsPreferencesDisplayMenuItems({
      isToolbarPopup: false,
      theme: Theme.LIGHT,
      toggleTheme,
    });

    expect(
      menuItems.some((item) => item.label === 'popup_html_detach_window'),
    ).toBe(false);
  });
});
