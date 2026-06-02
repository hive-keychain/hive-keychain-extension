import { Theme } from '@popup/theme.context';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { getSettingsPreferencesDisplayMenuItems } from 'src/popup/multichain/pages/settings/settings-preferences-display-menu-items';

describe('getSettingsPreferencesDisplayMenuItems', () => {
  const toggleTheme = jest.fn();

  beforeEach(() => {
    toggleTheme.mockClear();
  });

  it('includes theme toggle and open in side panel', () => {
    const menuItems = getSettingsPreferencesDisplayMenuItems({
      theme: Theme.LIGHT,
      toggleTheme,
    });

    expect(menuItems).toHaveLength(2);
    expect(menuItems[0].label).toBe('popup_html_theme');
    expect(menuItems[0].icon).toBe(SVGIcons.MENU_THEME_DARK);
    expect(menuItems[0].action).toBe(toggleTheme);
    expect(menuItems[1].label).toBe('popup_html_open_in_side_panel');
    expect(menuItems[1].icon).toBe(SVGIcons.MENU_USER_PREFERENCES_DETACH_EXTENSION);
    expect(menuItems[1].action).toBeDefined();
  });

  it('uses light theme icon when dark mode is active', () => {
    const menuItems = getSettingsPreferencesDisplayMenuItems({
      theme: Theme.DARK,
      toggleTheme,
    });

    expect(menuItems[0].icon).toBe(SVGIcons.MENU_THEME_LIGHT);
  });
});
