const REVEAL_PRIVATE = chrome.i18n.getMessage("popup_accounts_reveal_private");
const TO = chrome.i18n.getMessage("popup_html_transfer_to");
const FROM = chrome.i18n.getMessage("popup_html_transfer_from");
const NO_RECENT_TRANSFERS = chrome.i18n.getMessage(
  "popup_accounts_no_recent_transfers"
);
const INCORRECT_KEY = chrome.i18n.getMessage("popup_accounts_incorrect_key");
const INCORRECT_USER = chrome.i18n.getMessage("popup_accounts_incorrect_user");
const FILL = chrome.i18n.getMessage("popup_accounts_fill");

// All functions regarding the handling of a particular account
// Load account information
const loadAccount = async name => {
  console.log(`Load account ${name}`);
  activeAccount = accountsList.get(name);
  console.log(activeAccount);
  activeAccount.init();
  $("#recipient").autocomplete({
    source: to_autocomplete[activeAccount.getName()],
    minLength: 2,
    appendTo: "#autocomplete_container"
  });
  $("#send_form").toggle(activeAccount.hasKey("active"));
  $("#show_add_active").toggle(!activeAccount.hasKey("active"));
  $(".wallet_infos").html("...");
  $("#vm_pct").html("...");
  $("#vm_val").html("");
  $("#rc").html("...");
  const [vm, full] = await activeAccount.getVotingMana();
  $("#vm_pct").html(vm + "%");
  $("#vm_info").attr("title", full);

  const witness_votes = await activeAccount.getAccountInfo("witness_votes");
  const proxy = await activeAccount.getAccountInfo("proxy");

  showUserData();
  claimRewards();
  prepareWitnessDiv(witness_votes, proxy);
  prepareDelegationTab();
  preparePowerUpDown();
  showTokenBalances();
  proposeWitnessVote(witness_votes, proxy);
  getAccountHistory();
};

// Display all the account data
const showUserData = async () => {
  showBalances();
  const [vd, rc] = [
    await activeAccount.getVotingDollars(100),
    await activeAccount.getRC()
  ];
  $(".transfer_balance div")
    .eq(1)
    .html(
      numberWithCommas(
        $("#currency_send .select-selected").text() === "STEEM"
          ? await activeAccount.getSteem()
          : await activeAccount.getSBD()
      )
    );
  $("#vm_val").text(" ($" + vd + ")");

  $("#rc").html(rc.estimated_pct + "%");
  const full = (rc.estimated_pct == 100 ? "" : "Full in ") + rc.fullin;
  $("#rc_info").attr("title", full);
  const accountValue = await activeAccount.getAccountValue();
  if (accountValue) {
    $("#account_value_amt").html(accountValue);
  } else {
    $("#account_value_amt").html(
      chrome.i18n.getMessage("popup_accounts_no_bittrex")
    );
  }
};

