// All functions regarding the handling of a particular account
// Load account information
function loadAccount(name) {
  console.log("Load account "+name);
    let account = accounts_json.list.filter(function(obj, i) {
        return obj.name === name;
    })[0];
    if (account != null && account != undefined) {
        active_account = account;
        $("#send_form").toggle(account.keys.hasOwnProperty("active"));
        $("#show_add_active").toggle(!account.keys.hasOwnProperty("active"));
        $(".wallet_infos").html("...");
        $("#vm").html("...");
        $("#rc").html("...");
        steem.api.getAccounts([account.name], async function(err, result) {
            if (result.length != 0) {
              console.log(result);
                witness_votes=result[0].witness_votes;
                proxy=result[0].proxy;
                const vm = await getVotingMana(result[0]);
                $("#vm").html(vm + "%");
                const full=(vm==100?"":'Full in ')+getTimeBeforeFull(vm * 100);
                $("#vm_info").attr("title", full );

                if (totalSteem != null){
                    showUserData(result);
                    claimRewards(result);
                    prepareWitnessDiv();
                }
                else
                    Promise.all([steem.api.getDynamicGlobalPropertiesAsync(), steem.api.getCurrentMedianHistoryPriceAsync(), steem.api.getRewardFundAsync("post"), getPriceSteemAsync(), getPriceSBDAsync(), getBTCPriceAsync(),getWitnessRanks()])
                    .then(function(values) {
                        votePowerReserveRate = values["0"].vote_power_reserve_rate;
                        totalSteem = Number(values["0"].total_vesting_fund_steem.split(' ')[0]);
                        totalVests = Number(values["0"].total_vesting_shares.split(' ')[0]);
                        rewardBalance = parseFloat(values["2"].reward_balance.replace(" STEEM", ""));
                        recentClaims = values["2"].recent_claims;
                        steemPrice = parseFloat(values["1"].base.replace(" SBD", "")) / parseFloat(values["1"].quote.replace(" STEEM", ""));
                        dynamicProp = values[0];
                        priceSBD = values["4"];
                        priceSteem = values["3"]; //priceSteem is current price on Bittrex while steemPrice is the blockchain price.
                        priceBTC = values["5"];
                        witness_ranks=values["6"];
                        claimRewards(result);
                        showUserData(result);
                        prepareWitnessDiv();
                    });

                if (!result[0].proxy && (!result[0].witness_votes.includes("stoodkev") || !result[0].witness_votes.includes("yabapmatt") || !result[0].witness_votes.includes("aggroed"))) {
                    $('#stoodkev img').attr('src', '../images/icon_witness-vote' + (result[0].witness_votes.includes("stoodkev") ? '' : '_default') + '.svg');
                    $('#yabapmatt img').attr('src', '../images/icon_witness-vote' + (result[0].witness_votes.includes("yabapmatt") ? '' : '_default') + '.svg');
                    $('#aggroed img').attr('src', '../images/icon_witness-vote' + (result[0].witness_votes.includes("aggroed") ? '' : '_default') + '.svg');

                    if (!result[0].witness_votes.includes("yabapmatt"))
                        $("#yabapmatt").click(function() {
                            voteFor("yabapmatt");
                        });

                    if (!result[0].witness_votes.includes("stoodkev"))
                        $("#stoodkev").click(function() {
                            voteFor("stoodkev");
                        });

                    if (!result[0].witness_votes.includes("aggroed"))
                        $("#aggroed").click(function() {
                            voteFor("aggroed");
                        });

                    setTimeout(function() {
                        $("#witness_votes").show();
                        $("#witness_votes").animate({
                            opacity: 1
                        }, 500);
                    }, 2000);
                } else {
                    $("#witness_votes").animate({
                        opacity: 0
                    }, 500, function() {
                        $("#witness_votes").hide();
                    });
                }
            }
        });
        steem.api.getAccountHistory(account.name, -1, 1000, function(err, result) {
            $("#acc_transfers div").eq(1).empty();
            if (result != null) {
                let transfers = result.filter(tx => tx[1].op[0] === 'transfer');
                transfers = transfers.slice(-10).reverse();
                if (transfers.length != 0) {
                    for (transfer of transfers) {
                        let memo = transfer[1].op[1].memo;
                        let timestamp = transfer[1].timestamp;
                        let date = new Date(timestamp);
                        timestamp = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
                        if (memo[0] == "#") {
                            if (active_account.keys.hasOwnProperty("memo")){
                                try{
                                memo = window.decodeMemo(active_account.keys.memo, memo);
                              }catch(e){}
                            }
                            else
                                memo = "Add your private memo key to read this memo";
                        }
                        $("#acc_transfers div").eq(1).append("<div class='transfer_row'><span class='transfer_date'>" + timestamp + "</span><span class='transfer_val'>" + (transfer[1].op[1].from == active_account.name ? "-" : "+") + " " + transfer[1].op[1].amount.split(" ")[0] + "</span><span class='transfer_name'>" + (transfer[1].op[1].from == active_account.name ? "TO: @" + transfer[1].op[1].to : "FROM: @" + transfer[1].op[1].from) +
                            "</span><span class='transfer_cur'>" + transfer[1].op[1].amount.split(" ")[1] + "</span><div class='memo'>" + memo + "</div></div>");
                    }
                    $(".transfer_row").click(function() {
                        $(".memo").eq(($(this).index())).slideToggle();
                    });
                } else
                    $("#acc_transfers div").eq(1).append("No recent transfers");
            } else
                $("#acc_transfers div").eq(1).append("Something went wrong! Please try again later!");
        });
    }
}

