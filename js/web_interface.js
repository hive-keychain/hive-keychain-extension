// Content script interfacing the website and the extension
function setupInjection() {
    try {
        var scriptTag = document.createElement('script')
        scriptTag.src = chrome.runtime.getURL("js/steem_keychain.js");
        var container = document.head || document.documentElement
        container.insertBefore(scriptTag, container.children[0])
    } catch (e) {
        console.error('Steem Keychain injection failed.', e)
    }
}
setupInjection();

// Answering the handshakes
document.addEventListener('swHandshake', function(request) {
    const req=JSON.stringify(request.detail);
    if(request.detail.extension)
      chrome.runtime.sendMessage(request.detail.extension,req );
    else
      location.href = "javascript:steem_keychain.onGetHandshake(); void 0";
});

// Answering the requests
document.addEventListener('swRequest', function(request) {
    var req = request.detail;
    // If all information are filled, send the request to the background, if not notify an error
    if (validate(req)) {
        chrome.runtime.sendMessage({
            command: "sendRequest",
            request: req,
            domain: req.extensionName||window.location.hostname,
            request_id: req.request_id
        });
    } else {
        var response = {
            success: false,
            error: "incomplete",
            result: null,
            message: "Incomplete data or wrong format",
            data: req,
            request_id: req.request_id
        };
        sendResponse(response);
    }
});

// Get notification from the background upon request completion and pass it to the website.
chrome.runtime.onMessage.addListener(function(obj, sender, sendResp) {
    if (obj.command == "answerRequest") {
        sendResponse(obj.msg);
    }
});

function sendResponse(response) {
  if(response.data.extension&&response.data.extensionName)
      chrome.runtime.sendMessage(response.data.extension,JSON.stringify(response));
  else
    location.href = "javascript:steem_keychain.onGetResponse(" + JSON.stringify(response) + "); void 0";
}

function validate(req) {
    return req != null && req != undefined && req.type != undefined && req.type != null &&
        ((req.type == "decode" && isFilled(req.username) && isFilled(req.message) && req.message[0] == "#" && isFilledKey(req.method)) ||
            (req.type == "signBuffer" && isFilled(req.username) && isFilled(req.message) && isFilledKey(req.method)) ||
            (req.type == "vote" && isFilled(req.username) && isFilledWeight(req.weight) && isFilled(req.permlink) && isFilled(req.author)) ||
            (req.type == "post" && isFilled(req.username) && isFilled(req.title) && isFilled(req.body) && isFilled(req.permlink) && isFilled(req.parent_perm) && isFilled(req.json_metadata) && isCustomOptions(req)) ||
            (req.type == "custom" && isFilled(req.username) && isFilled(req.json) && isFilled(req.id)) ||
            (req.type == "broadcast" && isFilled(req.operations) && isFilled(req.method)) ||
            (req.type == "signedCall" && isFilled(req.method) && isFilled(req.json) && isFilled(req.typeWif)) ||
            (req.type == "delegation" && isFilled(req.username) && isFilled(req.delegatee) && isFilledAmtSP(req) && isFilledDelegationMethod(req.unit)) ||
            (req.type == "transfer" && isFilledAmt(req.amount) && isFilled(req.to) && isFilledCurrency(req.currency) && hasTransferInfo(req)));
}


// Functions used to check the incoming data

function hasTransferInfo(req){
  if (req.enforce)
    return isFilled(req.username);
  else if(isFilled(req.memo)&&req.memo[0]=="#")
    return isFilled(req.username);
  else
    return true;
}

function isFilled(obj) {
    return obj != undefined && obj != null && obj != "";
}

function isFilledDelegationMethod(obj){
  return obj=="VESTS"||obj=="SP";
}
function isFilledJSON(obj) {
    try {
        return isFilled(obj) && JSON.parse(obj).hasOwnProperty("requiredAuths") && JSON.parse(obj).hasOwnProperty("requiredPostingAuths") && JSON.parse(obj).hasOwnProperty("id") && JSON.parse(obj).hasOwnProperty("json");
    } catch (e) {
        return false;
    }
}

function isFilledAmt(obj) {
    return isFilled(obj) && !isNaN(obj) && obj > 0 && countDecimals(obj) == 3;
}

function isFilledAmtSP(obj) {
    return isFilled(obj.amount) && !isNaN(obj.amount) && ((countDecimals(obj.amount) == 3&&obj.unit=="SP")||(countDecimals(obj.amount)==6&&obj.unit=="VESTS"));
}

function isFilledWeight(obj) {
    return isFilled(obj) && !isNaN(obj) && obj >= 0 && obj <= 10000 && countDecimals(obj) == 0;
}

function isFilledCurrency(obj) {
    return isFilled(obj) && (obj == "STEEM" || obj == "SBD");
}

function isFilledKey(obj) {
    return isFilled(obj) && (obj == "Memo" || obj == "Active" || obj == "Posting");
}

function isCustomOptions(obj) {
    if (obj.comment_options == "")
        return true;
    let comment_options = JSON.parse(obj.comment_options);
    if (comment_options.author != obj.username || comment_options.permlink != obj.permlink)
        return false;
    return comment_options.hasOwnProperty("max_accepted_payout") &&
        comment_options.hasOwnProperty("percent_steem_dollars") &&
        comment_options.hasOwnProperty("allow_votes") &&
        comment_options.hasOwnProperty("allow_curation_rewards") &&
        comment_options.hasOwnProperty("extensions");
}

function countDecimals(nb) {
    return nb.toString().split(".")[1] == undefined ? 0 : (nb.toString().split(".")[1].length || 0);
}
