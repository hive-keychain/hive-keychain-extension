import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { Theme, ThemeContext } from '@popup/theme.context';
import { ExtensionSurfaceUtils } from '@popup/multichain/utils/extension-surface.utils';
import { DetachedExtensionTabUtils } from 'src/popup/multichain/utils/detached-extension-tab.utils';
import { SettingsPreferencesDisplayPageComponent } from 'src/popup/multichain/pages/settings/settings-preferences-display-page.component';
import { SidePanelPreferenceUtils } from 'src/utils/side-panel-preference.utils';

jest.mock('src/utils/side-panel-preference.utils', () => ({
  SidePanelPreferenceUtils: {
    getOpenSidePanelByDefault: jest.fn(),
    setOpenSidePanelByDefault: jest.fn(),
  },
}));

jest.mock('@popup/multichain/utils/extension-surface.utils', () => ({
  ExtensionSurfaceUtils: {
    isToolbarPopup: jest.fn(),
    isDetachedTab: jest.fn(),
  },
}));

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

describe('SettingsPreferencesDisplayPageComponent', () => {
  const setTheme = jest.fn();
  const getOpenSidePanelByDefaultMock =
    SidePanelPreferenceUtils.getOpenSidePanelByDefault as jest.MockedFunction<
      typeof SidePanelPreferenceUtils.getOpenSidePanelByDefault
    >;
  const setOpenSidePanelByDefaultMock =
    SidePanelPreferenceUtils.setOpenSidePanelByDefault as jest.MockedFunction<
      typeof SidePanelPreferenceUtils.setOpenSidePanelByDefault
    >;

  beforeEach(() => {
    jest.clearAllMocks();
    getOpenSidePanelByDefaultMock.mockResolvedValue(false);
    setOpenSidePanelByDefaultMock.mockResolvedValue();
    (
      ExtensionSurfaceUtils.isToolbarPopup as jest.MockedFunction<
        typeof ExtensionSurfaceUtils.isToolbarPopup
      >
    ).mockReturnValue(false);
  });

  const renderPage = (theme: Theme = Theme.LIGHT) => {
    render(
      <Provider store={createStore() as any}>
        <ThemeContext.Provider
          value={{ theme, setTheme, toggleTheme: jest.fn() }}>
          <SettingsPreferencesDisplayPageComponent />
        </ThemeContext.Provider>
      </Provider>,
    );
  };

  it('renders appearance and display sections', () => {
    renderPage();

    expect(
      screen.getByTestId('settings-preferences-display-content-page'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle-light')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle-dark')).toBeInTheDocument();
    expect(
      screen.getByTestId('checkbox-open-side-panel-by-default'),
    ).toBeInTheDocument();
  });

  it('updates theme from the theme switch', () => {
    renderPage();

    fireEvent.click(screen.getByTestId('theme-toggle-dark'));

    expect(setTheme).toHaveBeenCalledWith(Theme.DARK);
  });

  it('shows try side panel button only in toolbar popup', () => {
    (
      ExtensionSurfaceUtils.isToolbarPopup as jest.MockedFunction<
        typeof ExtensionSurfaceUtils.isToolbarPopup
      >
    ).mockReturnValue(true);

    renderPage();

    expect(screen.getByTestId('button-open-side-panel')).toBeInTheDocument();
  });

  it('loads open side panel by default preference from storage', async () => {
    getOpenSidePanelByDefaultMock.mockResolvedValue(true);

    renderPage();

    await waitFor(() => {
      expect(getOpenSidePanelByDefaultMock).toHaveBeenCalled();
    });
  });

  it('persists open side panel by default preference when toggled', () => {
    renderPage();

    fireEvent.click(screen.getByTestId('checkbox-open-side-panel-by-default'));

    expect(setOpenSidePanelByDefaultMock).toHaveBeenCalledWith(true);
  });

  it('opens the side panel from the try side panel button', () => {
    const openDetachedExtension = jest
      .spyOn(DetachedExtensionTabUtils, 'openDetachedExtension')
      .mockResolvedValue();
    (
      ExtensionSurfaceUtils.isToolbarPopup as jest.MockedFunction<
        typeof ExtensionSurfaceUtils.isToolbarPopup
      >
    ).mockReturnValue(true);

    renderPage();

    fireEvent.click(screen.getByTestId('button-open-side-panel'));

    expect(openDetachedExtension).toHaveBeenCalled();
  });
});
