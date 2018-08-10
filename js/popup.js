let accounts_json = null,
    mk = null;
let active_account,priceBTC, sbd, steem_p, sp, priceSBD, priceSteem, votePowerReserveRate, totalSteem, totalVests, rewardBalance, recentClaims, steemPrice, dynamicProp = null;
const STEEMIT_VOTE_REGENERATION_SECONDS = (5 * 60 * 60 * 24);
let custom_created=false;
steem.api.setOptions({
    url: 'https://api.steemit.com'
});

// Ask background if it is unlocked
chrome.runtime.sendMessage({
    command: "getMk"
});

// Check if we have mk or if accounts are stored to know if the wallet is locked unlocked or new.
chrome.runtime.onMessage.addListener(function(msg, sender, sendResp) {
    if (msg.command == "sendBackMk") {
        chrome.storage.local.get(['accounts'], function(items) {
            if (msg.mk == null || msg.mk == undefined) {
                if (items.accounts == null || items.accounts == undefined)
                    showRegister();
                else {
                    showUnlock();
                }
            } else {
                mk = msg.mk;
                initializeMainMenu();
            }
        });
    }
});

// Lock the wallet and destroy traces of the mk
$("#lock").click(function() {
    chrome.runtime.sendMessage({
        command: "sendMk",
        mk: null
    }, function(response) {});
    if (accounts_json == null) {
        accounts_json = {
            list: []
        };
        chrome.storage.local.set({
            accounts: encryptJson(accounts_json, mk)
        });
        mk = null;
    }
    showUnlock();
});

// Show forgot password
$("#forgot").click(function() {
    $("#forgot_div").show();
    $("#unlock").hide();
});

// Unlock with masterkey and show the main menu
$("#submit_unlock").click(function() {
    chrome.storage.local.get(['accounts'], function(items) {
        const pwd = $("#unlock_pwd").val();
        if (decryptToJson(items.accounts, pwd) != null) {
            mk = pwd;
            chrome.runtime.sendMessage({
                command: "sendMk",
                mk: mk
            }, function(response) {});
            $(".error_div").html("");
            $(".error_div").hide();
            $("#unlock_pwd").val("");
            initializeMainMenu();
        } else {
            $(".error_div").html("Wrong password!");
            $(".error_div").show();
        }
    });
});

// Use "Enter" as confirmation button for unlocking and registration

$('#unlock_pwd').keypress(function(e) {
    if (e.keyCode == 13)
        $('#submit_unlock').click();
});

$('#confirm_master_pwd').keypress(function(e) {
    if (e.keyCode == 13)
        $('#submit_master_pwd').click();
});

// If user forgot Mk, he can reset the wallet
$("#forgot_div button").click(function() {
    chrome.storage.local.clear(function() {
        accounts_json = null;
        mk = null;
        $("#forgot_div").hide();
        $("#register").show();
    });
});

$("#back_forgot").click(function() {
    $("#forgot_div").hide();
    $("#unlock").show();
});
// Registration confirmation
$("#submit_master_pwd").click(function() {
    if (!$("#master_pwd").val().match(/^(.{0,7}|[^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$/)) {
        if ($("#master_pwd").val() == $("#confirm_master_pwd").val()) {
            mk = $("#master_pwd").val();
            chrome.runtime.sendMessage({
                command: "sendMk",
                mk: mk
            }, function(response) {});
            initializeMainMenu();
            $(".error_div").hide();
        } else {
            $(".error_div").html("Your passwords do not match!");
            $(".error_div").show();
        }
    } else {
        $(".error_div").html("Please use a stronger password!");
        $(".error_div").show();
    }
});

$(".input_img_right_eye").click(function() {
    if ($("#unlock_pwd").prop("type") == "password") {
        $("#unlock_pwd").prop("type", "text");
        $(".input_img_right_eye").prop("src", "../images/eye.png");
        $(".input_img_right_eye").height("20.72px");
    } else {
        $("#unlock_pwd").prop("type", "password");
        $(".input_img_right_eye").prop("src", "../images/hide.png");
        $(".input_img_right_eye").height("29.93px");
    }
});

$(".back_menu").click(function() {
    initializeMainMenu();
});

// Adding accounts. Private keys can be entered individually or by the mean of the
// master key, in which case user can chose which keys to store, mk will then be
// discarded.
$("#check_add_account").click(function() {
    $("#master_check").css("display", "none");
    const username = $("#username").val();
    const pwd = $("#pwd").val();
    if (username !== "" && pwd !== "") {
        if (accounts_json && accounts_json.list.find(function(element) {
                return element.name == username
            })) {
            $(".error_div").html("You already registered an account for @" + username + "!");
            $(".error_div").show();
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
                        const keys = steem.auth.getPrivateKeys(username, pwd, ["posting", "active", "memo"]);
                        if (keys.activePubkey == pub_active && keys.postingPubkey == pub_posting && keys.memoPubkey == pub_memo) {
                            $("#add_account_div").hide();
                            $("#master_check").show();
                        } else {
                            $(".error_div").html("Incorrect private key or password.");
                            $(".error_div").show();
                        }
                    }
                } else {
                    $(".error_div").html("Please check the username and try again.");
                    $(".error_div").show();
                }
            });
    } else {
        $(".error_div").html("Please fill the fields.");
        $(".error_div").show();
    }
});

