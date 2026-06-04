import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { Theme, ThemeContext } from '@popup/theme.context';
import { ExtensionSurfaceUtils } from '@popup/multichain/utils/extension-surface.utils';
import { DetachedExtensionTabUtils } from 'src/popup/multichain/utils/detached-extension-tab.utils';
import { SettingsPreferencesDisplayPageComponent } from 'src/popup/multichain/pages/settings/settings-preferences-display-page.component';
import { SidePanelPreferenceUtils } from 'src/utils/side-panel-preference.utils';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { I18nUtils } from 'src/utils/i18n.utils';

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
  const getValueFromLocalStorageMock = jest.spyOn(
    LocalStorageUtils,
    'getValueFromLocalStorage',
  ) as jest.MockedFunction<typeof LocalStorageUtils.getValueFromLocalStorage>;
  const saveValueInLocalStorageMock = jest.spyOn(
    LocalStorageUtils,
    'saveValueInLocalStorage',
  ) as jest.MockedFunction<typeof LocalStorageUtils.saveValueInLocalStorage>;

  beforeEach(() => {
    jest.clearAllMocks();
    I18nUtils.resetForTesting();
    chrome.i18n.getUILanguage = jest.fn().mockReturnValue('en-US');
    getOpenSidePanelByDefaultMock.mockResolvedValue(false);
    setOpenSidePanelByDefaultMock.mockResolvedValue();
    getValueFromLocalStorageMock.mockResolvedValue(undefined);
    saveValueInLocalStorageMock.mockResolvedValue();
    (
      ExtensionSurfaceUtils.isToolbarPopup as jest.MockedFunction<
        typeof ExtensionSurfaceUtils.isToolbarPopup
      >
    ).mockReturnValue(false);
  });

  const renderPage = async (theme: Theme = Theme.LIGHT) => {
    render(
      <Provider store={createStore() as any}>
        <ThemeContext.Provider
          value={{ theme, setTheme, toggleTheme: jest.fn() }}>
          <SettingsPreferencesDisplayPageComponent />
        </ThemeContext.Provider>
      </Provider>,
    );
    await waitFor(() => {
      expect(getOpenSidePanelByDefaultMock).toHaveBeenCalled();
    });
  };

  it('renders appearance and display sections', async () => {
    await renderPage();

    expect(
      screen.getByTestId('settings-preferences-display-content-page'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle-light')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle-dark')).toBeInTheDocument();
    expect(screen.getByTestId('language-select-handle')).toBeInTheDocument();
    expect(
      screen.getByTestId('checkbox-open-side-panel-by-default'),
    ).toBeInTheDocument();
  });

  it('updates theme from the theme switch', async () => {
    await renderPage();

    fireEvent.click(screen.getByTestId('theme-toggle-dark'));

    expect(setTheme).toHaveBeenCalledWith(Theme.DARK);
  });

  it('uses the system language when no saved language preference exists', async () => {
    chrome.i18n.getUILanguage = jest.fn().mockReturnValue('es-MX');

    await renderPage();

    await waitFor(() => {
      expect(screen.getByText('Español')).toBeInTheDocument();
    });
  });

  it('falls back to English when the system language is unavailable', async () => {
    chrome.i18n.getUILanguage = jest.fn().mockReturnValue('sv-SE');

    await renderPage();

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
    });
  });

  it('loads the saved language preference when available', async () => {
    getValueFromLocalStorageMock.mockResolvedValue('id');

    await renderPage();

    await waitFor(() => {
      expect(screen.getByText('Bahasa Indonesia')).toBeInTheDocument();
    });
  });

  it('persists the selected language from the language dropdown', async () => {
    await renderPage();

    fireEvent.click(screen.getByTestId('language-select-handle'));
    fireEvent.click(await screen.findByTestId('custom-select-item-fr'));

    await waitFor(() => {
      expect(saveValueInLocalStorageMock).toHaveBeenCalledWith(
        LocalStorageKeyEnum.ACTIVE_LANGUAGE,
        'fr',
      );
    });
    expect(screen.getByText('Français')).toBeInTheDocument();
  });

  it('shows try side panel button only in toolbar popup', async () => {
    (
      ExtensionSurfaceUtils.isToolbarPopup as jest.MockedFunction<
        typeof ExtensionSurfaceUtils.isToolbarPopup
      >
    ).mockReturnValue(true);

    await renderPage();

    expect(screen.getByTestId('button-open-side-panel')).toBeInTheDocument();
  });

  it('loads open side panel by default preference from storage', async () => {
    getOpenSidePanelByDefaultMock.mockResolvedValue(true);

    await renderPage();

    expect(getOpenSidePanelByDefaultMock).toHaveBeenCalled();
  });

  it('persists open side panel by default preference when toggled', async () => {
    await renderPage();

    fireEvent.click(screen.getByTestId('checkbox-open-side-panel-by-default'));

    expect(setOpenSidePanelByDefaultMock).toHaveBeenCalledWith(true);
  });

  it('opens the side panel from the try side panel button', async () => {
    const openDetachedExtension = jest
      .spyOn(DetachedExtensionTabUtils, 'openDetachedExtension')
      .mockResolvedValue();
    (
      ExtensionSurfaceUtils.isToolbarPopup as jest.MockedFunction<
        typeof ExtensionSurfaceUtils.isToolbarPopup
      >
    ).mockReturnValue(true);

    await renderPage();

    fireEvent.click(screen.getByTestId('button-open-side-panel'));

    expect(openDetachedExtension).toHaveBeenCalled();
  });
});
