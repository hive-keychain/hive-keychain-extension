import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { Theme, ThemeContext } from '@popup/theme.context';
import {
  DisplayAppearancePreferencesComponent,
  DisplayMode,
} from 'src/popup/multichain/pages/settings/display-appearance-preferences.component';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { I18nUtils } from 'src/utils/i18n.utils';

describe('DisplayAppearancePreferencesComponent', () => {
  const setTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    I18nUtils.resetForTesting();
    chrome.i18n.getUILanguage = jest.fn().mockReturnValue('en-US');
    jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage').mockResolvedValue();
  });

  const renderPreferences = (
    props: Partial<React.ComponentProps<
      typeof DisplayAppearancePreferencesComponent
    >> = {},
  ) =>
    render(
      <ThemeContext.Provider
        value={{ theme: Theme.LIGHT, setTheme, toggleTheme: jest.fn() }}>
        <DisplayAppearancePreferencesComponent {...props} />
      </ThemeContext.Provider>,
    );

  it('previews language changes without persisting when persistLanguageOnChange is false', async () => {
    const changeLanguageSpy = jest.spyOn(I18nUtils, 'changeLanguage');
    const saveLanguageSpy = jest.spyOn(I18nUtils, 'saveLanguage');

    renderPreferences({
      loadStoredLanguage: false,
      loadStoredDisplayMode: false,
      persistLanguageOnChange: false,
      persistDisplayModeOnChange: false,
    });

    fireEvent.click(screen.getByTestId('language-select-handle'));
    fireEvent.click(await screen.findByTestId('custom-select-item-fr'));

    await waitFor(() => {
      expect(changeLanguageSpy).toHaveBeenCalledWith('fr');
    });
    expect(saveLanguageSpy).not.toHaveBeenCalled();
  });

  it('keeps the selected display mode after changing theme during setup', async () => {
    renderPreferences({
      loadStoredLanguage: false,
      loadStoredDisplayMode: false,
      persistLanguageOnChange: false,
      persistDisplayModeOnChange: false,
    });

    fireEvent.click(screen.getByTestId('display-mode-toggle-side-panel'));
    fireEvent.click(screen.getByTestId('theme-toggle-dark'));

    expect(screen.getByTestId('display-mode-toggle-side-panel')).toHaveClass(
      'selected',
    );
    expect(setTheme).toHaveBeenCalledWith(Theme.DARK);
  });

  it('persists language changes when persistLanguageOnChange is true', async () => {
    renderPreferences();

    fireEvent.click(screen.getByTestId('language-select-handle'));
    fireEvent.click(await screen.findByTestId('custom-select-item-fr'));

    await waitFor(() => {
      expect(LocalStorageUtils.saveValueInLocalStorage).toHaveBeenCalledWith(
        LocalStorageKeyEnum.ACTIVE_LANGUAGE,
        'fr',
      );
    });
  });
});