$(".back_add_key").click(function() {
    $("#master_check").hide();
    $("#add_account_div").show();
});

// If master key was entered, handle which keys to save.
$("#save_master").click(function() {
    if ($("#posting_key").prop("checked") || $("#active_key").prop("checked") || $("#memo_key").prop("checked")) {
        let permissions = [];
        if ($("#posting_key").prop("checked"))
            permissions.push("posting");
        if ($("#active_key").prop("checked"))
            permissions.push("active");
        if ($("#memo_key").prop("checked"))
            permissions.push("memo");
        const keys = steem.auth.getPrivateKeys($("#username").val(), $("#pwd").val(), permissions);
        addAccount({
            name: $("#username").val(),
            keys: keys
        });
    }
});

// Add new account to Chrome local storage (encrypted with AES)
function addAccount(account) {
    let saved_accounts = accounts_json;
    if (saved_accounts == undefined || saved_accounts == null || saved_accounts.list == 0)
        accounts = {
            list: [account]
        };
    else {
        saved_accounts.list.push(account)
        accounts = saved_accounts;
    }
    chrome.storage.local.set({
        accounts: encryptJson(accounts, mk)
    });
    initializeMainMenu();
}

// Set visibilities back to normal when coming back to main menu
function initializeMainMenu() {
    $("#accounts").html("");
    $("#add_account_div").hide();
    $(".error_div").hide();
    $(".success_div").hide();
    $("#master_check").hide();
    $("#username").val("");
    $("#pwd").val("");
    $(".error_div").html("");
    $("#posting_key").prop("checked", true);
    $("#active_key").prop("checked", true);
    $("#memo_key").prop("checked", true);
    $("#main").css("display", "block");
    $(".account_info").hide();
    $(".account_info_content").hide();
    $("#acc_transfers").empty();
    $(".account_info_menu").removeClass("rotate180");
    $("#transfer_to").hide();
    $("#add_key_div").hide();
    $("#new_key").val("");
    $("#keys_info").empty();
    $("#balance_steem").html("");
    $("#balance_sbd").html("");
    $("#balance_sp").html("");
    $("#balance_loader").show();
    $("#register").hide();
    $("#unlock").hide();
    $("#send_div").hide();
    $("#add_account_div .back_enabled").removeClass("back_disabled");
    chrome.storage.local.get(['accounts'], function(items) {
        accounts_json = (items.accounts == undefined || items.accounts == {
            list: []
        }) ? null : decryptToJson(items.accounts, mk);
        if (accounts_json != null) {
            $("#accounts").empty();
            $(".custom-select").eq(0).html("<select></select>");
            for (account of accounts_json.list) {
                $(".custom-select select").eq(0).append("<option>" + account.name + "</option>");
            }
            $(".custom-select select").eq(0).append("<option name='add_account'>Add New Account</option>");
            initiateCustomSelect();
        } else {
            $("#main").hide();
            $("#add_account_div").show();
            $("#add_account_div .back_enabled").addClass("back_disabled");
        }
    });
}


