const STEEMIT_100_PERCENT = 10000;
const STEEM_VOTING_MANA_REGENERATION_SECONDS = 432000;
const CLAIM_ACCOUNT_RC = 6 * 10 ** 12;

// get VM only
var getVotingMana = function(account) {
  return new Promise(function(fulfill, reject) {
    const mana = getVotingManaData(account);
    fulfill(mana.estimated_pct.toFixed(2));
  });
};

// get all information regarding VM
var getVotingManaData = function(account) {
  const estimated_max = getEffectiveVestingSharesPerAccount(account) * 1000000;
  const current_mana = parseFloat(account.voting_manabar.current_mana);
  const last_update_time = account.voting_manabar.last_update_time;
  const diff_in_seconds = Math.round(Date.now() / 1000 - last_update_time);
  let estimated_mana =
    current_mana +
    (diff_in_seconds * estimated_max) / STEEM_VOTING_MANA_REGENERATION_SECONDS;
  if (estimated_mana > estimated_max) estimated_mana = estimated_max;
  const estimated_pct = (estimated_mana / estimated_max) * 100;
  return {
    current_mana: current_mana,
    last_update_time: last_update_time,
    estimated_mana: estimated_mana,
    estimated_max: estimated_max,
    estimated_pct: estimated_pct
  };
};

// get SP + received delegations - delegations sent
var getEffectiveVestingSharesPerAccount = function(account) {
  var effective_vesting_shares =
    parseFloat(account.vesting_shares.replace(" VESTS", "")) +
    parseFloat(account.received_vesting_shares.replace(" VESTS", "")) -
    parseFloat(account.delegated_vesting_shares.replace(" VESTS", ""));
  return effective_vesting_shares;
};

// get SP of the account
var getHivePowerPerAccount = function(
  account,
  totalVestingFund,
  totalVestingShares
) {
  if (totalVestingFund && totalVestingShares) {
    var vesting_shares = getEffectiveVestingSharesPerAccount(account);
    var sp = hive.formatter.vestToSteem(
      vesting_shares,
      totalVestingShares,
      totalVestingFund
    );
    return sp;
  }
};

function calculateVoteValue(
  userEffectiveVests,
  recentClaims,
  rewardBalance,
  medianPrice,
  vp = 10000,
  weight = 10000,
  postRshares
) {
  const userVestingShares = parseInt(userEffectiveVests * 1e6, 10);
  const userVotingPower = vp * (weight / 10000);
  const voteEffectiveShares =
    userVestingShares * (userVotingPower / 10000) * 0.02;

  if (postRshares) {
    // reward curve algorithm
    const multiplier = Math.pow(10, 12);
    const cureveConstant2s = 4 * multiplier;
    const cureveConstant4s = 8 * multiplier;
    const postClaims =
      (postRshares * (postRshares + cureveConstant2s)) /
      (postRshares + cureveConstant4s);

    const postClaimsAfterVote =
      ((postRshares + voteEffectiveShares) *
        (postRshares + voteEffectiveShares + cureveConstant2s)) /
      (postRshares + voteEffectiveShares + cureveConstant4s);

    const voteClaim = postClaimsAfterVote - postClaims;

    const proportion = voteClaim / recentClaims;
    const fullVote = proportion * rewardBalance;

    return (
      fullVote * (parseFloat(medianPrice.base) / parseFloat(medianPrice.quote))
    );
  } else {
    return (
      (voteEffectiveShares / recentClaims) *
      rewardBalance *
      (parseFloat(medianPrice.base) / parseFloat(medianPrice.quote))
    );
  }
}

