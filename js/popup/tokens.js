let tokens = [];
let accountTokenBalances = [];
const urlSSC = [
    "https://steemsmartcontracts.tk",
    "https://testapi.steem-engine.com"
];
const ssc = new SSC(urlSSC[0]);
let hidden_tokens = [];

//chrome.storage.local.set({hidden_tokens:JSON.stringify([])});
chrome.storage.local.get(['hidden_tokens'], function(items) {
    if (items.hidden_tokens)
        hidden_tokens = JSON.parse(items.hidden_tokens || []);
});

getTokens().then(function(tok) {
    tokens = tok;
    console.log(tokens);
    for (token of tokens) {
        let html = "<div class='row_existing_tokens'>\
    <div class='key_checkbox'>\
    <label class='checkbox_container'>\
    <span class='name_token'>" + token.name + "</span>";
        if (token.url)
            html += "<a target='_blank' href='" + token.url + "'><img src='../images/link.png' class='img_token'/></a>";
        html += "<span class='symbol_token'>" + token.symbol + "</span>\
    <span class='issuer_token'>by @" + token.issuer + "</span>\
    <div class='supply_token'>Supply: " + numberWithCommas(nFormatter(token.supply, 3)) + "/" + numberWithCommas(nFormatter(token.maxSupply, 3)) + "</div>\
      <input type='checkbox' checked=true class='check_row_token'/>\
      <span class='checkmark'/>\
    </label>\
    </div>\
    ";

        $("#existing_tokens").append(html);
    }
    for (token of $(".symbol_token")) {
        if (hidden_tokens.includes($(token).html())) {
            $(token).nextAll(".check_row_token").attr("checked", false);
        }
    }

    $(".check_row_token").unbind("change").change(function() {
        const nameToken = $(this).prevAll(".symbol_token").html();
        console.log(hidden_tokens);
        if ($(this).is(':checked')) {
            hidden_tokens = hidden_tokens.filter(function(value, index, arr) {
                return value != nameToken;
            });
        } else {
            hidden_tokens.push(nameToken);
        }
        for (symbol of $(".symbol_owned_token")) {
            if (hidden_tokens.includes($(symbol).html()))
                $(symbol).parent().toggle();
        }
        console.log(hidden_tokens);
        chrome.storage.local.set({
            hidden_tokens: JSON.stringify(hidden_tokens)
        });
    });
});

function showTokenBalances(account) {
    getAccountBalances(account.name).then((tokenBalances) => {
        console.log(tokenBalances);
        accountTokenBalances = tokenBalances;
        $("#tokens_list").empty();
        for (token of tokenBalances) {
            $("#tokens_list").append("<div class='row_token_balance'>\
      <span>" + numberWithCommas(token.balance) + "</span>\
      <span class='symbol_owned_token'>" + token.symbol + "</span>\
      <img src='../images/transfer.png' class='send_token_icon'/>\
      </div>");
        }

        for (symbol of $(".symbol_owned_token")) {
            if (hidden_tokens.includes($(symbol).html()))
                $(symbol).parent().hide();

        }

        if (tokenBalances.length) {
            $("#tokens_div p").html("Displays every non-null token balance. You can hide some balances and check information about the tokens by clicking the Settings wheel.");
        } else {
            $("#tokens_div p").html("You currently don't have any token, click on the settings wheel to get information about the tokens available.");
        }

        if (!active_account.keys.hasOwnProperty("active")) {
            $("#send_tok").addClass("disabled");
            $("#wrap_tok").attr("title", "Please add your active key to send tokens!");
        } else {
            $("#send_tok").removeClass("disabled");
            $("#wrap_tok").removeAttr("title");
        }

        $(".send_token_icon").unbind("click").click(function() {
            const symbol = $(this).prev().html();
            const balance = accountTokenBalances.filter((e) => {
                return e.symbol == symbol;
            })[0].balance;
            $("#token_send_div .back_enabled").html("Send " + symbol);
            $("#tok").html(symbol);
            $(".token_right").html(numberWithCommas(balance));
            $("#token_send_div").show();
            $("#tokens_div").hide();
        });
    });
}

function getTokens() {
    return ssc.find(
        "tokens",
        "tokens", {});
}

function getAccountBalances(account) {
    return ssc.find(
        'tokens',
        'balances', {
            "account": account
        });
}

async function sendToken(account_to, token, amount,memo) {
    const id = "ssc-00000000000000000002";
    const json = {
        "contractName": "tokens",
        "contractAction": "transfer",
        "contractPayload": {
            "symbol": token,
            "to": account_to,
            "quantity": parseFloat(amount),
            "memo":memo
        }
    };
    $("#tok_loading").show();
    if(!await checkAccountExists(account_to)){
      showError("This username is not registered on the blockchain!");
      $("#tok_loading").hide();
      return;
    }
    steem.broadcast.customJson(active_account.keys.active, [active_account.name], null, id, JSON.stringify(json), function(err, result) {
        if (err) {
            $("#tok_loading").hide();
            showError("Something went wrong! Please try again!");
        } else {
            tryConfirmTransaction(result.id).then(function(confirmed) {
                $("#tok_loading").hide();
                if (confirmed){
                    showConfirm("Tokens sent succesfully!");
                    loadAccount(active_account.name);
                    $("#tokens_div").show();
                    $("#token_send_div").hide();
                }
                else
                    showError("We could not confirm that your tokens were sent. However, double check manually before sending again.");
            });
        }
    });
}

function tryConfirmTransaction(trxId) {
    let result;
    return new Promise(async function(fulfill, reject) {
        for (let i = 0; i < 20; i++) {
            result = await getDelayedTransactionInfo(trxId);
            if (result != null)
                break;
        }
        fulfill(result != null);
    });
}

function getDelayedTransactionInfo(trxID) {
    return new Promise(function(fulfill, reject) {
        setTimeout(async function() {
            fulfill(ssc.getTransactionInfo(trxID));
        }, 1000);
    });
}

$("#send_tok").click(function() {
    sendToken($("#send_tok_to").val(), $("#tok").html(), $("#amt_tok").val(),$("#memo_tok").val());
});

function checkAccountExists(account){
  return new Promise(function(fulfill,reject){
     steem.api.getAccounts([account],function(err,res){
       if(err)
          reject(err);
       else
          fulfill(res[0]);
     });
  });
}
