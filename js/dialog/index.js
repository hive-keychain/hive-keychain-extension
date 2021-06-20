const transferValidator = new TransferValidator();
chrome.runtime.onMessage.addListener(function (
  { msg, accounts, command, data, tab, domain, request_id, testnet },
  sender,
  sendResp
) {
  chrome.runtime.sendMessage({
    command: "stopInterval",
  });
  if (command === "sendDialogError") {
    // Display error window

    if (!msg.success) {
      $("#tx_loading").hide();
      if (msg.error === "locked") {
        $(".unlock").show();
        $("#error-ok").hide();
        $("#no-unlock").click(function () {
          window.close();
        });
        $("#yes-unlock").click(function () {
          chrome.runtime.sendMessage({
            command: "unlockFromDialog",
            data: msg.data,
            tab,
            mk: $("#unlock-dialog").val(),
            domain,
            request_id,
          });
        });
        $("#unlock-dialog").keypress(function (e) {
          if (e.keyCode == 13) $("#yes-unlock").click();
        });
        $("#unlock-dialog").focus();
      } else if (msg.error === "register") {
        $(".register").show();
        $("#error-ok").hide();
        $("#error_dialog").hide();
        $("#dialog_header").hide();
        $(".register p").text(msg.display_msg);
        $("#submit_master_pwd").click(function () {
          if (acceptMP($("#master_pwd").val())) {
            if ($("#master_pwd").val() == $("#confirm_master_pwd").val()) {
              chrome.runtime.sendMessage({
                command: "unlockFromDialog",
                data: msg.data,
                tab,
                mk: $("#master_pwd").val(),
                domain,
                request_id,
              });
            } else {
              $("#error_register").text(
                chrome.i18n.getMessage("popup_password_mismatch")
              );
            }
          } else {
            $("#error_register").text(
              chrome.i18n.getMessage("popup_password_regex")
            );
          }
        });
        $("#confirm_master_pwd").keypress(function (e) {
          if (e.keyCode === 13) $("#submit_master_pwd").click();
        });
        $("#master_pwd").focus();
      }
      $("#dialog_header").text(
        msg.error === "locked"
          ? chrome.i18n.getMessage("dialog_header_unlock")
          : chrome.i18n.getMessage("dialog_header_error")
      );
      $("#dialog_header").addClass("error_header");
      $("#error_dialog").text(msg.display_msg);
      $("#modal-body-msg").hide();
      $(".modal-body-error").show();
      $(".dialog-message").hide();
      $("#error-ok").click(function () {
        window.close();
      });
    }
  } else if (command === "wrongMk") {
    $("#error-mk").text(chrome.i18n.getMessage("dialog_header_wrong_pwd"));
  } else if (command === "broadcastingNoConfirm") {
    $("#tx_loading").show();
    $(".unlock").hide();
    $("#dialog_header").text(
      chrome.i18n.getMessage("dialog_header_broadcasting")
    );
    $("#error_dialog").hide();
  } else if (command === "sendDialogConfirm") {
    // Display confirmation window
    $("#confirm_footer").show();
    $("#modal-body-msg").show();
    let { enforce } = data;
    let encode;
    const {
      type,
      display_msg,
      username,
      key,
      method,
      message,
      authorizedUsername,
      role,
      weight,
      authorizedKey,
      operations,
      tx,
      owner,
      active,
      posting,
      memo,
      params,
      typeWif,
      author,
      permlink,
      id,
      json,
      currency,
      amount,
      to,
      body,
      json_metadata,
      parent_perm,
      parent_username,
      comment_options,
      delegatee,
      unit,
      witness,
      vote,
      proxy,
      recipient,
      steem,
      receiver,
      steem_power,
      extensions,
      start,
      title,
      end,
      subject,
      daily_pay,
      proposal_ids,
      keys,
      approve,
      collaterized,
      recurrence,
      executions,
    } = data;

    var titles = {
      custom: chrome.i18n.getMessage("dialog_title_custom"),
      decode: chrome.i18n.getMessage("dialog_title_decode"),
      encode: chrome.i18n.getMessage("dialog_title_encode"),
      signBuffer: title ? title : chrome.i18n.getMessage("dialog_title_sign"),
      addAccountAuthority: chrome.i18n.getMessage("dialog_title_add_auth"),
      removeAccountAuthority: chrome.i18n.getMessage(
        "dialog_title_remove_auth"
      ),
      addKeyAuthority: chrome.i18n.getMessage("dialog_title_add_key_auth"),
      removeKeyAuthority: chrome.i18n.getMessage(
        "dialog_title_remove_key_auth"
      ),
      broadcast: chrome.i18n.getMessage("dialog_title_broadcast"),
      signedCall: chrome.i18n.getMessage("dialog_title_call"),
      post: chrome.i18n.getMessage("dialog_title_post"),
      vote: chrome.i18n.getMessage("dialog_title_vote"),
      transfer: chrome.i18n.getMessage("dialog_title_transfer"),
      delegation: chrome.i18n.getMessage("dialog_title_delegation"),
      witnessVote: chrome.i18n.getMessage("dialog_title_wit"),
      proxy: chrome.i18n.getMessage("dialog_title_proxy"),
      sendToken: chrome.i18n.getMessage("dialog_title_token"),
      powerUp: chrome.i18n.getMessage("dialog_title_powerup"),
      powerDown: chrome.i18n.getMessage("dialog_title_powerdown"),
      createClaimedAccount: chrome.i18n.getMessage(
        "dialog_title_create_account"
      ),
      createProposal: chrome.i18n.getMessage("dialog_title_create_proposal"),
      removeProposal: chrome.i18n.getMessage("dialog_title_remove_proposal"),
      updateProposalVote: chrome.i18n.getMessage("dialog_title_vote_proposal"),
      signTx: chrome.i18n.getMessage("dialog_title_sign_tx"),
      addAccount: chrome.i18n.getMessage("popup_html_add_account"),
      convert: collaterized
        ? chrome.i18n.getMessage("dialog_title_convert_hive")
        : chrome.i18n.getMessage("dialog_title_convert_hbd"),
      recurrentTransfer: chrome.i18n.getMessage(
        "dialog_title_recurrent_transfer"
      ),
    };
    const header = titles[type];
    $("#dialog_header").text(header + (testnet ? " (TESTNET)" : ""));

    if (display_msg) {
      $("#modal-body-msg .msg-data").css("max-height", "245px");
      $("#dialog_message").show();
      $("#dialog_message").text(display_msg);
    }

    if (accounts) {
      $("#modal-body-msg .msg-data").css("max-height", "200px");
      chrome.storage.local.get(["last_chosen_account"], function (items) {
        if (username) {
          let i = accounts.findIndex(function (elt) {
            return elt === username;
          });
          let first = [accounts[i]];
          delete accounts[i];
          accounts = first.concat(accounts);
        } else if (items.last_chosen_account) {
          let i = accounts.findIndex(function (elt) {
            return elt == items.last_chosen_account;
          });
          let first = [accounts[i]];
          delete accounts[i];
          accounts = first.concat(accounts);
        }
        for (acc of accounts) {
          if (acc) {
            const option = document.createElement("option");
            option.textContent = acc;
            $("#select_transfer").append(option);
          }
        }
        initiateCustomSelect(data);
      });
    }
    $("." + type).show();
    $(".modal-body-error").hide();
    $("#username").text(`@${username}`);
    $("#modal-content").css("align-items", "flex-start");
    const keyVerifyAction =
      type === "decode" || type === "signBuffer" || type === "signTx";

    if (
      key !== "active" &&
      (!method || method.toLowerCase() !== "active") &&
      ![
        "transfer",
        "witnessVote",
        "delegation",
        "proxy",
        "addAccount",
      ].includes(type)
    ) {
      $("#keep_div").show();
      let prompt_msg;
      if (username)
        prompt_msg = keyVerifyAction
          ? chrome.i18n.getMessage("dialog_no_prompt_verify", [
              username,
              domain,
            ])
          : chrome.i18n.getMessage("dialog_no_prompt", [
              type,
              username,
              domain,
            ]);
      else
        prompt_msg = chrome.i18n.getMessage("dialog_no_prompt_no_username", [
          type,
          domain,
        ]);
      $("#keep_label").text(prompt_msg);
    } else {
      $(".keep_checkbox").css("display", "none");
      $("#confirm_footer button").css("margin-top", "30px");
    }
    switch (type) {
      case "decode":
        $("#wif").text(method);
        $("#modal-body-msg").css("max-height", "235px");
        $("#dialog_message").show();
        $("#dialog_message").text(
          chrome.i18n.getMessage("dialog_desc_verify", [
            domain,
            method,
            username,
          ])
        );
        break;
      case "encode":
        $("#wif").text(method);
        $("#receiver").text(receiver);
        $("#message_sign").text(message);
        break;
      case "signBuffer":
        $("#dialog_message").show();
        $("#dialog_message").text(
          username
            ? chrome.i18n.getMessage("dialog_desc_sign", [
                domain,
                method,
                username,
              ])
            : chrome.i18n.getMessage("dialog_desc_sign_user_unknown", [
                domain,
                method,
              ])
        );
        showDropdownIfNoUsername(username);
        const fullMessage = message;
        let truncatedMessage = fullMessage.substring(0, 200);
        if (fullMessage.length > 200) {
          truncatedMessage += chrome.i18n.getMessage("dialog_expand");
        }
        let expanded = false;
        $("#message_sign").text(truncatedMessage);
        $("#message_sign").click(function () {
          if (expanded) {
            $("#message_sign").text(truncatedMessage);
            expanded = false;
          } else {
            $("#message_sign").text(fullMessage);
            expanded = true;
          }
        });
        break;
      case "addAccountAuthority":
        $("#authorized_account").text(authorizedUsername);
        $("#role").text(role);
        $("#weight").text(weight);
        break;
      case "removeAccountAuthority":
        $("#authorized_account").text(authorizedUsername);
        $("#role").text(role);
        break;
      case "addKeyAuthority":
        $("#authorized_key").text(authorizedKey);
        $("#role").text(role);
        $("#weight").text(weight);
        break;
      case "removeKeyAuthority":
        $("#authorized_key").text(authorizedKey);
        $("#role").text(role);
        break;
      case "broadcast":
        $("#custom_data").click(function () {
          $("#custom_json").slideToggle();
        });
        $("#custom_json pre").text(JSON.stringify(operations, undefined, 2));
        $("#custom_key").text(method);
        break;
      case "signTx":
        $("#custom_data").click(function () {
          $("#custom_json").slideToggle();
        });
        $("#custom_json pre").text(JSON.stringify(tx.operations, undefined, 2));
        $("#custom_key").text(method);
        break;
      case "createClaimedAccount":
        $("#custom_data").click(function () {
          $("#custom_json").slideToggle();
        });

        $("#custom_json pre").text(
          JSON.stringify(
            {
              owner: owner,
              active: active,
              posting: posting,
              memo: memo,
            },
            undefined,
            2
          )
        );
        break;
      case "signedCall":
        $("#custom_data").click(function () {
          $("#custom_json").slideToggle();
        });
        $("#custom_json div").eq(0).text(method);
        $("#custom_json pre").text(JSON.stringify(params, undefined, 2));

        $("#custom_key").text(typeWif);
        break;
      case "vote":
        $("#weight").text(`${weight / 100}%`);
        $("#author").text(`@${author}`);
        $("#perm").text(permlink);
        break;
      case "custom":
        showDropdownIfNoUsername(username);
        $("#custom_data").click(function () {
          $("#custom_json").slideToggle();
        });
        $("#custom_json div").eq(0).text(id);
        $("#custom_json pre").text(
          JSON.stringify(JSON.parse(json), undefined, 2)
        );
        $("#custom_key").text(method);
        break;
      case "transfer":
        encode = memo !== undefined && memo.length > 0 && memo[0] === "#";
        showBalances(username, currency, amount);
        enforce = enforce || encode;
        if (enforce) {
          $("#username").show();
          $("#username").prev().show();
          $("#transfer_acct_list").hide();
        }
        $("#to").text(`@${to}`);
        $("#amount").text(`${amount} ${currency}`);
        $("#memo").text(memo);
        transferValidator.validate(to, currency, memo);
        if (memo.length > 0) $(".transfer_memo").show();
        break;
      case "post":
        $("#body_toggle").click(function () {
          $("#body").slideToggle();
        });
        $("#options_toggle").click(function () {
          $("#options").slideToggle();
        });

        $("#title").text(title);
        $("#permlink").text(permlink);
        $("#body").text(body);
        $("#json_metadata pre").text(
          JSON.stringify(JSON.parse(json_metadata), null, 2)
        );
        $("#parent_url").text(parent_perm);
        $("#parent_username").text(parent_username);
        if (comment_options !== "") {
          let options = JSON.parse(comment_options);
          $("#max_payout").text(options.max_accepted_payout);
          $("#percent_sbd").text(options.percent_steem_dollars);
          $("#allow_votes").text(options.allow_votes);
          $("#allow_curation_rewards").text(options.allow_curation_rewards);
          let ext = options.extensions;
          let beneficiaries = "";
          if (ext.length) {
            if (ext[0].length >= 2) {
              for (benef of ext[0][1].beneficiaries) {
                beneficiaries += `@${benef.account} (${(
                  benef.weight / 100
                ).toFixed(2)}%) `;
              }
            }
          }
          if (beneficiaries !== "") $("#beneficiaries").text(beneficiaries);
          else $("#beneficiaries_div").hide();
        } else $("#options_toggle").hide();
        if (parent_username === "" || !parent_username) {
          $("#parent_username").hide();
          $("#parent_username_title").hide();
        }
        break;
      case "delegation":
        showDropdownIfNoUsername(username);
        $("#delegatee").text(`@${delegatee}`);
        $("#amt_sp").text(`${amount} ${unit}`);
        break;
      case "witnessVote":
        showDropdownIfNoUsername(username);
        $("#witness").text(witness);
        $("#voteWit").text(JSON.stringify(vote));
        break;
      case "proxy":
        showDropdownIfNoUsername(username);
        $("#proxy").text(proxy.length ? proxy : "None");
        break;
      case "sendToken":
        showBalances(username, currency, amount);
        $("#to").text(`@${to}`);
        $("#amount").text(`${amount} ${currency}`);
        $("#memo").text(memo);
        if (memo.length > 0) $(".transfer_memo").show();
        break;
      case "powerUp":
        $("#to").text(`@${recipient}`);
        $("#amount").text(`${steem} HIVE`);
        break;
      case "powerDown":
        showBalances(username, "HP", steem_power);
        $("#amount").text(`${steem_power} HP`);
        break;
      case "createProposal":
        $("#receiver").text(receiver);
        $("#extensions").text(extensions);
        $("#period_f").text(`From: ${start.replace("T", " ")}`);
        $("#period_t").text(`To: ${end.replace("T", " ")}`);
        $("#title").text(subject);
        $("#permlink").text(permlink);
        $("#daily_pay").text(daily_pay);
        break;
      case "removeProposal":
        $("#proposal_ids").text(proposal_ids);
        $("#extensions").text(extensions);
        break;
      case "updateProposalVote":
        $("#proposal_ids").text(proposal_ids);
        $("#extensions").text(extensions);
        $("#approve").text(approve);
        break;
      case "addAccount":
        $("#keys").html(
          `<div><strong>Posting:</strong><span id="add_account_posting"></span><br/><br/><strong>Active:</strong><span id="add_account_active">
          </span><br/><br/><strong>Memo:</strong><span id="add_account_memo"></span></div>`
        );
        $("#add_account_posting").text(keys.posting ? keys.posting : "Unknown");
        $("#add_account_active").text(keys.active ? keys.active : "Unknown");
        $("#add_account_memo").text(keys.memo ? keys.memo : "Unknown");

        break;
      case "convert":
        $("#amount").text(
          `${amount} ${collaterized ? "HIVE => HBD" : "HBD => HIVE"}`
        );
        break;
      case "recurrentTransfer":
        const days = parseInt(recurrence / 24);
        const hours = parseInt(recurrence % 24);
        let recurrenceString;
        if (!days) {
          recurrenceString = chrome.i18n.getMessage("dialog_recurrence_hours", [
            hours,
          ]);
        } else {
          if (!hours) {
            recurrenceString = chrome.i18n.getMessage(
              "dialog_recurrence_days",
              [days]
            );
          } else {
            recurrenceString = chrome.i18n.getMessage(
              "dialog_recurrence_days_hours",
              [days, hours]
            );
          }
        }
        showDropdownIfNoUsername(username);
        $("#to").text(`@${to}`);
        $("#amount").text(`${amount} ${currency}`);
        $("#recurrence").text(recurrenceString);
        $("#executions").text(
          chrome.i18n.getMessage("dialog_executions_times", [executions])
        );
        $("#memo").text(memo);
        break;
    }

    // Closes the window and launch the transaction in background
    $("#proceed").click(function () {
      if (
        (type === "transfer" && !enforce) ||
        ([
          "witnessVote",
          "delegation",
          "proxy",
          "custom",
          "signBuffer",
          "recurrentTransfer",
        ].includes(type) &&
          !username)
      ) {
        chrome.storage.local.set({
          last_chosen_account: $("#select_transfer option:selected").val(),
        });
        // if transfer account is not enforced or no username is specified for witness vote / delegation
        data.username = $("#select_transfer option:selected").val();
      }
      chrome.runtime.sendMessage({
        command: "acceptTransaction",
        data: data,
        tab: tab,
        domain: domain,
        keep: $("#keep").is(":checked"),
      });
      if (type === "decode" || type === "signBuffer") window.close();
      else {
        $("#confirm_footer").hide();
        $("#modal-body-msg").hide();
        $(".dialog-message").hide();
        $("#tx_loading").show();
      }
    });

    // Closes the window and notify the content script (and then the website) that the user refused the transaction.
    $("#cancel").click(function () {
      window.close();
    });
  } else if (command === "answerRequest") {
    $("#tx_loading").hide();
    $("#dialog_header").text(
      msg.success
        ? `${chrome.i18n.getMessage("dialog_header_success")} !`
        : `${chrome.i18n.getMessage("dialog_header_error")} !`
    );
    $("#error_dialog").text(msg.message);
    $(".modal-body-error").show();
    $("#error-ok").click(function () {
      window.close();
    });
  }
});