// Display all the account data
async function showUserData(result) {
    showBalances(result, dynamicProp);
    const [vd, rc] = [await getVotingDollarsPerAccount(100, result["0"], rewardBalance, recentClaims, steemPrice, votePowerReserveRate, false),
        await getRC(result["0"].name)
    ];
    $(".transfer_balance div").eq(1).html(numberWithCommas(steem_p));
    $("#vm").html($("#vm").html() + " ($" + vd + ")");

    $("#rc").html(rc.estimated_pct + "%");
    const full=(rc.estimated_pct==100?"":'Full in ')+rc.fullin;
    $("#rc_info").attr("title", full);
    console.log(priceSBD*priceBTC,priceSteem*priceBTC);
    console.log(parseInt(sbd),sp,steem_p);
    console.log(priceBTC*priceSBD,parseInt(sbd),priceBTC*priceSBD * parseInt(sbd));
    console.log(priceBTC* priceSteem * (parseInt(sp) + parseInt(steem_p)));
    $("#account_value_amt").html(numberWithCommas("$ "+((priceSBD * parseInt(sbd) + priceSteem * (parseInt(sp) + parseInt(steem_p))) * priceBTC).toFixed(2))+"\t  USD");

    console.log(rc);
}

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
            showError("You already registered an account for @" + username + "!");
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
    if (accounts_json != null) {
        let newlist = [];
        for (let acc of accounts_json.list) {
            if (acc != undefined) {
                newlist.push(acc);
            }
        }
        accounts_json.list = newlist;
    }
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

// Display Add Copy or delete individual keys
function manageKeys(name) {
    let index = -1;
    let account = accounts_json.list.filter(function(obj, i) {
        if (obj.name === name) {
            index = i;
            return obj;
        }
    })[0];
    const keys = account.keys;
    $(".public_key").html("");
    $(".private_key").html("");
    for (keyName in keys) {
        if (keyName.includes("posting")) {
            $(".img_add_key").eq(0).hide();
            $(".remove_key").eq(0).show();
            if (keyName.includes("Pubkey"))
                $(".public_key").eq(0).html(account.keys[keyName]);
            else
                $(".private_key").eq(0).html(account.keys[keyName]);
        } else if (keyName.includes("active")) {
            $(".img_add_key").eq(1).hide();
            $(".remove_key").eq(1).show();
            if (keyName.includes("Pubkey"))
                $(".public_key").eq(1).html(account.keys[keyName]);
            else
                $(".private_key").eq(1).html(account.keys[keyName]);
        } else if (keyName.includes("memo")) {
            $(".remove_key").eq(2).show();
            $(".img_add_key").eq(2).hide();
            if (keyName.includes("Pubkey"))
                $(".public_key").eq(2).html(account.keys[keyName]);
            else
                $(".private_key").eq(2).html(account.keys[keyName]);
        }
    }
    if ($(".private_key").eq(0).html() === "") {
        $(".img_add_key").eq(0).show();
        $(".remove_key").eq(0).hide();
    }
    if ($(".private_key").eq(1).html() === "") {
        $(".img_add_key").eq(1).show();
        $(".remove_key").eq(1).hide();
    }
    if ($(".private_key").eq(2).html() === "") {
        $(".img_add_key").eq(2).show();
        $(".remove_key").eq(2).hide();
    }
    let timeout = null;
    $(".private_key, .public_key").click(function() {
        if (timeout != null)
            clearTimeout(timeout);
        $("#copied").hide();
        $("#fake_input").val($(this).html());
        $("#fake_input").select();
        document.execCommand("copy");
        $("#copied").slideDown(600);
        timeout = setTimeout(function() {
            $("#copied").slideUp(600);
        }, 6000);
    });

    $(".remove_key").unbind("click").click(function() {
        delete accounts_json.list[index].keys[$(this).attr("id")];
        delete accounts_json.list[index].keys[$(this).attr("id") + "Pubkey"];
        if (Object.keys(accounts_json.list[index].keys).length == 0) {
            deleteAccount(index);
            $(".settings_child").hide();
            $("#settings_div").show();
        } else {
            updateAccount();
            manageKeys(name);
        }

    });
    // Delete account and all its keys
    $("#delete_account").unbind("click").click(function() {
        deleteAccount(index);
    });
    $(".img_add_key").unbind("click").click(function() {
        $("#manage_keys").hide();
        $("#add_key_div").show();
    });

    // Try to add the new key
    $('#add_new_key').unbind("click").click(function() {
        const keys = accounts_json.list[index].keys;
        const pwd = $("#new_key").val();
        if (steem.auth.isWif(pwd)) {
            steem.api.getAccounts([name], function(err, result) {
                if (result.length != 0) {
                    const pub_active = result["0"].active.key_auths["0"]["0"];
                    const pub_posting = result["0"].posting.key_auths["0"]["0"];
                    const pub_memo = result["0"].memo_key;
                    if (isMemoWif(pwd, pub_memo)) {
                        if (keys.hasOwnProperty("memo"))
                            showError("You already entered your memo key!");
                        else
                            addKeys(index, "memo", pwd, pub_memo, name);
                    } else if (isPostingWif(pwd, pub_posting)) {
                        if (keys.hasOwnProperty("posting"))
                            showError("You already entered your posting key!");
                        else
                            addKeys(index, "posting", pwd, pub_posting, name);
                    } else if (isActiveWif(pwd, pub_active)) {
                        if (keys.hasOwnProperty("active"))
                            showError("You already entered your active key!");
                        else
                            addKeys(index, "active", pwd, pub_active, name);
                    } else
                        showError("This is not one of your keys!");
                }
            });
        } else
            showError("Not a private WIF!");
    });
}

