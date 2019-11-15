let mk = null;
let id_win = null;
let key = null;
let confirmed = false;
let tab = null;
let request = null;
let request_id = null;
let accounts = null;
let timeoutIdle = null;
let autolock = null;
let interval = null;
let rpc = new Rpcs();
// Lock after the browser is idle for more than 10 minutes

chrome.storage.local.get(["current_rpc", "autolock"], function(items) {
  if (items.autolock) startAutolock(JSON.parse(items.autolock));
  rpc.setOptions(items.current_rpc);
});

//Listen to the other parts of the extension
chrome.runtime.onMessage.addListener(chromeMessageHandler);

function chromeMessageHandler(msg, sender, sendResp) {
  // Send mk upon request from the extension popup.
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
  if (msg.command == "getMk") {
    chrome.runtime.sendMessage(
      {
        command: "sendBackMk",
        mk: mk
      },
      function(response) {}
    );
  } else if (msg.command == "stopInterval") {
    clearInterval(interval);
  } else if (msg.command == "setRPC") {
    rpc.setOptions(msg.rpc);
  } else if (msg.command == "sendMk") {
    //Receive mk from the popup (upon registration or unlocking)
    mk = msg.mk;
  } else if (msg.command == "sendAutolock") {
    startAutolock(JSON.parse(msg.autolock));
  } else if (msg.command == "sendRequest") {
    // Receive request (website -> content_script -> background)
    // create a window to let users confirm the transaction
    tab = sender.tab.id;
    checkBeforeCreate(msg.request, tab, msg.domain);
    request = msg.request;
    request_id = msg.request_id;
  } else if (msg.command == "unlockFromDialog") {
    // Receive unlock request from dialog
    chrome.storage.local.get(["accounts"], function(items) {
      // Check
      if (items.accounts == null || items.accounts == undefined) {
        sendErrors(msg.tab, "no_wallet", "No wallet!", "", msg.data);
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
  } else if (msg.command == "acceptTransaction") {
    if (msg.keep) {
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
    }
    confirmed = true;
    performTransaction(msg.data, msg.tab, false);
    // upon receiving the confirmation from user, perform the transaction and notify content_script. Content script will then notify the website.
  }
}
