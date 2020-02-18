const rpcs = new Rpcs();

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
      rpcs.setOptions(items.current_rpc || "DEFAULT");
      if (!msg.mk) {
        if (!items.accounts) {
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