function setPreferences(account) {
    chrome.storage.local.get(['no_confirm'], function(items) {
        try {
            const pref = JSON.parse(items.no_confirm);
            $("#pref").html("");
            if (Object.keys(pref[account.name]).length == 0)
                $("#pref").html("No preferences");
            for (let obj in pref[account.name]) {
                $("#pref").append("<h4>" + obj + "</h4>");
                for (let sub in pref[account.name][obj]) {
                    $("#pref").append("<div><div id='pref_name'>" + sub + "</div><img id='" + account.name + "," + obj + "," + sub + "' class='deletePref'/></div>");
                }
            }

            $(".deletePref").click(function() {
                const user = $(this).attr("id").split(",")[0];
                const domain = $(this).attr("id").split(",")[1];
                const type = $(this).attr("id").split(",")[2];
                delete pref[user][domain][type];
                if (Object.keys(pref[user][domain]).length == 0)
                    delete pref[user][domain];
                chrome.storage.local.set({
                    no_confirm: JSON.stringify(pref)
                }, function() {
                    setPreferences(account);
                });
            });
        } catch (e) {}
    });
}
// Account Info Menu style
$(".account_info_menu").click(function() {
    $(".account_info_content").eq(($(this).index() - 3) / 2).slideToggle();
    if ($(this).hasClass("rotate180"))
        $(this).removeClass("rotate180");
    else $(this).addClass("rotate180");
});

// Delete account and all its keys
$("#confirm_forget_account").click(function() {
    const i = parseInt($(".account_info").attr("id").replace("a", ""));
    deleteAccount(i);
});

// Manage keys
$(".account_info_menu").eq(0).click(function() {
    manageKeys();
});

// Display Add Copy or delete individual keys
function manageKeys() {
    if ($(".row_account_keys").length == 0) {
        const i = parseInt($(".account_info").attr("id").replace("a", ""));
        const keys = accounts_json.list[i].keys;
        for (keyName in keys) {
            if (!keyName.includes("Pubkey")) {
                $("#keys_info").append("<div class='row_account_keys'><div class='type_key'>" + keyName[0] + "</div><div class='div_keys'><div class='privateRow'><input type='text' readOnly='true' value='" + keys[keyName] + "' class='privKey'></input><img class='copyKey'/><img id='" + keyName + "' class='deleteKey'/></div><div class='publicRow'><input type='text' readOnly='true' value='" + keys[keyName + "Pubkey"] + "' class='pubKey'></input><img class='copyKey'/></div></div></div>");
            }
        }

        $(".copyKey").click(function() {
            $(this).parent().children().eq(0).select();
            document.execCommand("copy");
            document.selection.empty();
        });

        $(".deleteKey").click(function() {
            delete accounts_json.list[i].keys[$(this).attr("id")];
            delete accounts_json.list[i].keys[$(this).attr("id") + "Pubkey"];
            $(this).closest($(".row_account_keys")).remove();
            if ($(".row_account_keys").length == 0)
                deleteAccount();
            else {
                updateAccount();
            }
        });
    }
}
// Show add a new key
$('#add_key').click(function() {
    $('#add_key_div').show();
});

// Try to add the new key
$('#add_new_key').click(function() {
    const username = $("#account_info_name").html().replace("@", "");
    const i = parseInt($(".account_info").attr("id").replace("a", ""));
    const keys = accounts_json.list[i].keys;
    const pwd = $("#new_key").val();
    if (steem.auth.isWif(pwd)) {
        steem.api.getAccounts([username], function(err, result) {
            if (result.length != 0) {
                const pub_active = result["0"].active.key_auths["0"]["0"];
                const pub_posting = result["0"].posting.key_auths["0"]["0"];
                const pub_memo = result["0"].memo_key;
                if (isMemoWif(pwd, pub_memo)) {
                    if (keys.hasOwnProperty("memo"))
                        $("#error_add_key").html("You already entered your memo key!");
                    else
                        addKeys(i, "memo", pwd, pub_memo);
                } else if (isPostingWif(pwd, pub_posting)) {
                    if (keys.hasOwnProperty("posting"))
                        $("#error_add_key").html("You already entered your posting key!");
                    else
                        addKeys(i, "posting", pwd, pub_posting);
                } else if (isActiveWif(pwd, pub_active)) {
                    if (keys.hasOwnProperty("active"))
                        $("#error_add_key").html("You already entered your active key!");
                    else
                        addKeys(i, "active", pwd, pub_active);
                } else
                    $("#error_add_key").html("This is not one of your keys!");
            }
        });
    } else
        $("#error_add_key").html("Not a private WIF!");
});

