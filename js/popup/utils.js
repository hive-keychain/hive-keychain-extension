const STEEMIT_100_PERCENT = 10000;
const STEEM_VOTING_MANA_REGENERATION_SECONDS = 432000;

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
    let estimated_mana = (current_mana + diff_in_seconds * estimated_max / STEEM_VOTING_MANA_REGENERATION_SECONDS);
    if (estimated_mana > estimated_max)
        estimated_mana = estimated_max;
    const estimated_pct = estimated_mana / estimated_max * 100;
    return {
        "current_mana": current_mana,
        "last_update_time": last_update_time,
        "estimated_mana": estimated_mana,
        "estimated_max": estimated_max,
        "estimated_pct": estimated_pct
    };
}

// get SP + received delegations - delegations sent
var getEffectiveVestingSharesPerAccount = function(account) {
    var effective_vesting_shares = parseFloat(account.vesting_shares.replace(" VESTS", "")) +
        parseFloat(account.received_vesting_shares.replace(" VESTS", "")) -
        parseFloat(account.delegated_vesting_shares.replace(" VESTS", ""));
    return effective_vesting_shares;
};

// get SP of the account
var getSteemPowerPerAccount = function(account, totalVestingFund, totalVestingShares) {
    if (totalVestingFund && totalVestingShares) {
        var vesting_shares = getEffectiveVestingSharesPerAccount(account);
        var sp = steem.formatter.vestToSteem(vesting_shares, totalVestingShares, totalVestingFund);
        return sp;
    }
};

// get the voting dollars of a vote for a certain account, if full is set
// to true, the VM will be set to 100%, otherwise it will use the current VM
var getVotingDollarsPerAccount = async function(voteWeight, account, rewardBalance, recentClaims, steemPrice, votePowerReserveRate, full) {
    const vm = await getVotingMana(account) * 100;
    return new Promise(function(fulfill, reject) {
        if (rewardBalance && recentClaims && steemPrice && votePowerReserveRate) {
            var effective_vesting_shares = Math.round(getEffectiveVestingSharesPerAccount(account) * 1000000);
            var current_power = full ? 10000 : vm;
            var weight = voteWeight * 100;
            var max_vote_denom = votePowerReserveRate * STEEMIT_VOTE_REGENERATION_SECONDS / (60 * 60 * 24);
            var used_power = Math.round((current_power * weight) / STEEMIT_100_PERCENT);
            used_power = Math.round((used_power + max_vote_denom - 1) / max_vote_denom);
            var rshares = Math.round((effective_vesting_shares * used_power) / (STEEMIT_100_PERCENT))
            var voteValue = rshares *
                rewardBalance / recentClaims *
                steemPrice;
            fulfill(voteValue.toFixed(2));
        } else reject();
    });
};

// get Resource Credits
var getRC = function(name) {
    let data = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "rc_api.find_rc_accounts",
        "params": {
            "accounts": [name]
        }
    };
    return new Promise(function(fulfill, reject) {
        $.ajax({
            url: "https://api.steemit.com",
            type: "POST",
            data: JSON.stringify(data),
            success: function(response) {
                const STEEM_RC_MANA_REGENERATION_SECONDS = 432000;
                const estimated_max = parseFloat(response.result.rc_accounts["0"].max_rc);
                const current_mana = parseFloat(response.result.rc_accounts["0"].rc_manabar.current_mana);
                const last_update_time = parseFloat(response.result.rc_accounts["0"].rc_manabar.last_update_time);
                const diff_in_seconds = Math.round(Date.now() / 1000 - last_update_time);
                let estimated_mana = (current_mana + diff_in_seconds * estimated_max / STEEM_RC_MANA_REGENERATION_SECONDS);
                if (estimated_mana > estimated_max)
                    estimated_mana = estimated_max;

                const estimated_pct = estimated_mana / estimated_max * 100;
                const res = {
                    "current_mana": current_mana,
                    "last_update_time": last_update_time,
                    "estimated_mana": estimated_mana,
                    "estimated_max": estimated_max,
                    "estimated_pct": estimated_pct.toFixed(2),
                    "fullin": getTimeBeforeFull(estimated_pct * 100)
                };
                fulfill(res);
            },
            error: function(e) {
                console.log(e);
            }
        });
    });
}

