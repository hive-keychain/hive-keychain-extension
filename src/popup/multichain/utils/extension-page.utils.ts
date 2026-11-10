const openInTab = (path: string): void => {
  const url = chrome.runtime.getURL(path);
  chrome.tabs.create({ url });
};

export const ExtensionPageUtils = {
  openInTab,
};