const getAccountHistory = async () => {
  const transfers = await activeAccount.getTransfers();
  $("#acc_transfers div")
    .eq(1)
    .empty();
  if (transfers.length != 0) {
    for (transfer of transfers) {
      let memo = transfer[1].op[1].memo;
      let timestamp = transfer[1].timestamp;
      let date = new Date(timestamp);
      timestamp =
        date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
      if (memo[0] == "#") {
        if (activeAccount.hasKey("memo")) {
          try {
            memo = window.decodeMemo(activeAccount.getKey("memo"), memo);
          } catch (e) {}
        } else memo = chrome.i18n.getMessage("popup_accounts_add_memo");
      }
      var transfers_element = $(
        "<div class='transfer_row'><span class='transfer_date' title='" +
          transfer[1].timestamp +
          "'>" +
          timestamp +
          "</span><span class='transfer_val'>" +
          (transfer[1].op[1].from == activeAccount.getName() ? "-" : "+") +
          " " +
          transfer[1].op[1].amount.split(" ")[0] +
          "</span><span class='transfer_name'>" +
          (transfer[1].op[1].from == activeAccount.getName()
            ? `${TO}: @` + transfer[1].op[1].to
            : `${FROM}: @` + transfer[1].op[1].from) +
          "</span><span class='transfer_cur'>" +
          transfer[1].op[1].amount.split(" ")[1] +
          "</span></div>"
      );

      var memo_element = $("<div class='memo'></div>");
      memo_element.text(memo);
      transfers_element.append(memo_element);
      $("#acc_transfers div")
        .eq(1)
        .append(transfers_element);
    }
    $(".transfer_row").click(function() {
      $(".memo")
        .eq($(this).index())
        .slideToggle();
    });
  } else
    $("#acc_transfers div")
      .eq(1)
      .append(`<div class="transfer_row">${NO_RECENT_TRANSFERS}</div>`);
};
// Adding accounts. Private keys can be entered individually or by the mean of the
// master key, in which case user can chose which keys to store, mk will then be
// discarded.
$("#check_add_account").click(function() {
  $("#master_check").css("display", "none");
  const username = $("#username").val();
  const pwd = $("#pwd").val();
  if (username !== "" && pwd !== "") {
    if (accountsList && accountsList.get(username)) {
      showError(
        chrome.i18n.getMessage("popup_accounts_already_registered", [username])
      );
    } else
      steem.api.getAccounts([username], function(err, result) {
        if (result.length != 0) {
          const pub_active = result["0"].active.key_auths["0"]["0"];
          const pub_posting = result["0"].posting.key_auths["0"]["0"];
          const pub_memo = result["0"].memo_key;
          if (steem.auth.isWif(pwd)) {
            if (isMemoWif(pwd, pub_memo)) {
              addAccount({
                name: username,
                keys: {
                  memo: pwd,
                  memoPubkey: pub_memo
                }
              });
            } else if (isPostingWif(pwd, pub_posting)) {
              addAccount({
                name: username,
                keys: {
                  posting: pwd,
                  postingPubkey: pub_posting
                }
              });
            } else if (isActiveWif(pwd, pub_active)) {
              addAccount({
                name: username,
                keys: {
                  active: pwd,
                  activePubkey: pub_active
                }
              });
            }
          } else {
            const keys = steem.auth.getPrivateKeys(username, pwd, [
              "posting",
              "active",
              "memo"
            ]);
            console.log(keys);
            if (
              keys.activePubkey == pub_active &&
              keys.postingPubkey == pub_posting &&
              keys.memoPubkey == pub_memo
            ) {
              $("#add_account_div").hide();
              $("#master_check").show();
            } else {
              showError(INCORRECT_KEY);
            }
          }
        } else {
          showError(INCORRECT_USER);
        }
      });
  } else {
    showError(FILL);
  }
});

// If master key was entered, handle which keys to save.
$("#save_master").click(function() {
  if (
    $("#posting_key").prop("checked") ||
    $("#active_key").prop("checked") ||
    $("#memo_key").prop("checked")
  ) {
    let permissions = [];
    if ($("#posting_key").prop("checked")) permissions.push("posting");
    if ($("#active_key").prop("checked")) permissions.push("active");
    if ($("#memo_key").prop("checked")) permissions.push("memo");
    const keys = steem.auth.getPrivateKeys(
      $("#username").val(),
      $("#pwd").val(),
      permissions
    );
    addAccount({
      name: $("#username").val(),
      keys: keys
    });
  }
});

// Add new account to Chrome local storage (encrypted with AES)
const addAccount = account => {
  accountsList.add(new Account(account)).save(mk);
  console.log("init");
  initializeMainMenu();
  initializeVisibility();
};

