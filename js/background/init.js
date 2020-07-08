let mk = null;
let id_win = null;
let key = null;
let confirmed = false;
let tab = null;
let request = null;
let request_id = null;
let accountsList = new AccountsList();
let timeoutIdle = null;
let autolock = null;
let interval = null;
let rpc = new Rpcs();
// Lock after the browser is idle for more than 10 minutes

chrome.storage.local.get(["current_rpc", "autolock"], function(items) {
  if (items.autolock) startAutolock(JSON.parse(items.autolock));
  rpc.setOptions(items.current_rpc || "DEFAULT");
});

//Listen to the other parts of the extension

const chromeMessageHandler = (msg, sender, sendResp) => {
  // Send mk upon request from the extension popup.
  restartIdleCounterIfNeeded(autolock, msg);
  switch (msg.command) {
    case "getMk":
      chrome.runtime.sendMessage({
        command: "sendBackMk",
        mk: mk
      });
      break;
    case "stopInterval":
      clearInterval(interval);
      break;
    case "setRPC":
      rpc.setOptions(msg.rpc);
      break;
    case "sendMk":
      //Receive mk from the popup (upon registration or unlocking)
      mk = msg.mk;
      break;
    case "sendAutolock":
      startAutolock(JSON.parse(msg.autolock));
      break;
    case "sendRequest":
      // Receive request (website -> content_script -> background)
      // create a window to let users confirm the transaction
      tab = sender.tab.id;
      checkBeforeCreate(msg.request, tab, msg.domain);
      request = msg.request;
      request_id = msg.request_id;
      break;
    case "unlockFromDialog":
      // Receive unlock request from dialog

      unlockFromDialog(msg);
      break;
    case "acceptTransaction":
      if (msg.keep) saveNoConfirm(msg);
      confirmed = true;
      performTransaction(msg.data, msg.tab, false);
      // upon receiving the confirmation from user, perform the transaction and notify content_script. Content script will then notify the website.
      break;
    case "importKeys":
      try {
        chrome.storage.local.get(["accounts"], function(items) {
          const decrypt = decryptToJson(items.accounts, mk);
          if (!decrypt)
            chrome.runtime.sendMessage({
              command: "importResult",
              result: false
            });
          accountsList.init(decrypt);
          const accounts = decryptToJson(msg.fileData, mk);
          accountsList.import(accounts.list, mk);
          chrome.runtime.sendMessage({
            command: "importResult",
            result: true
          });
        });
      } catch (e) {
        console.log(e);
        chrome.runtime.sendMessage({
          command: "importResult",
          result: false
        });
      }
      break;
  }
};

const saveNoConfirm = msg => {
  chrome.storage.local.get(["no_confirm"], function(items) {
    let keep =
      items.no_confirm == null || items.no_confirm == undefined
        ? {}
        : JSON.parse(items.no_confirm);
    if (keep[msg.data.username] == undefined) {
      keep[msg.data.username] = {};
    }
    if (keep[msg.data.username][msg.domain] == undefined) {
      keep[msg.data.username][msg.domain] = {};
    }
    keep[msg.data.username][msg.domain][msg.data.type] = true;
    chrome.storage.local.set({
      no_confirm: JSON.stringify(keep)
    });
  });
};

const unlockFromDialog = msg => {
  chrome.storage.local.get(["accounts"], function(items) {
    if (!items.accounts && msg.data.type !== "addAccount") {
      sendErrors(
        msg.tab,
        "no_wallet",
        chrome.i18n.getMessage("bgd_init_no_wallet"),
        "",
        msg.data
      );
    } else if (!items.accounts) {
      mk = msg.mk;
      checkBeforeCreate(msg.data, msg.tab, msg.domain);
    } else {
      if (decryptToJson(items.accounts, msg.mk) != null) {
        mk = msg.mk;
        startAutolock(autolock);
        checkBeforeCreate(msg.data, msg.tab, msg.domain);
      } else {
        chrome.runtime.sendMessage({
          command: "wrongMk"
        });
      }
    }
  });
};

const restartIdleCounterIfNeeded = (autolock, msg) => {
  if (
    autolock != null &&
    autolock.type == "idle" &&
    (msg.command == "getMk" ||
      msg.command == "setRPC" ||
      msg.command == "sendMk" ||
      msg.command == "sendRequest" ||
      msg.command == "acceptTransaction" ||
      msg.command == "ping")
  )
    restartIdleCounter();
};

chrome.runtime.onMessage.addListener(chromeMessageHandler);
