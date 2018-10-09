let mk = null;
let id_win = null;
let key = null;
let confirmed = false;
let tab = null;
let request = null;
let request_id = null;
let accounts = null;
const LOCK_AFTER_SECONDS_IDLE = 15;
// Lock after the browser is idle for more than 10 minutes

//chrome.storage.local.remove("no_confirm");
steem.api.setOptions({
    url: 'https://api.steemit.com'
});

//Listen to the other parts of the extension
chrome.runtime.onMessage.addListener(function(msg, sender, sendResp) {
    // Send mk upon request from the extension popup.
    if (msg.command == "getMk") {
        chrome.runtime.sendMessage({
            command: "sendBackMk",
            mk: mk
        }, function(response) {});
    } else if (msg.command == "sendMk") { //Receive mk from the popup (upon registration or unlocking)
        mk = msg.mk;
    } else if (msg.command == "sendAutolock") { //Receive autolock from the popup (upon registration or unlocking)
        autolock = JSON.parse(msg.autolock);
        if (autolock.type == "default")
            return;
        chrome.idle.setDetectionInterval(autolock.mn * 60);
        chrome.idle.onStateChanged.addListener(
            function(state) {
                if ((autolock.type == "idle" && state === "idle") || state === "locked") {
                    mk = null;
                }
            }
        );
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
        performTransaction(msg.data, msg.tab);
        // upon receiving the confirmation from user, perform the transaction and notify content_script. Content script will then notify the website.
    }
});

function performTransaction(data, tab) {
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
                    chrome.tabs.sendMessage(tab, message);
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
                    chrome.runtime.sendMessage(message);
                    key = null;
                    accounts = null;
                });

                break;
            case "transfer":

                let ac = accounts.list.find(function(e) {
                    return e.name == data.username
                });
                let key_transfer = ac.keys.active;
                steem.broadcast.transfer(key_transfer, data.username, data.to, data.amount + " " + data.currency, data.memo, function(err, result) {
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
                        chrome.runtime.sendMessage(message);
                        key = null;
                        accounts = null;
                    });

                }
                break;
            case "delegation":
                steem.api.getDynamicGlobalPropertiesAsync().then((res) => {
                    const totalSteem = Number(res.total_vesting_fund_steem.split(' ')[0]);
                    const totalVests = Number(res.total_vesting_shares.split(' ')[0]);
                    let delegated_vest = parseFloat(data.sp) * totalVests / totalSteem;
                    delegated_vest = delegated_vest.toFixed(6);
                    delegated_vest = delegated_vest.toString() + ' VESTS';
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
                        chrome.runtime.sendMessage(message);
                        key = null;
                        accounts = null;
                    });
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
                    chrome.runtime.sendMessage(message);
                    key = null;
                    accounts = null;
                } catch (err) {
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
        chrome.windows.remove(id_win);
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

            setTimeout(function() {
                // Window create fails to take into account window size so it s updated afterwhile.
                chrome.windows.update(win.id, {
                    height: 566,
                    width: width,
                    top: w.top,
                    left: w.width - width + w.left
                });
                callback();
            }, 300);
        });
    });

}

chrome.windows.onRemoved.addListener(function(id) {
    if (id == id_win && !confirmed) {
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
                if (request.type == "transfer") {
                    let tr_accounts = accounts.list.filter(a => a.keys.hasOwnProperty("active"));

                    // If a username is specified, check that its active key has been added to the wallet
                    if (request.username && !tr_accounts.find(a => a.name == request.username)) {
                        createPopup(function() {
                            sendErrors(tab, "user_cancel", "Request was canceled by the user.", "The current website is trying to send a transfer request to the Steem Keychain browser extension for account @" + request.username + " using the active key, which has not been added to the wallet.", request);
                        });
                    } else {
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
                            sendErrors(tab, "user_cancel", "Request was canceled by the user.", "The current website is trying to send a request to the Steem Keychain browser extension for account @" + request.username + " which has not been added to the wallet.", request);
                        }
                        createPopup(callback);
                    } else {
                        let account = accounts.list.find(function(e) {
                            return e.name == request.username;
                        });
                        let typeWif = getRequiredWifType(request);
                        let req = request;

                        if (req.type == "custom")
                            req.method = typeWif;

                        if (account.keys[typeWif] == undefined) {
                            createPopup(function() {
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
                                if (id_win != null)
                                    chrome.windows.remove(id_win);

                                performTransaction(req, tab);
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
        return JSON.parse(arr)[data.username][domain][data.type] == true;
    } catch (e) {
        return false;
    }
}
// Send errors back to the content_script, it will forward it to website
function sendErrors(tab, error, message, display_msg, request) {
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
    key = null;
    accounts = null;
}

// Get the key needed for each type of transaction
function getRequiredWifType(request) {
    switch (request.type) {
        case "decode":
            return request.method.toLowerCase();
            break;
        case "post":
        case "vote":
            return "posting";
            break;
        case "custom":
            return (request.method == null || request.method == undefined) ? "posting" : request.method.toLowerCase();
            break;
        case "transfer":
            return "active";
            break;
        case "delegation":
            return "active";
            break;
    }
}