// Add the new keys to the display and the encrypted storage
function addKeys(i, key, priv, pub) {
    accounts_json.list[i].keys[key] = priv;
    accounts_json.list[i].keys[key + "Pubkey"] = pub;
    updateAccount();
    $("#keys_info").empty();
    manageKeys();
}
// Display Wallet history
$(".account_info_menu").eq(2).click(function() {
    if ($(".transfer_row").length == 0) {
        const username = $("#account_info_name").html().replace("@", "");
        steem.api.getAccountHistory(username, -1, 1000, function(err, result) {
            $("#acc_transfers").empty();
            if (result != null) {
                let transfers = result.filter(tx => tx[1].op[0] === 'transfer');
                transfers = transfers.slice(-10).reverse();
                if (transfers.length != 0) {
                    for (transfer of transfers) {
                        let memo = transfer[1].op[1].memo;
                        if (memo[0] == "#") {
                            if (accounts_json.list[parseInt($(".account_info").attr("id").replace("a", ""))].keys.hasOwnProperty("memo"))
                                memo = window.decodeMemo(accounts_json.list[parseInt($(".account_info").attr("id").replace("a", ""))].keys.memo, memo);
                            else
                                memo = "Add your private memo key to read this memo";
                        }
                        $("#acc_transfers").append("<div class='transfer_row " + (transfer[1].op[1].from == username ? "red" : "green") + "'><span class='transfer_name'>" + (transfer[1].op[1].from == username ? "To @" + transfer[1].op[1].to : "From @" + transfer[1].op[1].from) + ":</span><span class='transfer_val'>" + transfer[1].op[1].amount + "</span></div><div class='memo'>" + memo + "</div><hr>");
                    }
                    $(".transfer_row").click(function() {
                        $(".memo").eq($(this).index() / 3).slideToggle();
                    });
                } else
                    $("#acc_transfers").append("No recent transfers");
            } else
                $("#acc_transfers").append("Something went wrong! Please try again later!");
        });
    }
});

$("#send").click(function(){
    $("#send_div").show();
    $("#main").hide();
});

// Send STEEM or SBD to an user
$("#send_transfer").click(function() {
    showLoader();
    sendTransfer();
});

function sendTransfer() {
    const to = $("#recipient").val();
    const amount = $("#amt_send").val();
    const currency = $("#currency_send .select-selected").html();
    console.log(currency,active_account);
    const memo = $("#memo_send").val();
    if (to != "" && amount != "" && amount >= 0.001) {
        steem.broadcast.transfer(active_account.keys.active, active_account.name, to, parseFloat(amount).toFixed(3) + " " + currency, memo, function(err, result) {
            $("#send_loader").hide();
            if (err == null){
                $(".error_div").hide();
                $(".success_div").html("Transfer successful!").show();
            }
            else {
                $(".success_div").hide();
                $(".error_div").html("Something went wrong! Please try again!").show();
            }
            $("#send_transfer").show();
        });
    }
}

// Delete account (and encrypt the rest)
function deleteAccount(i) {
    accounts_json.list.splice(i, 1);
    chrome.storage.local.set({
        accounts: encryptJson(accounts_json, mk)
    }, function() {
        initializeMainMenu();
    });
}

// Update account (encrypted)
function updateAccount() {
    chrome.storage.local.set({
        accounts: encryptJson(accounts_json, mk)
    });
}

//Check WIF validity
function isActiveWif(pwd, active) {
    return steem.auth.wifToPublic(pwd) == active;
}

function isPostingWif(pwd, posting) {
    return steem.auth.wifToPublic(pwd) == posting;
}

function isMemoWif(pwd, memo) {
    return steem.auth.wifToPublic(pwd) == memo;
}

let numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Handle pages visibility

function showRegister() {
    $("#main").hide();
    $("#register").show();
}

function showUnlock() {
    $("#main").hide();
    $("#unlock").show();
    $("#unlock_pwd").focus();
}

function showLoader() {
    $("#send_loader").show();
    $("#send_transfer").hide();
}

