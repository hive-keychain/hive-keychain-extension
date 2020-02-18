const REVEAL_PRIVATE = "Click to show private key";
// All functions regarding the handling of a particular account

// The public key could be supplied by the user or derived from the private key 
// using steem.auth.wifToPublic().  The structures returned by 
// steem.api.getAccounts() will have 'posting' and 'active' members each each 
// of which is a perm_info structure.  These can be passed as the second 
// parameter.  dpub will be the public key you wish to test.
function getPubkeyWeight(dpub /* Public key string */, perm_info /*permission info structure*/) {
  for (let n in perm_info.key_auths) {
    const kw = perm_info.key_auths[n];
    const lpub = kw["0"];
    // later: maybe for multisig we should handle when weight threshold is too low by contacting the cosigner
    if (dpub == lpub) {
      return kw["1"];
    }
  } // for
  return 0;
}

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
    .html(numberWithCommas(await activeAccount.getSteem()));
  $("#vm_val").text(" ($" + vd + ")");

  $("#rc").html(rc.estimated_pct + "%");
  const full = (rc.estimated_pct == 100 ? "" : "Full in ") + rc.fullin;
  $("#rc_info").attr("title", full);
  const accountValue = await activeAccount.getAccountValue();
  if (accountValue) {
    $("#account_value_amt").html(accountValue);
  } else {
    $("#account_value_amt").html("Bittrex is unreachable");
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
        } else memo = "Add your private memo key to read this memo";
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
            ? "TO: @" + transfer[1].op[1].to
            : "FROM: @" + transfer[1].op[1].from) +
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
      .append("No recent transfers");
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
      showError("You already registered an account for @" + username + "!");
    } else
      steem.api.getAccounts([username], function(err, result) {
        if (result.length != 0) {
          const active_info = result["0"].active;
          const posting_info = result["0"].posting;
          const pub_memo = result["0"].memo_key;
          if (steem.auth.isWif(pwd)) {
            const pub_unknown = steem.auth.wifToPublic(pwd);
            if (pub_unknown == pub_memo) {
              addAccount({
		name: username,
		keys: {
		  memo: pwd,
		  memoPubkey: pub_memo
		}
              });
	    } else if (getPubkeyWeight(pub_unknown, posting_info)) {
	      addAccount({
		name: username,
		keys: {
		  posting: pwd,
		  postingPubkey: pub_unknown
		}
	      });
	    } else if (getPubkeyWeight(pub_unknown, active_info)) {
	      addAccount({
		name: username,
		keys: {
		  active: pwd,
		  activePubkey: pub_unknown
		}
	      });
            }
          } else {
            const keys = 
              steem.auth.getPrivateKeys(username, pwd, 
                ["posting", "active", "memo"]);
            const has_active = 
              getPubkeyWeight(keys.activePubkey, active_info) != 0;
            const has_posting = 
              getPubkeyWeight(keys.postingPubkey, posting_info) != 0;
            if ((has_active > 0) || 
              (has_posting > 0) || (keys.memoPubkey == pub_memo)) {
              $("#posting_key").prop("checked", has_posting);
              $("#posting_key").prop("disabled", !has_posting);
              $("#active_key").prop("checked", has_active);
              $("#active_key").prop("disabled", !has_active);
              $("#memo_key").prop("checked", keys.memoPubkey == pub_memo);
              $("#memo_key").prop("disabled", keys.memoPubkey != pub_memo);
              $("#add_account_div").hide();
              $("#master_check").show();
            } else {
              showError("Incorrect private key or password.");
            }
          }
        } else {
          showError("Please check the username and try again.");
        }
      });
  } else {
    showError("Please fill the fields.");
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
        .html()
        .split(" ")[0]
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
          const active_info = result["0"].active;
          const posting_info = result["0"].posting;
          const pub_memo = result["0"].memo_key;
          if (steem.auth.isWif(pwd)) {
            const pub_unknown = steem.auth.wifToPublic(pwd);
            if (adding_key == "memo" && pub_unknown == pub_memo) {
              if (keys.hasOwnProperty("memo"))
                showError("You already entered your memo key!");
              else
                addKeys(index, "memo", pwd, pub_memo, name);
            } else if (adding_key == "posting" && 
                getPubkeyWeight(pub_unknown, posting_info)) {
              if (keys.hasOwnProperty("posting"))
                showError("You already entered your posting key!");
              else
                addKeys(index, "posting", pwd, pub_unknown, name);
            } else if (adding_key == "active" && 
                getPubkeyWeight(pub_unknown, active_info)) {
              if (keys.hasOwnProperty("active"))
                showError("You already entered your active key!");
              else
                addKeys(index, "active", pwd, pub_unknown, name);
            } else
            showError("This is not your " + adding_key + " key!");
          } else {
          const keys = steem.auth.getPrivateKeys(name, pwd, [
            "posting",
            "active",
            "memo"
          ]);
            console.log(keys);
            switch (adding_key) {
              case "memo":
                pub = pub_memo;
                weight = (keys.memoPubkey == pub_memo) ? 1 : 0;
                break;
              case "active":
                pub = keys.activePubkey;
                weight = getPubkeyWeight(keys.activePubkey, active_info);
                break;
              case "posting":
                pub = keys.postingPubkey;
                weight = getPubkeyWeight(keys.postingPubkey, posting_info);
                break;
            }
            if (weight)
              addKeys(index, adding_key, keys[adding_key], pub, name);
            else showError("Not a private WIF!");
          }
        } else {
          showError("Please try again later!");
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
            else
              showError(
                "You need to enter your private Posting key to claim rewards!"
              );
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