const showBalances = async (user, currency, amount) => {
  let balance = 0;
  hive.api.setOptions({ url: "https://api.hive.blog/" });
  if (["hbd", "hive", "hp"].includes(currency.toLowerCase())) {
    const account = (await hive.api.getAccountsAsync([user]))[0];
    switch (currency.toLowerCase()) {
      case "hive":
        balance = parseFloat(account.balance.split(" ")[0]);
        break;
      case "hbd":
        balance = account.sbd_balance
          ? parseFloat(account.sbd_balance.split(" ")[0])
          : parseFloat(account.hbd_balance.split(" ")[0]);
        break;
      case "hp":
        balance = await getHivePower(account.vesting_shares);
        break;
    }
  } else {
    const tokens = await getTokens(user);
    const token = tokens.find((e) => e.symbol === currency);
    balance = token ? parseFloat(token.balance) : 0;
  }
  $("#balance").text(`${balance}  ${currency}`).show();
  const balance_after = (balance - amount).toFixed(3);
  $("#balance_after")
    .text(`${balance_after}  ${currency}`)
    .show()
    .css("color", balance_after > 0 ? "white" : "red");
  $(".balance_loading").hide();
};

const getHivePower = async (vesting_shares) => {
  const result = await hive.api.getDynamicGlobalPropertiesAsync();
  const total_vesting_shares = result.total_vesting_shares;
  const total_vesting_fund =
    result.total_vesting_fund_steem || result.total_vesting_fund_hive;
  // Handle Promises, when you’re sure the two functions were completed simply do:
  return hive.formatter
    .vestToSteem(vesting_shares, total_vesting_shares, total_vesting_fund)
    .toFixed(3);
};