// Display Add Copy or delete individual keys
const manageKeys = name => {
  let index = -1;
  let account = accountsList.getList().filter((obj, i) => {
    if (obj.getName() === name) {
      index = i;
      return obj;
    }
  })[0];
  const keys = account.getKeys();
  $(".public_key").html("");
  $(".private_key").html("");
  for (keyName in keys) {
    if (keyName.includes("posting")) {
      $(".img_add_key")
        .eq(0)
        .hide();
      $(".remove_key")
        .eq(0)
        .show();
      if (keyName.includes("Pubkey"))
        $(".public_key")
          .eq(0)
          .html(account.getKey(keyName));
      else
        $(".private_key")
          .eq(0)
          .html(REVEAL_PRIVATE)
          .css("font-size", "12px");
    } else if (keyName.includes("active")) {
      $(".img_add_key")
        .eq(1)
        .hide();
      $(".remove_key")
        .eq(1)
        .show();
      if (keyName.includes("Pubkey"))
        $(".public_key")
          .eq(1)
          .html(account.getKey(keyName));
      else
        $(".private_key")
          .eq(1)
          .html(REVEAL_PRIVATE)
          .css("font-size", "12px");
    } else if (keyName.includes("memo")) {
      $(".remove_key")
        .eq(2)
        .show();
      $(".img_add_key")
        .eq(2)
        .hide();
      if (keyName.includes("Pubkey"))
        $(".public_key")
          .eq(2)
          .html(account.getKey(keyName));
      else
        $(".private_key")
          .eq(2)
          .html(REVEAL_PRIVATE)
          .css("font-size", "12px");
    }
  }
  if (
    $(".private_key")
      .eq(0)
      .html() === ""
  ) {
    $(".img_add_key")
      .eq(0)
      .show();
    $(".remove_key")
      .eq(0)
      .hide();
  }
  if (
    $(".private_key")
      .eq(1)
      .html() === ""
  ) {
    $(".img_add_key")
      .eq(1)
      .show();
    $(".remove_key")
      .eq(1)
      .hide();
  }
  if (
    $(".private_key")
      .eq(2)
      .html() === ""
  ) {
    $(".img_add_key")
      .eq(2)
      .show();
    $(".remove_key")
      .eq(2)
      .hide();
  }
  let timeout = null;
  $(".public_key")
    .unbind("click")
    .click(function() {
      if (timeout != null) clearTimeout(timeout);
      $("#copied").hide();
      $("#fake_input").val($(this).html());
      $("#fake_input").select();
      document.execCommand("copy");
      $("#copied").slideDown(600);
      timeout = setTimeout(function() {
        $("#copied").slideUp(600);
      }, 6000);
    });

  $(".private_key")
    .unbind("click")
    .click(function() {
      if (timeout != null) clearTimeout(timeout);
      if ($(this).html() == REVEAL_PRIVATE) {
        const type = $(this)
          .prev()
          .attr("id");
        const key = accountsList.getById(index).getKey(type);
        $(this)
          .html(key)
          .css("font-size", "10px");
      } else {
        $("#copied").hide();
        $("#fake_input").val($(this).html());
        $("#fake_input").select();
        document.execCommand("copy");
        $("#copied").slideDown(600);
        timeout = setTimeout(function() {
          $("#copied").slideUp(600);
        }, 6000);
      }
    });

  $(".remove_key")
    .unbind("click")
    .click(function() {
      accountsList.getById(index).deleteKey($(this).attr("id"));
      accountsList.getById(index).deleteKey(`${$(this).attr("id")}Pubkey`);
      accountsList.save(mk);
      if (!Object.keys(accountsList.getById(index).getKeys()).length) {
        deleteAccount(index);
      } else {
        manageKeys(name);
      }
    });
  // Delete account and all its keys
  $("#delete_account")
    .unbind("click")
    .click(function() {
      deleteAccount(index);
    });
  let adding_key = null;
  $(".img_add_key")
    .unbind("click")
    .click(function() {
      adding_key = $(this)
        .prevAll(".keys_info_type")
        .attr("id")
        .split("_")[0]
        .toLowerCase();
      $("#add_key_div p span").html(adding_key);
      $("#manage_keys").hide();
      $("#add_key_div").show();
    });

  // Try to add the new key
  $("#add_new_key")
    .unbind("click")
    .click(function() {
      const keys = accountsList.getById(index).getKeys();
      const pwd = $("#new_key").val();

      steem.api.getAccounts([name], function(err, result) {
        if (result.length != 0) {
          const pub_active = result["0"].active.key_auths["0"]["0"];
          const pub_posting = result["0"].posting.key_auths["0"]["0"];
          const pub_memo = result["0"].memo_key;
          if (steem.auth.isWif(pwd)) {
            if (adding_key == "memo" && isMemoWif(pwd, pub_memo)) {
              if (keys.hasOwnProperty("memo"))
                showError(
                  chrome.i18n.getMessage("popup_accounts_already_have_key", [
                    chrome.i18n.getMessage("memo")
                  ])
                );
              else addKeys(index, "memo", pwd, pub_memo, name);
            } else if (
              adding_key == "posting" &&
              isPostingWif(pwd, pub_posting)
            ) {
              if (keys.hasOwnProperty("posting"))
                showError(
                  chrome.i18n.getMessage("popup_accounts_already_have_key", [
                    chrome.i18n.getMessage("posting")
                  ])
                );
              else addKeys(index, "posting", pwd, pub_posting, name);
            } else if (adding_key == "active" && isActiveWif(pwd, pub_active)) {
              if (keys.hasOwnProperty("active"))
                showError(
                  chrome.i18n.getMessage("popup_accounts_already_have_key", [
                    chrome.i18n.getMessage("active")
                  ])
                );
              else addKeys(index, "active", pwd, pub_active, name);
            } else {
              console.log(adding_key);
              console.log(
                adding_key,
                chrome.i18n.getMessage(adding_key),
                chrome.i18n.getMessage("popup_accounts_not_your_key", [
                  chrome.i18n.getMessage(adding_key)
                ])
              );
              showError(
                chrome.i18n.getMessage("popup_accounts_not_your_key", [
                  chrome.i18n.getMessage(adding_key)
                ])
              );
            }
          } else {
            const keys = steem.auth.getPrivateKeys(name, pwd, [
              "posting",
              "active",
              "memo"
            ]);
            console.log(keys);
            if (
              keys.activePubkey == pub_active &&
              keys.postingPubkey == pub_posting &&
              keys.memoPubkey == pub_memo
            ) {
              let pub = null;
              let prKey = null;
              switch (adding_key) {
                case "memo":
                  pub = pub_memo;
                  break;
                case "active":
                  pub = pub_active;
                  break;
                case "posting":
                  pub = pub_posting;
                  break;
              }
              addKeys(index, adding_key, keys[adding_key], pub, name);
            } else showError(chrome.i18n.getMessage("popup_accounts_not_wif"));
          }
        } else {
          showError(chrome.i18n.getMessage("popup_accounts_try_again"));
        }
      });
    });
};

