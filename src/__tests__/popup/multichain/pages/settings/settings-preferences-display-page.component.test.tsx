import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { Theme, ThemeContext } from '@popup/theme.context';
import { DetachedExtensionTabUtils } from 'src/popup/multichain/utils/detached-extension-tab.utils';
import { SettingsPreferencesDisplaySubmenuPageComponent } from 'src/popup/multichain/pages/settings/settings-preferences-display-submenu-page.component';
import { SVGIcons } from 'src/common-ui/icons.enum';

const createStore = () => ({
  getState: () => ({
    navigation: { stack: [] },
    titleContainer: {},
    hive: { accounts: [] },
    evm: { accounts: [] },
    chain: {},
  }),
  subscribe: jest.fn(),
  dispatch: jest.fn(),
});

describe('SettingsPreferencesDisplaySubmenuPageComponent', () => {
  const toggleTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderSubmenu = (theme: Theme = Theme.LIGHT) => {
    render(
      <Provider store={createStore() as any}>
        <ThemeContext.Provider
          value={{ theme, setTheme: jest.fn(), toggleTheme }}>
          <SettingsPreferencesDisplaySubmenuPageComponent />
        </ThemeContext.Provider>
      </Provider>,
    );
  };

  it('renders theme and open in side panel menu items', () => {
    renderSubmenu();

    expect(
      screen.getByTestId('SETTINGS_PREFERENCES_AND_DISPLAY-page'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`menu-settings-button-${SVGIcons.MENU_THEME_DARK}`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(
        `menu-settings-button-${SVGIcons.MENU_USER_PREFERENCES_DETACH_EXTENSION}`,
      ),
    ).toBeInTheDocument();
  });

  it('toggles theme from the theme menu item', () => {
    renderSubmenu();

    fireEvent.click(
      screen.getByTestId(`menu-settings-button-${SVGIcons.MENU_THEME_DARK}`),
    );

    expect(toggleTheme).toHaveBeenCalled();
  });

  it('opens the side panel from the open in side panel menu item', () => {
    const openDetachedExtension = jest
      .spyOn(DetachedExtensionTabUtils, 'openDetachedExtension')
      .mockResolvedValue();

    renderSubmenu();

    fireEvent.click(
      screen.getByTestId(
        `menu-settings-button-${SVGIcons.MENU_USER_PREFERENCES_DETACH_EXTENSION}`,
      ),
    );

    expect(openDetachedExtension).toHaveBeenCalled();
  });
});
