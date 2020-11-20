let tokens = [];
let accountTokenBalances = [];
const urlSSC = ["https://api.hive-engine.com/rpc"];
const ssc = new SSC(urlSSC[0]);
let hidden_tokens = [];
const hiveEngine = "https://accounts.hive-engine.com/accountHistory?account=";
const CHAIN_ID = config.mainNet;
// TODO : extract token logic
chrome.storage.local.get(["hidden_tokens"], function(items) {
  if (items.hidden_tokens)
    hidden_tokens = JSON.parse(items.hidden_tokens || []);
});

getTokens().then(function(tok) {
  tokens = tok;
  for (token of tokens) {
    let html = `<div class='row_existing_tokens'>
    <div class='key_checkbox'>
    <label class='checkbox_container'>
    <span class='name_token'>${token.name}</span>`;
    if (token.url)
      html += `<a target='_blank' href='${token.url}'><img src='../images/link.png' class='img_token'/></a>`;
    html += `<span class='symbol_token'>${token.symbol}</span>
    <span class='issuer_token'>${chrome.i18n.getMessage(
      "popup_token_issued_by",
      [token.issuer]
    )}</span><div class='supply_token'>${chrome.i18n.getMessage(
      "popup_token_supply"
    )}: ${numberWithCommas(nFormatter(token.supply, 3))}/${numberWithCommas(
      nFormatter(token.maxSupply, 3)
    )}</div>
      <input type='checkbox' checked=true class='check_row_token'/>
      <span class='checkmark'/>
    </label>
    </div>
    `;

    $("#existing_tokens").append(html);
  }
  for (token of $(".symbol_token")) {
    if (hidden_tokens.includes($(token).html())) {
      $(token)
        .nextAll(".check_row_token")
        .attr("checked", false);
    }
  }

  $(".check_row_token")
    .unbind("change")
    .change(function() {
      const nameToken = $(this)
        .prevAll(".symbol_token")
        .html();
      if ($(this).is(":checked")) {
        hidden_tokens = hidden_tokens.filter(function(value, index, arr) {
          return value != nameToken;
        });
      } else {
        hidden_tokens.push(nameToken);
      }
      for (symbol of $(".symbol_owned_token")) {
        if (hidden_tokens.includes($(symbol).html()))
          $(symbol)
            .parent()
            .toggle();
      }
      chrome.storage.local.set({
        hidden_tokens: JSON.stringify(hidden_tokens)
      });
    });
});

function showTokenBalances() {
  getAccountBalances(activeAccount.getName()).then(tokenBalances => {
    accountTokenBalances = tokenBalances;
    $("#tokens_list").empty();
    for (token of tokenBalances) {
      $("#tokens_list").append(
        `<div class='row_token_balance'>
      <span>${addCommas(token.balance)}</span>
      <span class='symbol_owned_token'>${token.symbol}</span>
      <img src='../images/history.png' class='history_token_icon'/>
      <img src='../images/transfer.png' class='send_token_icon' symbol='${
        token.symbol
      }'/>
      </div>`
      );
    }

    for (symbol of $(".symbol_owned_token")) {
      if (hidden_tokens.includes($(symbol).html()))
        $(symbol)
          .parent()
          .hide();
    }

    if (tokenBalances.length) {
      $("#tokens_div p").html(
        chrome.i18n.getMessage("popup_view_tokens_balance")
      );
    } else {
      $("#tokens_div p").html(chrome.i18n.getMessage("popup_no_tokens"));
    }

    if (!activeAccount.hasKey("active")) {
      $("#send_tok").addClass("disabled");
      $("#wrap_tok").attr("title", chrome.i18n.getMessage("popup_token_key"));
    } else {
      $("#send_tok").removeClass("disabled");
      $("#wrap_tok").removeAttr("title");
    }

    $(".send_token_icon")
      .unbind("click")
      .click(function() {
        const symbol = $(this).attr("symbol");
        const balance = accountTokenBalances.find(e => e.symbol == symbol)
          .balance;
        $("#token_send_div .back_enabled").html("Send " + symbol);
        $("#tok").html(symbol);
        $(".token_right").html(addCommas(balance));
        $("#token_send_div").show();
        $("#tokens_div").hide();
      });

    $(".history_token_icon")
      .unbind("click")
      .click(function() {
        $("#history_tokens_rows").empty();
        const symbol = $(this)
          .prev()
          .html();
        $("#token_history_div .back_enabled").html(symbol + " History");
        $("#token_history_div").show();
        $("#tokens_div").hide();
        $("#loading_history_token").show();
        getTokenHistory(activeAccount.getName(), 20, 0, symbol).then(function(
          history
        ) {
          for (elt of history) {
            const date = new Date(elt.timestamp * 1000);
            const timestamp =
              date.getMonth() +
              1 +
              "/" +
              date.getDate() +
              "/" +
              date.getFullYear();

            var history_row = $(
              "<div class='history_tokens_row " +
                (elt.memo ? "history_row_memo" : "") +
                "'>\
										<span class='history_date ' title='" +
                elt.timestamp +
                "'>" +
                timestamp +
                "</span>\
										<span class='history_val'>" +
                (elt.from == activeAccount.getName() ? "-" : "+") +
                " " +
                elt.quantity +
                "</span>\
										<span class='history_name'>" +
                (elt.from == activeAccount.getName()
                  ? `${chrome.i18n.getMessage("popup_html_transfer_to")}: @` +
                    elt.to
                  : `${chrome.i18n.getMessage("popup_html_transfer_from")}: @` +
                    elt.from) +
                "</span>\
										<span class='history_cur'>" +
                elt.symbol +
                "</span>\
									</div>"
            );

            var memo_element = $("<div class='history_memo'></div>");
            memo_element.text(elt.memo);
            history_row.append(memo_element);
            $("#history_tokens_rows").append(history_row);
          }
          $("#loading_history_token").hide();
          $(".history_tokens_row")
            .unbind("click")
            .click(function() {
              if (
                $(this)
                  .find(".history_memo")
                  .html() != "null"
              ) {
                $(this)
                  .find(".history_memo")
                  .toggle();
              }
            });
        });
      });
  });
}