// Add the new keys to the display and the encrypted storage
const addKeys = (i, key, priv, pub, name) => {
  accountsList.getById(i).setKey(key, priv);
  accountsList.getById(i).setKey(`${key}Pubkey`, pub);
  accountsList.save(mk);
  manageKeys(name);
  $("#add_key_div").hide();
  $("#new_key").val("");
  $(".error_div").hide();
  $("#manage_keys").show();
};

// show balance for this account
const showBalances = async () => {
  $("#wallet_amt div")
    .eq(0)
    .html(numberWithCommas(await activeAccount.getSteem()));
  $("#wallet_amt div")
    .eq(1)
    .html(numberWithCommas(await activeAccount.getSBD()));
  $("#wallet_amt div")
    .eq(2)
    .html(numberWithCommas(await activeAccount.getSP()));
  $("#balance_loader").hide();
};

// Delete account (and encrypt the rest)
const deleteAccount = i => {
  accountsList.delete(i).save(mk);
  $(".settings_child").hide();
  initializeMainMenu();
  initializeVisibility();
};

const claimRewards = async () => {
  console.log(`Check claim rewards for ${activeAccount.getName()}`);
  const [
    reward_sbd,
    reward_sp,
    reward_steem,
    rewardText
  ] = await activeAccount.getAvailableRewards();
  if (hasReward(reward_sbd, reward_sp, reward_steem)) {
    $("#claim_rewards button").prop("disabled", false);
    $("#claim").show();
    $("#claim")
      .unbind("click")
      .click(function() {
        $("#claim_rewards").show();
        $("#claim_rewards p").html(rewardText);
        $("#redeem_rewards")
          .unbind("click")
          .click(function() {
            $("#claim_rewards button").prop("disabled", true);
            if (activeAccount.hasKey("posting"))
              activeAccount.claimRewards(() => {
                $("#claim_rewards").hide();
                $("#claim_rewards button").prop("disabled", false);
                initializeMainMenu();
              });
            else showError(chrome.i18n.getMessage("popup_accounts_err_claim"));
          });
        $(".close_claim")
          .unbind("click")
          .click(function() {
            $("#claim_rewards").hide();
          });
      });
  } else $("#claim").hide();
};

const proposeWitnessVote = (witness_votes, proxy) => {
  if (
    !proxy &&
    (!witness_votes.includes("stoodkev") ||
      !witness_votes.includes("yabapmatt") ||
      !witness_votes.includes("aggroed"))
  ) {
    $("#stoodkev img").attr(
      "src",
      "../images/icon_witness-vote" +
        (witness_votes.includes("stoodkev") ? "" : "_default") +
        ".svg"
    );
    $("#yabapmatt img").attr(
      "src",
      "../images/icon_witness-vote" +
        (witness_votes.includes("yabapmatt") ? "" : "_default") +
        ".svg"
    );
    $("#aggroed img").attr(
      "src",
      "../images/icon_witness-vote" +
        (witness_votes.includes("aggroed") ? "" : "_default") +
        ".svg"
    );

    if (!witness_votes.includes("yabapmatt"))
      $("#yabapmatt").click(function() {
        voteFor("yabapmatt");
      });

    if (!witness_votes.includes("stoodkev"))
      $("#stoodkev").click(function() {
        voteFor("stoodkev");
      });

    if (!witness_votes.includes("aggroed"))
      $("#aggroed").click(function() {
        voteFor("aggroed");
      });

    setTimeout(function() {
      $("#witness_votes").show();
      $("#witness_votes").animate(
        {
          opacity: 1
        },
        500
      );
    }, 2000);
  } else {
    $("#witness_votes").animate(
      {
        opacity: 0
      },
      500,
      function() {
        $("#witness_votes").hide();
      }
    );
  }
};