// get the voting dollars of a vote for a certain account, if full is set
// to true, the VM will be set to 100%, otherwise it will use the current VM
var getVotingDollarsPerAccount = async function(
  voteWeight,
  account,
  rewardBalance,
  recentClaims,
  steemPrice,
  votePowerReserveRate,
  full
) {
  const vm = (await getVotingMana(account)) * 100;
  return new Promise(async function(fulfill, reject) {
    if (rewardBalance && recentClaims && steemPrice && votePowerReserveRate) {
      var effective_vesting_shares = Math.round(
        getEffectiveVestingSharesPerAccount(account) * 1000000
      );
      var current_power = full ? 10000 : vm;
      var weight = voteWeight * 100;

      var max_vote_denom =
        (votePowerReserveRate * STEEMIT_VOTE_REGENERATION_SECONDS) /
        (60 * 60 * 24);
      var used_power = Math.round(
        (current_power * weight) / STEEMIT_100_PERCENT
      );
      used_power = Math.round(
        (used_power + max_vote_denom - 1) / max_vote_denom
      );
      var rshares = Math.round(
        (effective_vesting_shares * used_power) / STEEMIT_100_PERCENT
      );
      var voteValue = ((rshares * rewardBalance) / recentClaims) * steemPrice;
      fulfill(voteValue.toFixed(2));
    } else reject();
  });
};

// get Resource Credits
const getRC = name => {
  let data = {
    jsonrpc: "2.0",
    id: 1,
    method: "rc_api.find_rc_accounts",
    params: {
      accounts: [name]
    }
  };
  let url = rpcs.getCurrent();
  if (url === "DEFAULT") url = "https://api.hive.blog/";
  return new Promise(function(fulfill, reject) {
    $.ajax({
      url: url,
      type: "POST",
      data: JSON.stringify(data),
      success: function(response) {
        console.log(response);
        const STEEM_RC_MANA_REGENERATION_SECONDS = 432000;
        const estimated_max = parseFloat(
          response.result.rc_accounts["0"].max_rc
        );
        const current_mana = parseFloat(
          response.result.rc_accounts["0"].rc_manabar.current_mana
        );
        const last_update_time = parseFloat(
          response.result.rc_accounts["0"].rc_manabar.last_update_time
        );
        const diff_in_seconds = Math.round(
          Date.now() / 1000 - last_update_time
        );
        let estimated_mana =
          current_mana +
          (diff_in_seconds * estimated_max) /
            STEEM_RC_MANA_REGENERATION_SECONDS;
        if (estimated_mana > estimated_max) estimated_mana = estimated_max;

        const estimated_pct = (estimated_mana / estimated_max) * 100;
        const res = {
          current_mana: current_mana,
          last_update_time: last_update_time,
          estimated_mana: estimated_mana,
          estimated_max: estimated_max,
          estimated_pct: estimated_pct.toFixed(2),
          fullin: getTimeBeforeFull(estimated_pct * 100)
        };
        fulfill(res);
      },
      error: function(e) {
        console.log(e);
      }
    });
  });
};

// get in which time the VM will be full
function getTimeBeforeFull(votingPower) {
  var fullInString;
  var remainingPowerToGet = 100.0 - votingPower / 100;
  // 1% every 72minutes
  var minutesNeeded = remainingPowerToGet * 72;
  if (minutesNeeded === 0) {
    return chrome.i18n.getMessage("popup_utils_full");
  } else {
    var fullInDays = parseInt(minutesNeeded / 1440);
    var fullInHours = parseInt((minutesNeeded - fullInDays * 1440) / 60);
    var fullInMinutes = parseInt(
      minutesNeeded - fullInDays * 1440 - fullInHours * 60
    );

    fullInString =
      (fullInDays === 0
        ? ""
        : fullInDays +
          (fullInDays > 1
            ? ` ${chrome.i18n.getMessage("days")} `
            : ` ${chrome.i18n.getMessage("day")} `)) +
      (fullInHours === 0
        ? ""
        : fullInHours +
          (fullInHours > 1
            ? ` ${chrome.i18n.getMessage("hours")} `
            : ` ${chrome.i18n.getMessage("hour")} `)) +
      (fullInMinutes === 0
        ? ""
        : fullInMinutes +
          (fullInMinutes > 1
            ? ` ${chrome.i18n.getMessage("minutes")} `
            : ` ${chrome.i18n.getMessage("minute")} `));
  }
  return chrome.i18n.getMessage("full_in", [fullInString]);
}