// Add the new keys to the display and the encrypted storage
function addKeys(i, key, priv, pub, name) {
    accounts_json.list[i].keys[key] = priv;
    accounts_json.list[i].keys[key + "Pubkey"] = pub;
    updateAccount();
    manageKeys(name);
    $("#add_key_div").hide();
    $("#new_key").val("");
    $(".error_div").hide();
    $("#manage_keys").show();
}

// show balance for this account
function showBalances(result, res) {
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

// Delete account (and encrypt the rest)
function deleteAccount(i) {
    accounts_json.list.splice(i, 1);

    chrome.storage.local.set({
        accounts: encryptJson(accounts_json, mk)
    }, function() {
        $(".settings_child").hide();
        initializeMainMenu();
    });
}

// Update account (encrypted)
function updateAccount() {
    chrome.storage.local.set({
        accounts: encryptJson(accounts_json, mk)
    });
}

function claimRewards(result){
  console.log("Check claim rewards for "+active_account.name);
  const reward_sbd=result[0].reward_sbd_balance;
  const reward_vests=result[0].reward_vesting_balance;
  const reward_sp=steem.formatter.vestToSteem(reward_vests, dynamicProp.total_vesting_shares, dynamicProp.total_vesting_fund_steem).toFixed(3)+" SP";
  const reward_steem=result[0].reward_steem_balance;
  if(hasReward(reward_sbd,reward_sp,reward_steem)){
    $("#claim").show();
      $("#claim").unbind("click").click(function(){
          $("#claim_rewards").show();
          let rewardText="You have Rewards ready to redeem in the amount of:<br>";
          if(getValFromString(reward_sp)!=0)
            rewardText+=(reward_sp+" / ");
          if(getValFromString(reward_sbd)!=0)
            rewardText+=(reward_sbd+" / ");
          if(getValFromString(reward_steem)!=0)
            rewardText+=(reward_steem+" / ");
            rewardText=rewardText.slice(0,-3);
          $("#claim_rewards p").html(rewardText);
          $("#redeem_rewards").unbind("click").click(function(){
          $("#claim_rewards button").prop("disabled",true);
            if(active_account.keys.posting)
              steem.broadcast.claimRewardBalance(active_account.keys.posting, active_account.name, reward_steem, reward_sbd, reward_vests, function(err, result) {
                $("#claim_rewards").hide();
                $("#claim_rewards button").prop("disabled",false);
                initializeMainMenu();
              });
            else showError("You need to enter your private Posting key to claim rewards!");
          });
          $(".close_claim").unbind("click").click(function(){
              $("#claim_rewards").hide();
          });
      });
  }
  else $("#claim").hide();
}
