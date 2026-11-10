(function () {
  var activeThemeKey = 'ACTIVE_THEME';
  var applyTheme = function (theme) {
    if (theme !== 'dark' && theme !== 'light') {
      return;
    }
    document.documentElement.classList.toggle(
      'popup-theme-dark',
      theme === 'dark',
    );
    document.documentElement.classList.toggle(
      'popup-theme-light',
      theme === 'light',
    );
    try {
      window.localStorage.setItem(activeThemeKey, theme);
    } catch (error) {
      // Keep the document theme class even when localStorage is unavailable.
    }
  };

  try {
    applyTheme(window.localStorage.getItem(activeThemeKey));
  } catch (error) {
    // Keep the default light popup background when localStorage is unavailable.
  }

  try {
    chrome.storage.local.get([activeThemeKey], function (result) {
      applyTheme(result[activeThemeKey]);
    });
  } catch (error) {
    // chrome.storage can be unavailable outside extension pages.
  }
})();
