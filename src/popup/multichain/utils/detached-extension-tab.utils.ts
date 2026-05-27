const DETACHED_WINDOW_PATH = 'detached_window.html';

const openDetachedExtensionTab = (hash?: string): void => {
  const url = chrome.runtime.getURL(
    hash ? `${DETACHED_WINDOW_PATH}${hash}` : DETACHED_WINDOW_PATH,
  );
  chrome.tabs.create({ url });
};

export const DetachedExtensionTabUtils = {
  openDetachedExtensionTab,
};
