window.sk_params = {
  page: "main"
};

function parseQueryString() {
  const queryString = window.location.search;
  const queryParamString = queryString.split("?").pop();
  const queryParams = queryParamString.split("&");
  for (let qi = 0; qi < queryParams.length; qi++) {
    const queryParam = queryParams[qi];
    const keyValue = queryParam.split("=");
    if (keyValue[0] && keyValue[1]) {
      let value = keyValue[1];
      value = value.replace(/\+/g, "%20");
      value = decodeURIComponent(value);
      window.sk_params[keyValue[0]] = value;
    }
  }
}

parseQueryString();
initializeVisibility(true);

// Check if we have mk or if accounts are stored to know if the wallet is locked unlocked or new.
chrome.runtime.onMessage.addListener(function(msg, sender, sendResp) {
  if (msg.command == "sendBackMk") {
    chrome.storage.local.get(["accounts", "current_rpc"], function(items) {
      steem.api.setOptions({
        url: items.current_rpc || "https://api.steemit.com",
        useAppbaseApi: true
      });
      if (items.current_rpc === "TESTNET") {
        steem.api.setOptions({
          url: "https://testnet.steemitdev.com",
          useAppbaseApi: true
        });
        steem.config.set("address_prefix", "TST");
        steem.config.set(
          "chain_id",
          "46d82ab7d8db682eb1959aed0ada039a6d49afa1602491f93dde9cac3e8e6c32"
        );
      } else {
        steem.config.set("address_prefix", "STM");
        steem.config.set(
          "chain_id",
          "0000000000000000000000000000000000000000000000000000000000000000"
        );
      }
      if (msg.mk == null || msg.mk == undefined) {
        if (items.accounts == null || items.accounts == undefined) {
          showRegister();
        } else {
          showUnlock();
        }
      } else {
        mk = msg.mk;
        initializeMainMenu();
        initializeVisibility();
      }
    });
  }
});