// get in which time the VM will be full
function getTimeBeforeFull(votingPower) {
    var fullInString;
    var remainingPowerToGet = 100.0 - votingPower / 100;
    // 1% every 72minutes
    var minutesNeeded = remainingPowerToGet * 72;
    if (minutesNeeded === 0) {
        fullInString = "Already full!";
    } else {
        var fullInDays = parseInt(minutesNeeded / 1440);
        var fullInHours = parseInt((minutesNeeded - fullInDays * 1440) / 60);
        var fullInMinutes = parseInt((minutesNeeded - fullInDays * 1440 - fullInHours * 60));

        fullInString = (fullInDays === 0 ? '' : fullInDays + (fullInDays > 1 ? ' days ' : 'day ')) +
            (fullInHours === 0 ? '' : fullInHours + (fullInHours > 1 ? ' hours ' : 'hour ')) +
            (fullInMinutes === 0 ? '' : fullInMinutes + (fullInMinutes > 1 ? ' minutes ' : 'minute'));
    }
    return fullInString;
}

// Get STEEM price from Bittrex
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

// Get BTC price from Bittrex
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


// Get SBD price from Bittrex
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

// get Witness Ranks from SteemPlus API
function getWitnessRanks() {
    return new Promise(function(resolve, reject) {
        $.ajax({
            type: "GET",
            beforeSend: function(xhttp) {
                xhttp.setRequestHeader("Content-type", "application/json");
                xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
            },
            url: 'https://api.steemplus.app/witnesses-ranks',
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
function initiateCustomSelect() {
    /*look for any elements with the class "custom-select":*/
    x = document.getElementsByClassName("custom-select");

    for (i = 0; i < x.length; i++) {
        if (i == 4 && custom_created)
            return;
        if (i == 4 && !custom_created)
            custom_created = true;
        selElmnt = x[i].getElementsByTagName("select")[0];

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
        if (i == 0)
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
            } else if (!getPref && !manageKey && !this.classList.contains("select-arrow-active") && this.innerHTML != "SBD" && this.innerHTML != "STEEM") {
                chrome.storage.local.set({
                    last_account: this.innerHTML
                });
                loadAccount(this.innerHTML);
            } else if (this.innerHTML == "SBD") {
                $(".transfer_balance div").eq(0).text('SBD Balance');
                $(".transfer_balance div").eq(1).html(numberWithCommas(sbd));
            } else if (this.innerHTML == "STEEM") {
                $(".transfer_balance div").eq(0).text('STEEM Balance');
                $(".transfer_balance div").eq(1).html(numberWithCommas(steem_p));
            } else if (manageKey) {
                manageKeys(this.innerHTML);
            } else if (getPref && $(this).parent().attr("id") != "custom_select_rpc") {
                setPreferences(this.innerHTML);
            } else if (getPref && $(this).parent().attr("id") == "custom_select_rpc") {
                if (this.innerHTML != "ADD RPC")
                    switchRPC(this.innerHTML);
                else {
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

// Check if there is a reward to claim

function hasReward(reward_sbd, reward_sp, reward_steem) {
    return (getValFromString(reward_sbd) != 0 || getValFromString(reward_sp) != 0 || getValFromString(reward_steem) != 0);
}

function getValFromString(string) {
    return parseFloat(string.split(" ")[0]);
}

/**
 *
 *
Looks in the permission structure to determine whether a public key is really has permission sa stated in what is in the form of a perm_info structure.

* A "perm_info" structure has at least the following members:  weight_threshold, and key_auths.
* A "public key" in this context is really a base58 encoded string BTC-style addres starting with "STM."
* If no such key is found, then 0 is returned.  Otherwise the weight this key has is returned.


// The public key could be supplied by the user or derived from the private key using steem.auth.wifToPublic().
// The structures returned by steem.api.getAccounts() will have 'posting' and 'active' members each each of which is a perm_info structure.  These can be passed as the second parameter.  dpub will be the public key you wish to test.
**/
function getPubkeyWeight(dpub /* Public key string */, perm_info /*permission info structure*/) {
    for (let n in perm_info.key_auths) {
        let kw = perm_info.key_auths[n];
        let lpub = kw["0"];
        // later: maybe for multisig we should handle when weight threshold is too low by contacting the cosigner
        if (dpub == lpub) {
            return kw["1"];
        }
    } // for
    return 0;
}

let numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function nFormatter(num, digits) {
    var si = [{
            value: 1,
            symbol: ""
        },
        {
            value: 1E3,
            symbol: "k"
        },
        {
            value: 1E6,
            symbol: "M"
        },
        {
            value: 1E9,
            symbol: "G"
        },
        {
            value: 1E12,
            symbol: "T"
        },
        {
            value: 1E15,
            symbol: "P"
        },
        {
            value: 1E18,
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