// Get STEEM price from Bittrex
function getPricesAsync() {
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: "GET",
      beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
      },
      url: "https://api.steemkeychain.com/hive/bittrex",
      success: function(response) {
        resolve(response);
      },
      error: function(msg) {
        resolve(null);
      }
    });
  });
}

// get Witness Ranks from SteemPlus API
function getWitnessRanks() {
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: "GET",
      beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
      },
      url: "https://api.steemkeychain.com/hive/witnesses-ranks",
      success: function(response) {
        resolve(response);
      },
      error: function(msg) {
        resolve(msg);
      }
    });
  });
}

// Show errors
function showError(message) {
  $(".error_div").html(message);
  $(".error_div").show();
  setTimeout(function() {
    $(".error_div").hide();
  }, 5000);
}

function showConfirm(message) {
  $(".success_div").html(message);
  $(".success_div").show();
  setTimeout(function() {
    $(".success_div").hide();
  }, 5000);
}

// Custom select dropdown
function initiateCustomSelect(options, current_rpc) {
  /*look for any elements with the class "custom-select":*/
  x = document.getElementsByClassName("custom-select");

  for (i = 0; i < x.length; i++) {
    if (i == 5 && custom_created) return;
    if (i == 5 && !custom_created) custom_created = true;
    selElmnt = x[i].getElementsByTagName("select")[0];

    /*for each element, create a new DIV that will act as the selected item:*/
    if ($(x[i]).find("div.select-selected").length) continue;
    a = document.createElement("DIV");
    a.setAttribute("class", "select-selected");
    if (selElmnt.options[selElmnt.selectedIndex])
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
      c.addEventListener("click", function(e) {
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

    if (i === 0) {
      loadAccount(a.innerHTML, options);
    }
    a.addEventListener("click", async function(e) {
      /*when the select box is clicked, close any other select boxes,
      and open/close the current select box:*/
      e.stopPropagation();
      closeAllSelect(this);
      this.nextSibling.classList.toggle("select-hide");
      this.classList.toggle("select-arrow-active");
      if (
        this.innerHTML.includes(chrome.i18n.getMessage("popup_add_account"))
      ) {
        $("#add_import_keys").hide();
        showAddAccount();
      } else if (
        $(this)
          .parent()
          .attr("id") === "custom_select_automated_ops"
      ) {
        showAutomatedTasks(this.innerHTML);
      } else if (
        !getPref &&
        !manageKey &&
        !this.classList.contains("select-arrow-active") &&
        this.innerHTML !== "HBD" &&
        this.innerHTML !== "HIVE" &&
        this.innerHTML !== chrome.i18n.getMessage("popup_html_witness_vote") &&
        this.innerHTML !== chrome.i18n.getMessage("popup_html_chose_proxy")
      ) {
        chrome.storage.local.set({
          last_account: this.innerHTML
        });
        loadAccount(this.innerHTML, options);
      } else if (this.innerHTML === "HBD") {
        const balance = await activeAccount.getHBD();
        $(".transfer_balance div")
          .eq(0)
          .text(chrome.i18n.getMessage("popup_html_balance", ["HBD"]));
        $(".transfer_balance div")
          .eq(1)
          .html(numberWithCommas(balance));
        $("#amt_send_max")
          .unbind("click")
          .click(() => {
            $("#amt_send").val(balance);
          });
        $("#amt_send").val(null);
      } else if (this.innerHTML === "HIVE") {
        const balance = await activeAccount.getHive();
        $(".transfer_balance div")
          .eq(0)
          .text(chrome.i18n.getMessage("popup_html_balance", ["HIVE"]));
        $(".transfer_balance div")
          .eq(1)
          .html(numberWithCommas(balance));
        $("#amt_send_max")
          .unbind("click")
          .click(() => {
            $("#amt_send").val(balance);
          });
        $("#amt_send").val(null);
      } else if (manageKey) {
        manageKeys(this.innerHTML);
        $("#show_qr").show();
        $("#qrcode_export").html("");
      } else if (
        getPref &&
        $(this)
          .parent()
          .attr("id") != "custom_select_rpc"
      ) {
        setPreferences(this.innerHTML);
      } else if (
        getPref &&
        $(this)
          .parent()
          .attr("id") == "custom_select_rpc"
      ) {
        if (this.innerHTML !== chrome.i18n.getMessage("popup_rpc_add")) {
          chrome.storage.local.set({ current_rpc: this.innerHTML });
          switchRPC(this.innerHTML);
        } else {
          showCustomRPC();
          $("#pref_div").hide();
          $("#add_rpc_div").show();
        }
      }
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

// Check if there is a reward to claim

function hasReward(reward_hbd, reward_hp, reward_hive) {
  return (
    getValFromString(reward_hbd) != 0 ||
    getValFromString(reward_hp) != 0 ||
    getValFromString(reward_hive) != 0
  );
}

function getValFromString(string) {
  return parseFloat(string.split(" ")[0]);
}
//Check WIF validity
function isActiveWif(pwd, active) {
  return hive.auth.wifToPublic(pwd) == active;
}

function isPostingWif(pwd, posting) {
  return hive.auth.wifToPublic(pwd) == posting;
}

function isMemoWif(pwd, memo) {
  return hive.auth.wifToPublic(pwd) == memo;
}

let numberWithCommas = x => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

function nFormatter(num, digits) {
  var si = [
    {
      value: 1,
      symbol: ""
    },
    {
      value: 1e3,
      symbol: "k"
    },
    {
      value: 1e6,
      symbol: "M"
    },
    {
      value: 1e9,
      symbol: "G"
    },
    {
      value: 1e12,
      symbol: "T"
    },
    {
      value: 1e15,
      symbol: "P"
    },
    {
      value: 1e18,
      symbol: "E"
    }
  ];
  var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

function addCommas(nStr, currency) {
  nStr += "";
  x = nStr.split(".");
  x1 = x[0];
  x2 = x.length > 1 ? "." + x[1] : "";
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, "$1" + "," + "$2");
  }

  if (x2 == "" && currency == 1) x2 = ".00";

  return x1 + x2;
}

function getDelegatees(name) {
  return new Promise(function(fulfill, reject) {
    hive.api.getVestingDelegations(name, null, 1000, function(
      err,
      outgoingDelegations
    ) {
      if (!err) fulfill(outgoingDelegations);
      else reject(err);
    });
  });
}

function getDelegators(name) {
  return new Promise(function(fulfill, reject) {
    $.ajax({
      type: "GET",
      beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
      },
      url: "https://api.steemkeychain.com/hive/delegators/" + name,
      success: function(incomingDelegations) {
        fulfill(incomingDelegations);
      },
      error: function(msg) {
        console.log(msg);
        reject(msg);
      }
    });
  });
}

const getPhishingAccounts = async () => {
  return new Promise(function(fulfill, reject) {
    $.ajax({
      type: "GET",
      beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
      },
      url: "https://api.steemkeychain.com/hive/phishingAccounts",
      success: function(phishingAccounts) {
        fulfill(phishingAccounts);
      },
      error: function(msg) {
        console.log(msg);
        reject(msg);
      }
    });
  });
};

const getBittrexCurrency = async currency => {
  return new Promise(function(fulfill, reject) {
    $.ajax({
      type: "GET",
      beforeSend: function(xhttp) {
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
      },
      url: "https://api.bittrex.com/api/v1.1/public/getcurrencies",
      success: function(currencies) {
        if (currencies.success) {
          fulfill(currencies.result.find(o => o.Currency == currency));
        }
      },
      error: function(msg) {
        console.log(msg);
        reject(msg);
      }
    });
  });
};
