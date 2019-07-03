let mk = null;
let id_win = null;
let key = null;
let confirmed = false;
let tab = null;
let request = null;
let request_id = null;
let accounts = null;
let timeoutIdle=null;
let autolock=null;
let interval=null;
// Lock after the browser is idle for more than 10 minutes

chrome.storage.local.get(['current_rpc','autolock'], function(items) {
  if(items.autolock)
		startAutolock(JSON.parse(items.autolock));

	steem.api.setOptions({
			transport: 'http',
			uri: items.current_rpc || 'https://api.steemit.com',
			url: items.current_rpc || 'https://api.steemit.com'
	});
});

const keychainify = {
    init: function() {
        chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
            if(details.frameId === 0) {
                // Fires only when details.url === currentTab.url
                chrome.tabs.get(details.tabId, function(tab) {
                    keychainify.run(tab);
                });
            }
        });
    },

    run: async function (tab) {
        if(await keychainify.isKeychainifyEnabled()) {
            keychainify.convertSteemConnectUrl(tab);
        }
    },

    isKeychainifyEnabled: function () {
        return new Promise(function(resolve, reject) {
            try {
                chrome.storage.local.get(['steemconnect_keychainify'], function(items) {
                    resolve(!items.hasOwnProperty('steemconnect_keychainify') || items.steemconnect_keychainify)
                });
            } catch(err) {
                reject(err);
            }
        });
    },

    convertSteemConnectUrl: function (tab) {
        const url = tab.url;
        const vars = keychainify.getVarsFromURL(url);
        let payload = {},
          defaults = {};

        switch(true) {
          /**
           * Transfer fund
           */
            case (url.indexOf('steemconnect.com/sign/transfer') !== -1):
                defaults = {
                    from: null,
                    to: null,
                    amount: 0,
                    memo: '',
                    currency: 'STEEM'
                };

                payload = Object.assign(defaults, vars);

                [payload.amount, payload.currency] = vars.amount.split(' ');
                keychainify.requestTransfer(tab, payload.from, payload.to, payload.amount, payload.memo, payload.currency);
                break;
        }
    },

    requestTransfer: function(tab, account, to, amount, memo, currency, enforce = false) {
        const request = {
            type: "transfer",
            username: account,
            to: to,
            amount: amount,
            memo: memo,
            enforce: enforce,
            currency: currency
        };

        keychainify.dispatchRequest(tab, request);
    },

    dispatchRequest: function(tab, request) {
        const now = new Date().getTime();

        chromeMessageHandler(
          {
              command: "sendRequest",
              request: request,
              domain: window.location.hostname,
              request_id: now
          },
          {
              tab: tab
          }
        );
    },

    getVarsFromURL: function(url) {
        const argsParsed = {};

        if (url.indexOf('?') !== -1) {
            const query = url.split('?').pop();
            const args = query.split('&');
            let arg, kvp, key, value;

            for (let i=0; i<args.length; i++) {
                arg = args[i];
                if (arg.indexOf('=') === -1) {
                    argsParsed[decodeURIComponent(arg)] = true;
                } else {
                    kvp = arg.split('=');
                    key = decodeURIComponent(kvp[0]);
                    value = decodeURIComponent(kvp[1]);
                    argsParsed[key] = value;
                }
            }
        }

        return argsParsed;
    }
};
keychainify.init();

async function startAutolock(autoLock){
  //Receive autolock from the popup (upon registration or unlocking)
      autolock=autoLock;
      console.log(autolock);
      if(mk==null)
        return;
      if (!autolock || autolock.type == "default")
          return;
      console.log("start autolock");
      if(autolock.type == "locked"){
      chrome.idle.setDetectionInterval(parseInt(autolock.mn) * 60);
      chrome.idle.onStateChanged.addListener(
          function(state) {
              console.log(state,autolock.type);
              if (state === "locked") {
                  mk = null;
                  console.log("lock");
              }
        });
      }
      else if (autolock.type=="idle"){
        restartIdleCounter();
      }
}
//Create Custom Idle Function
function restartIdleCounter(){
  console.log("idleCounter",new Date().toISOString());
  clearTimeout(timeoutIdle);
  timeoutIdle=setTimeout(function(){
    console.log("locked",new Date().toISOString());
    mk=null;
  },autolock.mn*60000);
}
//Listen to the other parts of the extension
chrome.runtime.onMessage.addListener(chromeMessageHandler);

