let rewardInterval;

const startClaimRewards = obj => {
  if (rewardInterval) clearTimeout(rewardInterval);
  setInterval(async () => {
    const users = Object.keys(obj);
    for (const user of users) {
      await claimRewardIfPossible(user);
    }
  }, 3600 * 1000);
};

const claimRewardIfPossible = async user => {
  try {
    const account = (await hive.api.getAccountsAsync([user]))[0];
    const {
      reward_sbd_balance,
      reward_vesting_balance,
      reward_steem_balance
    } = account;
    const accountObj = accountsList.get(user);
    if (!accountObj) return;
    if (
      parseFloat(reward_sbd_balance) > 0 ||
      parseFloat(reward_vesting_balance) > 0 ||
      parseFloat(reward_steem_balance) > 0
    )
      await hive.broadcast.claimRewardBalanceAsync(
        accountObj.getKey("posting"),
        accountObj.getName(),
        reward_steem_balance.replace("HIVE", "STEEM"),
        reward_sbd_balance.replace("HBD", "SBD"),
        reward_vesting_balance
      );
  } catch (e) {
    console.log(e);
  }
};
