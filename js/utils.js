const STEEMIT_100_PERCENT=10000;
const STEEM_VOTING_MANA_REGENERATION_SECONDS =432000;

var getVotingMana = function(account) {
      return new Promise(function(fulfill,reject){
        const mana= getVotingManaData(account);
        fulfill(mana.estimated_pct.toFixed(2));
      });
    };

    var getVotingManaData = function(account) {

        const estimated_max = getEffectiveVestingSharesPerAccount(account)*1000000;
        const current_mana = parseFloat(account.voting_manabar.current_mana);
        const last_update_time = account.voting_manabar.last_update_time;
        const diff_in_seconds = Math.round(Date.now()/1000-last_update_time);
        let estimated_mana = (current_mana + diff_in_seconds * estimated_max / STEEM_VOTING_MANA_REGENERATION_SECONDS);
        if (estimated_mana > estimated_max)
            estimated_mana = estimated_max;
        const estimated_pct = estimated_mana / estimated_max * 100;
        return {"current_mana": current_mana, "last_update_time": last_update_time,
                "estimated_mana": estimated_mana, "estimated_max": estimated_max, "estimated_pct": estimated_pct};
    }

    var getEffectiveVestingSharesPerAccount = function(account) {
        var effective_vesting_shares = parseFloat(account.vesting_shares.replace(" VESTS", "")) +
            parseFloat(account.received_vesting_shares.replace(" VESTS", "")) -
            parseFloat(account.delegated_vesting_shares.replace(" VESTS", ""));
        return effective_vesting_shares;
    };

    var getSteemPowerPerAccount = function(account, totalVestingFund, totalVestingShares) {
        if (totalVestingFund && totalVestingShares) {
            var vesting_shares = getEffectiveVestingSharesPerAccount(account);
            var sp = steem.formatter.vestToSteem(vesting_shares, totalVestingShares, totalVestingFund);
            return sp;
        }
    };

    var getVotingDollarsPerAccount =  function(voteWeight, account, rewardBalance, recentClaims, steemPrice, votePowerReserveRate, full) {
        return new Promise(async function(fulfill,reject){
          if (rewardBalance && recentClaims && steemPrice && votePowerReserveRate) {
            var effective_vesting_shares = Math.round(getEffectiveVestingSharesPerAccount(account) * 1000000);
            var current_power = full ? 10000 : await getVotingMana(account)*100;
            var weight = voteWeight * 100;
            var max_vote_denom = votePowerReserveRate * STEEMIT_VOTE_REGENERATION_SECONDS / (60 * 60 * 24);
            var used_power = Math.round((current_power * weight) / STEEMIT_100_PERCENT);
            used_power = Math.round((used_power + max_vote_denom - 1) / max_vote_denom);
            var rshares = Math.round((effective_vesting_shares * used_power) / (STEEMIT_100_PERCENT))
            var voteValue = rshares *
                rewardBalance / recentClaims *
                steemPrice;
            fulfill(voteValue.toFixed(2));
          }
          else reject();
          });
    };

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