function getTokens() {
  return ssc.find("tokens", "tokens", {});
}

function getAccountBalances(account) {
  return ssc.find("tokens", "balances", {
    account: account
  });
}

async function sendToken(account_to, token, amount, memo) {
  $("#confirm_send_tok").hide();
  const id = CHAIN_ID;
  const json = {
    contractName: "tokens",
    contractAction: "transfer",
    contractPayload: {
      symbol: token,
      to: account_to,
      quantity: amount,
      memo: memo
    }
  };
  $("#tok_loading").show();

  if (!(await checkAccountExists(account_to))) {
    showError(chrome.i18n.getMessage("popup_no_such_account"));
    $("#tok_loading").hide();
    return;
  }
  hive.broadcast.customJson(
    activeAccount.getKey("active"),
    [activeAccount.getName()],
    null,
    id,
    JSON.stringify(json),
    function(err, result) {
      if (err) {
        $("#tok_loading").hide();
        showError(chrome.i18n.getMessage("unknown_error"));

        $("#confirm_send_tok").show();
      } else {
        tryConfirmTransaction(result.id).then(function(res) {
          $("#tok_loading").hide();
          $("#confirm_send_tok").show();
          if (res && res.confirmed) {
            if (res.error)
              showError(
                `${chrome.i18n.getMessage("transaction_error")}: ${res.error}`
              );
            else {
              showConfirm(chrome.i18n.getMessage("popup_token_success"));
              $("#confirm_token_send_div").hide();
              $("#tokens_div").show();
            }
          } else showError(chrome.i18n.getMessage("popup_token_timeout"));
        });
      }
    }
  );
}

function tryConfirmTransaction(trxId) {
  let result;
  return new Promise(async function(fulfill, reject) {
    for (let i = 0; i < 20; i++) {
      result = await getDelayedTransactionInfo(trxId);
      if (result != null) break;
    }

    var error = null;
    if (result && result.logs) {
      var logs = JSON.parse(result.logs);

      if (logs.errors && logs.errors.length > 0) error = logs.errors[0];
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

// Show Confirmation window before transfer
$("#send_tok").click(function() {
  confirmTokenTransfer();
});

function confirmTokenTransfer() {
  $("#confirm_token_send_div").show();
  $("#token_send_div").hide();
  const to = $("#send_tok_to").val();
  const amount = $("#amt_tok").val();
  const currency = $("#tok").html();
  let memo = $("#memo_tok").val();
  $("#from_conf_token_transfer").text("@" + activeAccount.getName());
  $("#to_conf_token_transfer").text("@" + to);
  $("#amt_conf_token_transfer").text(amount + " " + currency);
  $("#memo_conf_token_transfer").text(
    memo == "" ? chrome.i18n.getMessage("popup_empty") : memo
  ); // steem engine token memo doesn't support encryption
}

// Send token to a user
$("#confirm_send_tok").click(function() {
  sendToken(
    $("#send_tok_to").val(),
    $("#tok").html(),
    $("#amt_tok").val(),
    $("#memo_tok").val()
  );
});

function checkAccountExists(account) {
  return new Promise(function(fulfill, reject) {
    hive.api.getAccounts([account], function(err, res) {
      if (err) reject(err);
      else fulfill(res[0]);
    });
  });
}

function getTokenHistory(account, limit, offset, currency) {
  return new Promise(function(fulfill, reject) {
    $.ajax({
      type: "GET",
      beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
      },
      url: `${hiveEngine}${account}&limit=${limit}&offset=${offset}&type=user&symbol=${currency}`,
      success: function(tokenHistory) {
        fulfill(tokenHistory);
      },
      error: function(msg) {
        console.log("error", msg);
        reject(msg);
      }
    });
  });
}