function showAccountInfo(account, that) {
    if (account.keys.hasOwnProperty("active"))
        $("#transfer_to").show();
    $(".account_info").attr("id", "a" + $(that).index());
    $("#account_info_name").html("@" + account.name);
    $("#main").hide();
    $(".account_info").show();
}

function showAddAccount() {
    $("#add_account_div").css("display", "block");
    $("#main").css("display", "none");
}

function initiateCustomSelect() {
    /*look for any elements with the class "custom-select":*/
    x = document.getElementsByClassName("custom-select");
    console.log(x.length);
    for (i = 0; i < x.length; i++) {
        if(i==1&&custom_created)
          return;
        if(i==1&&!custom_created)
          custom_created=true;
        selElmnt = x[i].getElementsByTagName("select")[0];
        console.log(selElmnt);
        /*for each element, create a new DIV that will act as the selected item:*/
        a = document.createElement("DIV");
        a.setAttribute("class", "select-selected");
        a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
        x[i].appendChild(a);
        /*for each element, create a new DIV that will contain the option list:*/
        b = document.createElement("DIV");
        b.setAttribute("class", "select-items select-hide");
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
        if(i==0)
          loadAccount(a.innerHTML);
        a.addEventListener("click", function(e) {
            /*when the select box is clicked, close any other select boxes,
            and open/close the current select box:*/
            e.stopPropagation();
            closeAllSelect(this);
            this.nextSibling.classList.toggle("select-hide");
            this.classList.toggle("select-arrow-active");
            if (this.innerHTML.includes("Add New Account")) {
                showAddAccount();
            } else if (!this.classList.contains("select-arrow-active")&&this.innerHTML!="SBD"&&this.innerHTML!="STEEM") {
                loadAccount(this.innerHTML);
            }
        });
    }

    function closeAllSelect(elmnt) {
        /*a function that will close all select boxes in the document,
        except the current select box:*/
        var x, y, i, arrNo = [];
        x = document.getElementsByClassName("select-items");
        y = document.getElementsByClassName("select-selected");
        for (i = 0; i < y.length; i++) {
            if (elmnt == y[i]) {
                arrNo.push(i)
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

function loadAccount(name) {
    console.log("load account" + name);
    let account = accounts_json.list.filter(function(obj, i) {
        return obj.name === name;
    })[0];
    if(account!=null&&account!=undefined){
      active_account=account;
      console.log("account",account);
      $("#send").toggle(account.keys.hasOwnProperty("active"));
      $(".wallet_infos").html("...");
      $("#voting_power span").html("");
      setPreferences(account);
      steem.api.getAccounts([account.name], function(err, result) {
          console.log(err, result);
          if (result.length != 0) {
              console.log(getVotingPower(result[0]));
              $("#voting_power span").eq(0).html("Voting Power: " + (getVotingPower(result[0]) == 10000 ? 100 : getVotingPower(result[0]) / 100).toFixed(2) + "%");
              if (totalSteem != null)
                  showUserData(result);
              else
                  Promise.all([steem.api.getDynamicGlobalPropertiesAsync(), steem.api.getCurrentMedianHistoryPriceAsync(), steem.api.getRewardFundAsync("post"), getPriceSteemAsync(), getPriceSBDAsync(), getBTCPriceAsync()])
                  .then(function(values) {
                      votePowerReserveRate = values["0"].vote_power_reserve_rate;
                      totalSteem = Number(values["0"].total_vesting_fund_steem.split(' ')[0]);
                      totalVests = Number(values["0"].total_vesting_shares.split(' ')[0]);
                      rewardBalance = parseFloat(values["2"].reward_balance.replace(" STEEM", ""));
                      recentClaims = values["2"].recent_claims;
                      steemPrice = parseFloat(values["1"].base.replace(" SBD", "")) / parseFloat(values["1"].quote.replace(" STEEM", ""));
                      dynamicProp = values[0];
                      priceSBD = values["3"];
                      priceSteem = values["4"]; //priceSteem is current price on Bittrex while steemPrice is the blockchain price.
                      priceBTC = values["5"];
                      showUserData(result);
                  });
          }
    });

  }
  $("#acc_transfers").html("Loading...");
}

function showUserData(result) {
    showBalances(result, dynamicProp);
    $("#voting_power span").eq(1).html("Vote Value: $ " + getVotingDollarsPerAccount(100, result["0"]));
    console.log(priceSBD, priceSteem, priceBTC, steem_p, sbd, sp);
    $("#account_value_amt").html(numberWithCommas(((priceSBD * parseInt(sbd) + priceSteem * (parseInt(sp) + parseInt(steem_p))) * priceBTC).toFixed(2)))
}

function getVotingPower(account) {
    const voting_power = account.voting_power;
    const last_vote_time = new Date((account.last_vote_time) + 'Z');
    const elapsed_seconds = (new Date() - last_vote_time) / 1000;
    const regenerated_power = Math.round((10000 * elapsed_seconds) / STEEMIT_VOTE_REGENERATION_SECONDS);
    const current_power = Math.min(voting_power + regenerated_power, 10000);
    return current_power;
};

function getVotingDollarsPerAccount(voteWeight, account) {
    const effective_vesting_shares = Math.round(getEffectiveVestingSharesPerAccount(account) * 1000000);
    const weight = voteWeight * 100;
    const current_power = getVotingPower(account);
    const max_vote_denom = votePowerReserveRate * STEEMIT_VOTE_REGENERATION_SECONDS / (60 * 60 * 24);
    let used_power = Math.round((current_power * weight) / 10000);
    used_power = Math.round((used_power + max_vote_denom - 1) / max_vote_denom);
    const rshares = Math.round((effective_vesting_shares * used_power) / (10000))
    const voteValue = rshares *
        rewardBalance / recentClaims *
        steemPrice;
    return voteValue.toFixed(3);
}

function getEffectiveVestingSharesPerAccount(account) {
    const effective_vesting_shares = parseFloat(account.vesting_shares.replace(" VESTS", "")) +
        parseFloat(account.received_vesting_shares.replace(" VESTS", "")) -
        parseFloat(account.delegated_vesting_shares.replace(" VESTS", ""));
    return effective_vesting_shares;
};

function showBalances(result, res) {
    console.log("show balance");
    sbd = result["0"].sbd_balance.replace("SBD", "");
    const vs = result["0"].vesting_shares;
    steem_p = result["0"].balance.replace("STEEM", "");
    const total_vesting_shares = res.total_vesting_shares;
    const total_vesting_fund = res.total_vesting_fund_steem;
    sp = steem.formatter.vestToSteem(vs, total_vesting_shares, total_vesting_fund);
    $("#wallet_amt div").eq(0).html(numberWithCommas(steem_p));
    $("#wallet_amt div").eq(1).html(numberWithCommas(sbd));
    $("#wallet_amt div").eq(2).html(numberWithCommas(sp.toFixed(3)));
    $("#balance_loader").hide();
}

function getPriceSteemAsync() {
    return new Promise(function(resolve, reject) {
        $.ajax({
            type: "GET",
            beforeSend: function(xhttp) {
                xhttp.setRequestHeader("Content-type", "application/json");
                xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
            },
            url: 'https://bittrex.com/api/v1.1/public/getticker?market=BTC-STEEM',
            success: function(response) {
                resolve(response.result['Bid']);
            },
            error: function(msg) {
                resolve(msg);
            }
        });
    });
}

function getBTCPriceAsync() {
    return new Promise(function(resolve, reject) {
        $.ajax({
            type: "GET",
            beforeSend: function(xhttp) {
                xhttp.setRequestHeader("Content-type", "application/json");
                xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
            },
            url: 'https://bittrex.com/api/v1.1/public/getticker?market=USDT-BTC',
            success: function(response) {
                resolve(response.result['Bid']);
            },
            error: function(msg) {
                resolve(msg);
            }
        });
    });
}

function getPriceSBDAsync() {
    return new Promise(function(resolve, reject) {
        $.ajax({
            type: "GET",
            beforeSend: function(xhttp) {
                xhttp.setRequestHeader("Content-type", "application/json");
                xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
            },
            url: 'https://bittrex.com/api/v1.1/public/getticker?market=BTC-SBD',
            success: function(response) {
                resolve(response.result['Bid']);
            },
            error: function(msg) {
                resolve(msg);
            }
        });
    });
}
