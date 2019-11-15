chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
  if (details.frameId === 0) {
    // Fires only when details.url === currentTab.url
    chrome.tabs.get(details.tabId, async function(tab) {
      if (await keychainify.isKeychainifyEnabled()) {
        keychainify.keychainifyUrl(tab);
      }
    });
  }
});
