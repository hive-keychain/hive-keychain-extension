import { Theme } from '@popup/theme.context';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';

const isTheme = (value: string | null): value is Theme => {
  return value === Theme.DARK || value === Theme.LIGHT;
};

const applyCachedThemeToDocument = (theme: Theme): void => {
  document.documentElement.classList.toggle(
    'popup-theme-dark',
    theme === Theme.DARK,
  );
  document.documentElement.classList.toggle(
    'popup-theme-light',
    theme === Theme.LIGHT,
  );
};

const getCachedTheme = (): Theme | null => {
  try {
    const theme = window.localStorage.getItem(LocalStorageKeyEnum.ACTIVE_THEME);
    if (!isTheme(theme)) {
      return null;
    }
    applyCachedThemeToDocument(theme);
    return theme;
  } catch {
    return null;
  }
};

const cacheTheme = (theme: Theme): void => {
  try {
    window.localStorage.setItem(LocalStorageKeyEnum.ACTIVE_THEME, theme);
  } catch {
    // Browser storage can be unavailable in restricted contexts; chrome storage remains authoritative.
  }
  applyCachedThemeToDocument(theme);
};

export const PopupThemeStartupUtils = {
  getCachedTheme,
  cacheTheme,
};