function chromeMessageHandler(msg, sender, sendResp) {
    // Send mk upon request from the extension popup.
    if (autolock!=null&&autolock.type=="idle"&&(msg.command == "getMk"||msg.command == "setRPC"||msg.command == "sendMk"||msg.command == "sendRequest"||msg.command == "acceptTransaction"||msg.command == "ping"))
        restartIdleCounter();
    if (msg.command == "getMk") {
        chrome.runtime.sendMessage({
            command: "sendBackMk",
            mk: mk
        }, function(response) {});
    } else if (msg.command == "stopInterval") {
        clearInterval(interval);
    }else if (msg.command == "setRPC") {
        steem.api.setOptions({
            url: msg.rpc || 'https://api.steemit.com'
        });
    } else if (msg.command == "sendMk") { //Receive mk from the popup (upon registration or unlocking)
        mk = msg.mk;
    } else if (msg.command == "sendAutolock") {
        startAutolock(JSON.parse(msg.autolock));
    } else if (msg.command == "sendRequest") { // Receive request (website -> content_script -> background)
        // create a window to let users confirm the transaction
        tab = sender.tab.id;
        checkBeforeCreate(msg.request, tab, msg.domain);
        request = msg.request;
        request_id = msg.request_id;

    } else if (msg.command == "unlockFromDialog") { // Receive unlock request from dialog
        chrome.storage.local.get(['accounts'], function(items) { // Check
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
            chrome.storage.local.get(['no_confirm'], function(items) {
                let keep = (items.no_confirm == null || items.no_confirm == undefined) ? {} : JSON.parse(items.no_confirm);
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
        performTransaction(msg.data, msg.tab,false);
        // upon receiving the confirmation from user, perform the transaction and notify content_script. Content script will then notify the website.
    }
}

async function performTransaction(data, tab,no_confirm) {
    try {
        switch (data.type) {
            case "vote":
                steem.broadcast.vote(key, data.username, data.author, data.permlink, parseInt(data.weight), function(err, result) {
                    const message = {
                        command: "answerRequest",
                        msg: {
                            success: err == null,
                            error: err,
                            result: result,
                            data: data,
                            message: err == null ? "The transaction has been broadcasted successfully." : "There was an error broadcasting this transaction, please try again.",
                            request_id: request_id
                        }
                    };
                    console.log("messageVote",message,err,result);
                    chrome.tabs.sendMessage(tab, message);
                    if(no_confirm){
                      if (id_win != null)
                          removeWindow(id_win);
                    }
                    else
                      chrome.runtime.sendMessage(message);
                    key = null;
                    accounts = null;
                });
                break;
						case "custom":
                steem.broadcast.customJson(key, data.method.toLowerCase() == "active" ? [data.username] : null, data.method.toLowerCase() == "posting" ? [data.username] : null, data.id, data.json, function(err, result) {
                    const message = {
                        command: "answerRequest",
                        msg: {
                            success: err == null,
                            error: err,
                            result: result,
                            data: data,
                            message: err == null ? "The transaction has been broadcasted successfully." : "There was an error broadcasting this transaction, please try again.",
                            request_id: request_id
                        }
                    };
                    chrome.tabs.sendMessage(tab, message);
                    if(no_confirm){
                      if (id_win != null){
                        removeWindow(id_win);
                      }
                    }
                    else
                      chrome.runtime.sendMessage(message);
                    key = null;
                    accounts = null;
                });

                break;
            case "transfer":
                let ac = accounts.list.find(function(e) {
                    return e.name == data.username
                });
                let memo = data.memo || "";
                let key_transfer = ac.keys.active;
                if (data.memo && data.memo.length > 0 && data.memo[0] == "#") {
                    try {
                        const receiver = await steem.api.getAccountsAsync([data.to]);
                        const memoReceiver = receiver["0"].memo_key;
                        memo = window.encodeMemo(ac.keys.memo, memoReceiver, memo);
                    } catch (e) {
                        console.log(e);
                    }
                }
                steem.broadcast.transfer(key_transfer, data.username, data.to, data.amount + " " + data.currency, memo, function(err, result) {
                    const message = {
                        command: "answerRequest",
                        msg: {
                            success: err == null,
                            error: err,
                            result: result,
                            data: data,
                            message: err == null ? "The transaction has been broadcasted successfully." : "There was an error broadcasting this transaction, please try again.",
                            request_id: request_id
                        }
                    };

                    chrome.tabs.sendMessage(tab, message);
                    chrome.runtime.sendMessage(message);
                    key = null;
                    accounts = null;
                });
                break;
            case "post":
                if (data.comment_options == "") {
                    steem.broadcast.comment(key, data.parent_username, data.parent_perm, data.username, data.permlink, data.title, data.body, data.json_metadata, function(err, result) {
                        const message = {
                            command: "answerRequest",
                            msg: {
                                success: err == null,
                                error: err,
                                result: result,
                                data: data,
                                message: err == null ? "The transaction has been broadcasted successfully." : "There was an error broadcasting this transaction, please try again.",
                                request_id: request_id
                            }
                        };
                        chrome.tabs.sendMessage(tab, message);
                        if(no_confirm){
                          if (id_win != null)
                              removeWindow(id_win);
                        }
                        else
                          chrome.runtime.sendMessage(message);
                        key = null;
                        accounts = null;
                    });
                } else {
                    const operations = [
                        ['comment',
                            {
                                parent_author: data.parent_username,
                                parent_permlink: data.parent_perm,
                                author: data.username,
                                permlink: data.permlink,
                                title: data.title,
                                body: data.body,
                                json_metadata: data.json_metadata
                            }
                        ],
                        ['comment_options',
                            JSON.parse(data.comment_options)
                        ]
                    ];
                    steem.broadcast.send({
                        operations,
                        extensions: []
                    }, {
                        posting: key
                    }, function(err, result) {
                        const message = {
                            command: "answerRequest",
                            msg: {
                                success: err == null,
                                error: err,
                                result: result,
                                data: data,
                                message: err == null ? "The transaction has been broadcasted successfully." : "There was an error broadcasting this transaction, please try again.",
                                request_id: request_id
                            }
                        };
                        chrome.tabs.sendMessage(tab, message);
                        if(no_confirm){
                          if (id_win != null)
                              removeWindow(id_win);
                        }
                        else
                          chrome.runtime.sendMessage(message);
                        key = null;
                        accounts = null;
                    });

                }
                break;
            case "addAccountAuthority":
                steem.broadcast.addAccountAuth({
                    signingKey: key,
                    username: data.username,
                    authorizedUsername: data.authorizedUsername,
                    role: data.role.toLowerCase(),
                    weight: parseInt(data.weight)
                }, function(err, result) {
                    console.log(err, result);
                    const message = {
                        command: "answerRequest",
                        msg: {
                            success: err == null,
                            error: err,
                            result: result,
                            data: data,
                            message: err == null ? "The transaction has been broadcasted successfully." : "There was an error broadcasting this transaction, please try again.",
                            request_id: request_id
                        }
                    };
                    chrome.tabs.sendMessage(tab, message);
                    if(no_confirm){
                      if (id_win != null)
                          removeWindow(id_win);
                    }
                    else
                      chrome.runtime.sendMessage(message);
                    key = null;
                    accounts = null;
                });
                break;
            case "removeAccountAuthority":
                steem.broadcast.removeAccountAuth({
                    signingKey: key,
                    username: data.username,
                    authorizedUsername: data.authorizedUsername,
                    role: data.role.toLowerCase(),
                }, function(err, result) {
                    console.log(err, result);
                    const message = {
                        command: "answerRequest",
                        msg: {
                            success: err == null,
                            error: err,
                            result: result,
                            data: data,
                            message: err == null ? "The transaction has been broadcasted successfully." : "There was an error broadcasting this transaction, please try again.",
                            request_id: request_id
                        }
                    };
                    chrome.tabs.sendMessage(tab, message);
                    if(no_confirm){
                      if (id_win != null)
                          removeWindow(id_win);
                    }
                    else
                      chrome.runtime.sendMessage(message);
                    key = null;
                    accounts = null;
                });
                break;
            case "broadcast":
                const operations = data.operations;
                const broadcastKeys = {};
                broadcastKeys[data.typeWif] = key;
                steem.broadcast.send({
                    operations,
                    extensions: []
                }, broadcastKeys, function(err, result) {
                    console.log(err, result);
                    const message = {
                        command: "answerRequest",
                        msg: {
                            success: err == null,
                            error: err,
                            result: result,
                            data: data,
                            message: err == null ? "The transaction has been broadcasted successfully." : "There was an error broadcasting this transaction, please try again.",
                            request_id: request_id
                        }
                    };
                    chrome.tabs.sendMessage(tab, message);
                    if(no_confirm){
                      if (id_win != null)
                          removeWindow(id_win);
                    }
                    else
                      chrome.runtime.sendMessage(message);
                    key = null;
                    accounts = null;
                });
                break;
            case "signedCall":
                window.signedCall(
                    data.method,
                    data.params,
                    data.username,
                    key,
                    function(err, result) {
                        console.log(err, result);
                        const message = {
                            command: "answerRequest",
                            msg: {
                                success: err == null,
                                error: err,
                                result: result,
                                data: data,
                                message: err == null ? "The transaction has been broadcasted successfully." : "There was an error broadcasting this transaction, please try again.",
                                request_id: request_id
                            }
                        };
                        chrome.tabs.sendMessage(tab, message);
                        if(no_confirm){
                          if (id_win != null)
                              removeWindow(id_win);
                        }
                        else
                          chrome.runtime.sendMessage(message);
                        key = null;
                        accounts = null;
                    });
                break;
            case "delegation":
                steem.api.getDynamicGlobalPropertiesAsync().then((res) => {
                    let delegated_vest = null;
                    if (data.unit == "SP") {
                        const totalSteem = Number(res.total_vesting_fund_steem.split(' ')[0]);
                        const totalVests = Number(res.total_vesting_shares.split(' ')[0]);
                        delegated_vest = parseFloat(data.amount) * totalVests / totalSteem;
                        delegated_vest = delegated_vest.toFixed(6);
                        delegated_vest = delegated_vest.toString() + ' VESTS';
                    } else {
                        delegated_vest = data.amount + ' VESTS';
                    }
                    steem.broadcast.delegateVestingShares(key, data.username, data.delegatee, delegated_vest, function(error, result) {
                        const message = {
                            command: "answerRequest",
                            msg: {
                                success: error == null,
                                error: error,
                                result: result,
                                data: data,
                                message: error == null ? "The transaction has been broadcasted successfully." : "There was an error broadcasting this transaction, please try again.",
                                request_id: request_id
                            }
                        };
                        chrome.tabs.sendMessage(tab, message);
                        if(no_confirm){
                          if (id_win != null)
                              removeWindow(id_win);
                        }
                        else
                          chrome.runtime.sendMessage(message);
                        key = null;
                        accounts = null;
                    });
                });
                break;
            case "witnessVote":
                steem.broadcast.accountWitnessVote(key, data.username, data.witness, data.vote ? 1 : 0, function(error, result) {
                    const message = {
                        command: "answerRequest",
                        msg: {
                            success: error == null,
                            error: error,
                            result: result,
                            data: data,
                            message: error == null ? "The transaction has been broadcasted successfully." : "There was an error broadcasting this transaction, please try again.",
                            request_id: request_id
                        }
                    };
                    chrome.tabs.sendMessage(tab, message);
                    chrome.runtime.sendMessage(message);
                    key = null;
                    accounts = null;
                });
                break;
            case "powerUp":
                steem.broadcast.transferToVesting(key, data.username, data.recipient, data.steem + " STEEM", function(error, result) {
                    const message = {
                        command: "answerRequest",
                        msg: {
                            success: error == null,
                            error: error,
                            result: result,
                            data: data,
                            message: error == null ? "The transaction has been broadcasted successfully." : "There was an error broadcasting this transaction, please try again.",
                            request_id: request_id
                        }
                    };
                    chrome.tabs.sendMessage(tab, message);
                    chrome.runtime.sendMessage(message);
                    key = null;
                    accounts = null;
                });
                break;
            case "powerDown":
            steem.api.getDynamicGlobalPropertiesAsync().then((res) => {
                let vestingShares = null;
                const totalSteem = Number(res.total_vesting_fund_steem.split(' ')[0]);
                const totalVests = Number(res.total_vesting_shares.split(' ')[0]);
                vestingShares = parseFloat(data.steem_power) * totalVests / totalSteem;
                vestingShares = vestingShares.toFixed(6);
                vestingShares = vestingShares.toString() + ' VESTS';

                steem.broadcast.withdrawVesting(key, data.username, vestingShares, function(error, result) {
                    const message = {
                        command: "answerRequest",
                        msg: {
                            success: error == null,
                            error: error,
                            result: result,
                            data: data,
                            message: error == null ? "The transaction has been broadcasted successfully." : "There was an error broadcasting this transaction, please try again.",
                            request_id: request_id
                        }
                    };
                    chrome.tabs.sendMessage(tab, message);
                    chrome.runtime.sendMessage(message);
                    key = null;
                    accounts = null;
                  });
                });
                break;
            case "sendToken":
                const id = config.mainNet;
                const json = {
                    "contractName": "tokens",
                    "contractAction": "transfer",
                    "contractPayload": {
                        "symbol": data.currency,
                        "to": data.to,
                        "quantity": data.amount,
                        "memo":data.memo
                    }
                };
                steem.broadcast.customJson(key, [data.username], null, id, JSON.stringify(json), function(error, result) {
                  const message = {
                      command: "answerRequest",
                      msg: {
                          success: error == null,
                          error: error,
                          result: result,
                          data: data,
                          message: error == null ? "The transaction has been broadcasted successfully." : "There was an error broadcasting this transaction, please try again.",
                          request_id: request_id
                      }
                  };
                  chrome.tabs.sendMessage(tab, message);
                  chrome.runtime.sendMessage(message);
                  key = null;
                  accounts = null;
                });
                break;
            case "decode":
                try {
                    let decoded = window.decodeMemo(key, data.message);
                    
                    let message = {
                        command: "answerRequest",
                        msg: {
                            success: true,
                            error: null,
                            result: decoded,
                            data: data,
                            message: "Memo decoded succesfully",
                            request_id: request_id
                        }
                    };
                    
                    chrome.tabs.sendMessage(tab, message);
                    if(no_confirm){
                      if (id_win != null)
                          removeWindow(id_win);
                    }
                    else {
                      chrome.runtime.sendMessage(message);
                    }
                    key = null;
                    accounts = null;
                } catch (err) {
                  console.log(err);
                    let message = {
                        command: "answerRequest",
                        msg: {
                            success: false,
                            error: 'decode_error',
                            result: null,
                            data: data,
                            message: "Could not verify key.",
                            request_id: request_id
                        }
                    };
                    chrome.tabs.sendMessage(tab, message);
                    chrome.runtime.sendMessage(message);
                    key = null;
                    accounts = null;
                }
                break;
            case "signBuffer":
                try {
                    let signed = window.signBuffer(data.message, key);

                    let message = {
                        command: "answerRequest",
                        msg: {
                            success: true,
                            error: null,
                            result: signed,
                            data: data,
                            message: "Message signed succesfully",
                            request_id: request_id
                        }
                    };
                    chrome.tabs.sendMessage(tab, message);
                    if(no_confirm){
                      if (id_win != null)
                          removeWindow(id_win);
                    }
                    else
                      chrome.runtime.sendMessage(message);
                    key = null;
                    accounts = null;
                } catch (err) {
                    console.log(err);
                    let message = {
                        command: "answerRequest",
                        msg: {
                            success: false,
                            error: 'sign_error',
                            result: null,
                            data: data,
                            message: "Could not sign.",
                            request_id: request_id
                        }
                    };
                    chrome.tabs.sendMessage(tab, message);
                    if(no_confirm){
                      if (id_win != null)
                          removeWindow(id_win);
                    }
                    else
                      chrome.runtime.sendMessage(message);
                    key = null;
                    accounts = null;
                }
                break;
        }
    } catch (e) {
        console.log(e);
        sendErrors(tab, "transaction_error", "An unknown error has occurred.", "An unknown error has occurred.", data);
    }
}

function createPopup(callback) {
    let width = 350;
    confirmed = false;
    //Ensuring only one window is opened by the extension at a time.
    if (id_win != null) {
        removeWindow(id_win);
        id_win = null;
    }
    //Create new window on the top right of the screen
    chrome.windows.getCurrent(function(w) {
        chrome.windows.create({
            url: chrome.runtime.getURL("html/dialog.html"),
            type: "popup",
            height: 566,
            width: width,
            left: w.width - width + w.left,
            top: w.top
        }, function(win) {
            id_win = win.id;
            // Window create fails to take into account window size so it s updated afterwhile.
            chrome.windows.update(win.id, {
                height: 566,
                width: width,
                top: w.top,
                left: w.width - width + w.left
            });
            clearInterval(interval);
            interval=setInterval(callback,200);
            setTimeout(function(){clearInterval(interval)},2000);
        });
    });
}

chrome.windows.onRemoved.addListener(function(id) {
    if (id == id_win && !confirmed) {
      console.log("error6");
        chrome.tabs.sendMessage(tab, {
            command: "answerRequest",
            msg: {
                success: false,
                error: "user_cancel",
                result: null,
                data: request,
                message: "Request was canceled by the user.",
                request_id: request_id
            }
        });
    }
});

function checkBeforeCreate(request, tab, domain) {
    if (mk == null) { // Check if locked
        function callback() {
          console.log("locked");
            chrome.runtime.sendMessage({
                command: "sendDialogError",
                msg: {
                    success: false,
                    error: "locked",
                    result: null,
                    data: request,
                    message: "The wallet is locked!",
                    display_msg: "The current website is trying to send a request to the Steem Keychain browser extension. Please enter your password below to unlock the wallet and continue."
                },
                tab: tab,
                domain: domain
            });
        }
        createPopup(callback);
    } else {
        chrome.storage.local.get(['accounts', 'no_confirm'], function(items) { // Check user
            if (items.accounts == null || items.accounts == undefined) {
                createPopup(function() {
                    sendErrors(tab, "no_wallet", "No wallet!", "", request);
                });
            } else {
                // Check that user and wanted keys are in the wallet
                accounts = (items.accounts == undefined || items.accounts == {
                    list: []
                }) ? null : decryptToJson(items.accounts, mk);
                let account = null;
                if (request.type == "transfer") {
                    let tr_accounts = accounts.list.filter(a => a.keys.hasOwnProperty("active"));
                    const encode = (request.memo != undefined && request.memo.length > 0 && request.memo[0] == "#");
                    const enforce = request.enforce || encode;
                    if (encode)
                        account = accounts.list.find(function(e) {
                            return e.name == request.username;
                        });
                    // If a username is specified, check that its active key has been added to the wallet
                    if (enforce && request.username && !tr_accounts.find(a => a.name == request.username)) {
                        createPopup(function() {
                            console.log("error1");
                            sendErrors(tab, "user_cancel", "Request was canceled by the user.", "The current website is trying to send a transfer request to the Steem Keychain browser extension for account @" + request.username + " using the active key, which has not been added to the wallet.", request);
                        });
                    } else if (encode && !account.keys.hasOwnProperty("memo")) {
                        createPopup(function() {
                            console.log("error2");
                            sendErrors(tab, "user_cancel", "Request was canceled by the user.", "The current website is trying to send a request to the Steem Keychain browser extension for account @" + request.username + " using the memo key, which has not been added to the wallet.", request);
                        });
                    }
                    else if (tr_accounts.length==0){
                      createPopup(function() {
                          console.log("error3");
                        sendErrors(tab, "user_cancel", "Request was canceled by the user.", "The current website is trying to send a transfer request to the Steem Keychain browser extension for account @" + request.username + " using the active key, which has not been added to the wallet.", request);
                      });
                    }
                    else {
                        function callback() {
                            chrome.runtime.sendMessage({
                                command: "sendDialogConfirm",
                                data: request,
                                domain: domain,
                                accounts: tr_accounts,
                                tab: tab
                            });
                        }
                        createPopup(callback);
                    }
                } else {
                    if (!accounts.list.find(e => e.name == request.username)) {
                        function callback() {

                              console.log("error4");
                            sendErrors(tab, "user_cancel", "Request was canceled by the user.", "The current website is trying to send a request to the Steem Keychain browser extension for account @" + request.username + " which has not been added to the wallet.", request);
                        }
                        createPopup(callback);
                    } else {
                        account = accounts.list.find(function(e) {
                            return e.name == request.username;
                        });
                        let typeWif = getRequiredWifType(request);
                        let req = request;
                        req.key=typeWif;

                        if (req.type == "custom")
                            req.method = typeWif;

                        if (req.type == "broadcast") {
                            req.typeWif = typeWif;
                        }

                        if (account.keys[typeWif] == undefined) {
                            createPopup(function() {
                                console.log("error5");
                                sendErrors(tab, "user_cancel", "Request was canceled by the user.", "The current website is trying to send a request to the Steem Keychain browser extension for account @" + request.username + " using the " + typeWif + " key, which has not been added to the wallet.", request);
                            });
                        } else {
                            key = account.keys[typeWif];
                            if (!hasNoConfirm(items.no_confirm, req, domain)) {
                                function callback() {
                                    chrome.runtime.sendMessage({
                                        command: "sendDialogConfirm",
                                        data: req,
                                        domain: domain,
                                        tab: tab
                                    });
                                }
                                createPopup(callback);
                                // Send the request to confirmation window
                            } else {
                                chrome.runtime.sendMessage({command:"broadcastingNoConfirm"});
                                performTransaction(req, tab,true);
                            }
                        }
                    }
                }
            }
        });
    }
}

function hasNoConfirm(arr, data, domain) {
    try {
        if (data.method == "active"||arr==undefined) {
            return false;
        } else
            return JSON.parse(arr)[data.username][domain][data.type] == true;
    } catch (e) {
        console.log(e);
        return false;
    }
}
// Send errors back to the content_script, it will forward it to website
function sendErrors(tab, error, message, display_msg, request) {
    clearInterval(interval);
    interval=setInterval(function(){
      chrome.runtime.sendMessage({
        command: "sendDialogError",
        msg: {
            success: false,
            error: error,
            result: null,
            data: request,
            message: message,
            display_msg: display_msg,
            request_id: request_id
        },
        tab: tab
    });
  },200);
  setTimeout(function(){clearInterval(interval)},2000);
    key = null;
    accounts = null;
}

// Get the key needed for each type of transaction
function getRequiredWifType(request) {
    switch (request.type) {
        case "decode":
        case "signBuffer":
            return request.method.toLowerCase();
            break;
        case "post":
        case "vote":
            return "posting";
            break;
        case "custom":
            return (request.method == null || request.method == undefined) ? "posting" : request.method.toLowerCase();
            break;
        case "addAccountAuthority":
        case "removeAccountAuthority":
        case "broadcast":
            return request.method.toLowerCase();
        case "signedCall":
            return request.typeWif.toLowerCase();
        case "transfer":
            return "active";
            break;
        case "sendToken":
            return "active";
            break;
        case "delegation":
            return "active";
            break;
        case "witnessVote":
            return "active";
            break;
        case "powerUp":
            return "active";
            break;
        case "powerDown":
            return "active";
            break;
    }
}

// check if win exists before removing it
function removeWindow(id_win){
  console.log(id_win);
  chrome.windows.getAll(function(windows){
    const hasWin=windows.filter((win)=>{return win.id==id_win}).length;
    if(hasWin){
      chrome.windows.remove(id_win);
    }
  });
}
