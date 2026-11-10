import { PopupThemeStartupUtils } from '@popup/multichain/utils/popup-theme-startup.utils';
import { Theme } from '@popup/theme.context';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';

describe('PopupThemeStartupUtils', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = '';
  });

  it('returns and applies a cached dark theme', () => {
    window.localStorage.setItem(LocalStorageKeyEnum.ACTIVE_THEME, Theme.DARK);

    expect(PopupThemeStartupUtils.getCachedTheme()).toBe(Theme.DARK);
    expect(document.documentElement.classList.contains('popup-theme-dark')).toBe(
      true,
    );
    expect(
      document.documentElement.classList.contains('popup-theme-light'),
    ).toBe(false);
  });

  it('ignores invalid cached theme values', () => {
    window.localStorage.setItem(LocalStorageKeyEnum.ACTIVE_THEME, 'blue');

    expect(PopupThemeStartupUtils.getCachedTheme()).toBeNull();
    expect(document.documentElement.className).toBe('');
  });

  it('caches and applies the light theme', () => {
    PopupThemeStartupUtils.cacheTheme(Theme.LIGHT);

    expect(window.localStorage.getItem(LocalStorageKeyEnum.ACTIVE_THEME)).toBe(
      Theme.LIGHT,
    );
    expect(
      document.documentElement.classList.contains('popup-theme-light'),
    ).toBe(true);
    expect(document.documentElement.classList.contains('popup-theme-dark')).toBe(
      false,
    );
  });
});
