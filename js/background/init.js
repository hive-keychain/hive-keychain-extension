let mk = null;
let id_win = null;
let key = null;
let confirmed = false;
let tab = null;
let request = null;
let request_id = null;
let accountsList = new AccountsList();
let idleListenerReady = false;
let autolock = null;
let interval = null;
let rpc = new Rpcs();
// Lock after the browser is idle for more than 10 minutes

chrome.storage.local.get(["no_confirm"], (items) => {
});
chrome.storage.local.get(
  ["current_rpc", "autolock", "claimRewards", "claimAccounts"],
  (items) => {
    if (items.autolock) startAutolock(JSON.parse(items.autolock));
    startClaimRewards(items.claimRewards);
    startClaimAccounts(items.claimAccounts);
    console.info("should set...", items.current_rpc);
    rpc.setOptions(items.current_rpc || "DEFAULT");
  }
);

//Listen to the other parts of the extension

const chromeMessageHandler = (msg, sender, sendResp) => {
  // Send mk upon request from the extension popup.
  switch (msg.command) {
    case "getMk":
      chrome.runtime.sendMessage({
        command: "sendBackMk",
        mk: mk,
      });
      break;
    case "stopInterval":
      clearInterval(interval);
      break;
    case "setRPC":
      console.log(msg.rpc);
      rpc.setOptions(msg.rpc);
      break;
    case "sendMk":
      //Receive mk from the popup (upon registration or unlocking)
      mk = msg.mk;
      try {
        chrome.storage.local.get(["accounts"], function (items) {
          accountsList.init(decryptToJson(items.accounts, mk));
        });
      } catch (e) {
        console.log(e);
      }
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
        chrome.storage.local.get(["accounts"], function (items) {
          const decrypt = decryptToJson(items.accounts, mk);
          if (!decrypt)
            chrome.runtime.sendMessage({
              command: "importResult",
              result: false,
            });
          accountsList.init(decrypt);
          const accounts = decryptToJson(msg.fileData, mk);
          accountsList.import(accounts.list, mk);
          chrome.runtime.sendMessage({
            command: "importResult",
            result: true,
          });
        });
      } catch (e) {
        console.log(e);
        chrome.runtime.sendMessage({
          command: "importResult",
          result: false,
        });
      }
      break;
    case "importPermissions":
      try {
        if (
          msg.hasOwnProperty("fileData") &&
          typeof msg.fileData === "string"
        ) {
          chrome.storage.local.set({ no_confirm: msg.fileData }, function () {
            console.log(
              "[hivekeychain] permissions successfully imported from file"
            );
            chrome.runtime.sendMessage({
              command: "importResult",
              result: true,
            });
          });
        } else {
          console.error("[hivekeychain] no file data to import");
          chrome.runtime.sendMessage({
            command: "importResult",
            result: false,
          });
        }
      } catch (e) {
        console.error("[hivekeychain]", e);
        chrome.runtime.sendMessage({
          command: "importResult",
          result: false,
        });
      }
      break;

    case "updateClaims":
      chrome.storage.local.get(
        ["claimRewards", "claimAccounts"],
        ({ claimRewards, claimAccounts }) => {
          console.log("update", claimRewards);
          startClaimRewards(claimRewards);
          startClaimAccounts(claimAccounts);
        }
      );
      break;
  }
};

const saveNoConfirm = (msg) => {
  chrome.storage.local.get(["no_confirm"], function (items) {
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
      no_confirm: JSON.stringify(keep),
    });
  });
};

const unlockFromDialog = (msg) => {
  chrome.storage.local.get(["accounts"], function (items) {
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
          command: "wrongMk",
        });
      }
    }
  });
};

chrome.runtime.onMessage.addListener(chromeMessageHandler);
