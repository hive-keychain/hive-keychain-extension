let rewardInterval;
let accountsInterval;

const startClaimRewards = obj => {
  if (rewardInterval) clearTimeout(rewardInterval);
  const users = Object.keys(obj);
  iterateClaimRewards(users);
  rewardInterval = setInterval(async () => {
    iterateClaimRewards(users);
  }, 1200 * 1000);
};

const iterateClaimRewards = async users => {
  for (const user of users) {
    await claimRewardIfPossible(user);
  }
};

const startClaimAccounts = obj => {
  if (accountsInterval) clearTimeout(accountsInterval);
  const users = Object.keys(obj);
  iterateClaimAccounts(users);
  accountsInterval = setInterval(() => {
    iterateClaimAccounts(users);
  }, 1200 * 1000);
};

const iterateClaimAccounts = async users => {
  for (const user of users) {
    await claimAccountsIfPossible(user);
  }
};

const claimRewardIfPossible = async user => {
  try {
    const account = (await hive.api.getAccountsAsync([user]))[0];
    const {
      reward_sbd_balance,
      reward_vesting_balance,
      reward_steem_balance,
      reward_hive_balance,
      reward_hbd_balance
    } = account;
    const rewardMain = reward_hive_balance
      ? reward_hive_balance
      : reward_steem_balance;
    const rewardDollar = reward_hbd_balance
      ? reward_hbd_balance
      : reward_sbd_balance;
    const accountObj = accountsList.get(user);
    if (!accountObj) return;
    if (
      parseFloat(rewardDollar) > 0 ||
      parseFloat(reward_vesting_balance) > 0 ||
      parseFloat(rewardMain) > 0
    ) {
      console.log(`claiming ${reward_vesting_balance} VESTS for @${user}`);
      await hive.broadcast.claimRewardBalanceAsync(
        accountObj.getKey("posting"),
        accountObj.getName(),
        rewardMain.replace("HIVE", "STEEM"),
        rewardDollar.replace("HBD", "SBD"),
        reward_vesting_balance
      );
    }
  } catch (e) {
    console.log(e);
  }
};

const claimAccountsIfPossible = async user => {
  try {
    const rc = await getRC(user);
    const CLAIM_ACCOUNT_RC = 6 * 10 ** 12;
    if (
      parseFloat(rc.estimated_pct) > 95 &&
      rc.estimated_max / CLAIM_ACCOUNT_RC > 1.42
    ) {
      console.log("try to claim", user);
      const accountObj = accountsList.get(user);
      if (!accountObj) return;
      console.log(accountObj);
      const operations = [
        [
          "claim_account",
          {
            creator: user,
            extensions: [],
            fee: "0.000 HIVE"
          }
        ]
      ];
      console.log(operations);
      await hive.broadcast.send(
        {
          operations: operations,
          extensions: []
        },
        { active: accountObj.getKey("active") },
        (a, e) => {
          console.log(a, e);
        }
      );
    }
  } catch (e) {
    console.log(e);
  }
};

const getRC = name => {
  let data = {
    jsonrpc: "2.0",
    id: 1,
    method: "rc_api.find_rc_accounts",
    params: {
      accounts: [name]
    }
  };
  let url = rpc.getCurrent();
  if (url === "DEFAULT") url = "https://api.hive.blog/";
  return new Promise((fulfill, reject) => {
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
          estimated_max: estimated_max,
          estimated_pct: estimated_pct.toFixed(2)
        };
        fulfill(res);
      },
      error: e => {
        console.log(e);
      }
    });
  });
};
