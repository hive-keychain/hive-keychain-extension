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
      <span>" + addCommas(token.balance) + "</span>\
      <span class='symbol_owned_token'>" + token.symbol + "</span>\
      <img src='../images/transfer.png' class='send_token_icon'/>\
      </div>");
        }

        for (symbol of $(".symbol_owned_token")) {
            if (hidden_tokens.includes($(symbol).html()))
                $(symbol).parent().hide();

        }

        if (tokenBalances.length) {
            $("#tokens_div p").html("View your custom token balances. You can hide certain tokens and see more information by clicking the settings wheel.");
        } else {
            $("#tokens_div p").html("You currently don't have any custom tokens. Click on the settings wheel to get information about the tokens available.");
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
            $(".token_right").html(addCommas(balance));
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
            tryConfirmTransaction(result.id).then(function(res) {
                $("#tok_loading").hide();
                if (res && res.confirmed) {
									if(res.error)
										showError('Transaction error: ' + res.error);
									else
										showConfirm("Tokens sent succesfully!");
								} else
                  showError("Transaction timed out without response. Please double check your token balance before trying to send again.");
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

				var error = null;
				if(result && result.logs) {
					var logs = JSON.parse(result.logs);

					if(logs.errors && logs.errors.length > 0)
						error = logs.errors[0];
				}

        fulfill({ confirmed: result != null, error: error });
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
    sendToken($("#send_tok_to").val(), $("#tok").html(), $("#amt_tok").val());
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

function addCommas(nStr, currency) {
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : ''
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}

	if (x2 == '' && currency == 1)
			x2 = '.00';

	return x1 + x2;
}