const getTokens = async (account) => {
  const ssc = new SSC("https://api.hive-engine.com/rpc");
  return await ssc.find("tokens", "balances", { account });
};

function initiateCustomSelect(data) {
  /*look for any elements with the class "custom-select":*/
  let prev_username = data.username;
  x = document.getElementsByClassName("custom-select");

  for (i = 0; i < x.length; i++) {
    selElmnt = x[i].getElementsByTagName("select")[0];

    /*for each element, create a new DIV that will act as the selected item:*/
    a = document.createElement("DIV");
    a.setAttribute("class", "select-selected");
    a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
    x[i].appendChild(a);
    /*for each element, create a new DIV that will contain the option list:*/
    b = document.createElement("DIV");
    b.setAttribute("class", "select-items select-hide show-scroll");
    for (j = 0; j < selElmnt.length; j++) {
      /*for each option in the original select element,
      create a new DIV that will act as an option item:*/
      c = document.createElement("DIV");
      c.innerHTML = selElmnt.options[j].innerHTML;
      c.addEventListener("click", function (e) {
        /*when an item is clicked, update the original select box,
        and the selected item:*/
        var y, i, k, s, h;
        s = this.parentNode.parentNode.getElementsByTagName("select")[0];
        h = this.parentNode.previousSibling;
        for (i = 0; i < s.length; i++) {
          if (s.options[i].innerHTML == this.innerHTML) {
            s.selectedIndex = i;
            h.innerHTML = this.innerHTML;
            y = this.parentNode.getElementsByClassName("same-as-selected");
            for (k = 0; k < y.length; k++) {
              y[k].removeAttribute("class");
            }
            this.setAttribute("class", "same-as-selected");
            break;
          }
        }
        h.click();
      });
      b.appendChild(c);
    }
    x[i].appendChild(b);
    a.addEventListener("click", function (e) {
      /*when the select box is clicked, close any other select boxes,
      and open/close the current select box:*/
      e.stopPropagation();
      closeAllSelect(this);
      const username = $(this).text();
      if (username !== prev_username) {
        $("#balance , #balance_after").hide();
        $("#balance_loading").show();
        $("#username").text(username);
        showBalances(username, data.currency, data.amount);
        prev_username = username;
      }
      this.nextSibling.classList.toggle("select-hide");
      this.classList.toggle("select-arrow-active");
    });
  }

  function closeAllSelect(elmnt) {
    /*a function that will close all select boxes in the document,
    except the current select box:*/
    var x,
      y,
      i,
      arrNo = [];
    x = document.getElementsByClassName("select-items");
    y = document.getElementsByClassName("select-selected");
    for (i = 0; i < y.length; i++) {
      if (elmnt == y[i]) {
        arrNo.push(i);
      } else {
        y[i].classList.remove("select-arrow-active");
      }
    }
    for (i = 0; i < x.length; i++) {
      if (arrNo.indexOf(i)) {
        x[i].classList.add("select-hide");
      }
    }
  }
  /*if the user clicks anywhere outside the select box,
  then close all select boxes:*/
  document.addEventListener("click", closeAllSelect);
}

const showDropdownIfNoUsername = (username) => {
  if (!username) {
    $("#username").hide();
    $("#username").prev().hide();
    $("#transfer_acct_list").show();
  }
};

const acceptMP = (mp) => {
  return (
    mp.length >= 16 ||
    (mp.length >= 8 &&
      mp.match(/.*[a-z].*/) &&
      mp.match(/.*[A-Z].*/) &&
      mp.match(/.*[0-9].*/))
  );
};
