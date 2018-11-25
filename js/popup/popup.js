let accounts_json = null,
    mk = null;
let active_account, priceBTC, sbd, steem_p, sp, priceSBD, priceSteem, votePowerReserveRate, totalSteem, totalVests, rewardBalance, recentClaims, steemPrice, dynamicProp = null;
const STEEMIT_VOTE_REGENERATION_SECONDS = (5 * 60 * 60 * 24);
let custom_created = false;
let manageKey, getPref = false;
let witness_ranks=null;
//chrome.storage.local.remove("rpc");

$("#copied").hide();
$("#witness_votes").hide();


// Ask background if it is unlocked
getMK();

// Check if autolock and set it to background
chrome.storage.local.get(['autolock'], function(items) {
    if (items.autolock != undefined) {
        $(".autolock input").prop("checked", false);
        $("#" + JSON.parse(items.autolock).type).prop("checked", true);
        $("#mn").val(JSON.parse(items.autolock).mn);
        setAutolock(items.autolock);
        $("#mn").css('visibility', JSON.parse(items.autolock).type == "idle" ? 'visible' : 'hidden');
    }
});
// Check if we have mk or if accounts are stored to know if the wallet is locked unlocked or new.
chrome.runtime.onMessage.addListener(function(msg, sender, sendResp) {
    if (msg.command == "sendBackMk") {
        chrome.storage.local.get(['accounts','current_rpc'], function(items) {
            steem.api.setOptions({
                url: items.current_rpc||'https://api.steemit.com'
            });
            if (msg.mk == null || msg.mk == undefined) {
                if (items.accounts == null || items.accounts == undefined){
                    showRegister();
                }
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

// Save autolock
$(".autolock").click(function() {
    $(".autolock input").prop("checked", false);
    $(this).find("input").prop("checked", "true");
    $("#mn").css('visibility', $(this).find("input").attr("id") == "idle" ? 'visible' : 'hidden');

});

// Saving autolock options
$("#save_autolock").click(function() {
    const autolock = JSON.stringify({
        "type": $(".autolock input:checkbox:checked").eq(0).attr("id") || "default",
        "mn": $("#mn").val() || 10
    });
    chrome.storage.local.set({
        autolock: autolock
    });
    setAutolock(autolock);
    initializeMainMenu();
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
    }
    $("#back_forgot_settings").attr("id", "back_forgot");
    mk = null;
    showUnlock();
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
            showError("Wrong password!");
        }
    });
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
            showError("Your passwords do not match!");
        }
    } else {
        showError("Your password must be at least 8 characters long and include a lowercase letter, an uppercase letter, a digit, and a special character.");
    }
});

// Set visibilities back to normal when coming back to main menu
function initializeMainMenu() {
    initializeVisibility();
    manageKey = false;
    getPref = false;
    chrome.storage.local.get(['accounts', 'last_account','rpc','current_rpc'], function(items) {
        accounts_json = (items.accounts == undefined || items.accounts == {
            list: []
        }) ? null : decryptToJson(items.accounts, mk);
        loadRPC(items.rpc,items.current_rpc);
        if (accounts_json != null && accounts_json.list.length != 0) {
            $("#accounts").empty();
            $("#main").show();

            // Add the last account selected to the front of the account list.
            if (items.last_account) {
                let last = accounts_json.list.find(a => a.name == items.last_account);

                if (last) {
                    accounts_json.list.splice(accounts_json.list.indexOf(last), 1);
                    accounts_json.list.unshift(last);
                }
            }
            $(".usernames").html("<select></select>");
            for (account of accounts_json.list) {
                $(".usernames select").append("<option>" + account.name + "</option>");
            }
            $(".usernames select").eq(0).append("<option name='add_account'>Add New Account</option>");
            initiateCustomSelect();
        } else {
            $("#main").hide();
            $("#add_account_div").show();
            $("#add_account_div .back_enabled").addClass("back_disabled");
        }
    });
}

// Send STEEM or SBD to an user
$("#send_transfer").click(function() {
    showLoader();
    sendTransfer();
});

// Vote for witnesses
function voteFor(name) {
    if (active_account.keys.hasOwnProperty("active")) {
        $('#' + name + ' img').attr('src', '../images/loading.gif');

        steem.broadcast.accountWitnessVote(active_account.keys.active, active_account.name, name, true, function(err, result) {
            if (err == null) {
                setTimeout(function() {
                    if ($(".witness_container:visible").length == 0)
                        $("#witness_votes").animate({
                            opacity: 0
                        }, 500, function() {
                            $("#witness_votes").hide();
                        });
                }, 1000);

                $('#' + name + ' img').attr('src', '../images/icon_witness-vote.svg');
            }
        });
    } else {
        $("#witness_votes").hide();
        $("#main").hide();
        $("#add_key_div").show();
        manageKey = true;
        manageKeys($(".usernames .select-selected").eq(0).html());
        showError("Please enter your active key to vote for witnesses!");
    }
}

// Send a transfer
async function sendTransfer() {
    const to = $("#recipient").val();
    const amount = $("#amt_send").val();
    const currency = $("#currency_send .select-selected").html();
    let memo = $("#memo_send").val();
    if(memo!=""&&$("#encrypt_memo").prop("checked")){
      try{
        const receiver=await  steem.api.getAccountsAsync([to]);
        const memoReceiver=receiver["0"].memo_key;
        memo = window.encodeMemo(active_account.keys.memo, memoReceiver, "#"+memo);}
      catch(e){console.log(e);}
    }
    if (to != "" && amount != "" && amount >= 0.001) {
        steem.broadcast.transfer(active_account.keys.active, active_account.name, to, parseFloat(amount).toFixed(3) + " " + currency, memo, async function(err, result) {
            $("#send_loader").hide();
            if (err == null) {
                const sender=await  steem.api.getAccountsAsync([active_account.name]);
                sbd=sender["0"].sbd_balance.replace("SBD", "");
                steem_p=sender["0"].balance.replace("STEEM", "");
                if (currency == "SBD") {
                   $(".transfer_balance div").eq(1).html(numberWithCommas(sbd));
                 } else if (currency == "STEEM") {
                   $(".transfer_balance div").eq(1).html(numberWithCommas(steem_p));
                 }
                $(".error_div").hide();
                $(".success_div").html("Transfer successful!").show();
                setTimeout(function(){$(".success_div").hide();},5000);
            } else {
                $(".success_div").hide();
                showError("Something went wrong! Please try again!");
            }
            $("#send_transfer").show();
        });
    } else {
        showError("Please fill the fields!");
        $("#send_loader").hide();
        $("#send_transfer").show();
    }
}
