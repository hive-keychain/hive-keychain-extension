class Account {
  constructor(obj) {
    this.account = obj || {};
  }
  init() {
    this.info = hive.api.getAccountsAsync([this.account.name]);
    this.props = new GlobalProps();
    this.delegatees = getDelegatees(this.account.name);
    this.delegators = getDelegators(this.account.name);
  }
  getObj() {
    return this.account;
  }
  getName() {
    return this.account.name;
  }
  getKeys() {
    return this.account.keys;
  }
  getKey(key) {
    return this.account.keys[key];
  }
  hasKey(key) {
    return this.account.keys.hasOwnProperty(key);
  }
  setKey(key, val) {
    this.account.keys[key] = val;
  }
  deleteKey(key) {
    delete this.account.keys[key];
    delete this.account.keys[`${key}Pubkey`];
  }
  async getAccountInfos() {
    return (await this.info)[0];
  }
  async getAccountInfo(key) {
    const info = (await this.info)[0];
    return info[key];
  }
  async getAvailableRewards() {
    this.hf24 = (await this.getAccountInfo("reward_sbd_balance")) === undefined;
    this.reward_hbd =
      (await this.getAccountInfo("reward_sbd_balance")) ||
      (await this.getAccountInfo("reward_hbd_balance"));
    this.reward_vests = await this.getAccountInfo("reward_vesting_balance");
    const reward_hp = (await this.toHP(this.reward_vests)) + " HP";
    this.reward_hive =
      (await this.getAccountInfo("reward_steem_balance")) ||
      (await this.getAccountInfo("reward_hive_balance"));
    let rewardText = chrome.i18n.getMessage("popup_account_redeem") + ":<br>";
    if (getValFromString(reward_hp) != 0) rewardText += reward_hp + " / ";
    if (getValFromString(this.reward_hbd) != 0)
      rewardText += this.reward_hbd + " / ";
    if (getValFromString(this.reward_hive) != 0)
      rewardText += this.reward_hive + " / ";
    rewardText = rewardText.slice(0, -3);
    return [this.reward_hbd, reward_hp, this.reward_hive, rewardText];
  }
  async toHP(vests) {
    return hive.formatter
      .vestToSteem(
        vests,
        await this.props.getProp("total_vesting_shares"),
        (await this.props.getProp("total_vesting_fund_steem")) ||
          (await this.props.getProp("total_vesting_fund_hive"))
      )
      .toFixed(3);
  }

  claimRewards(callback) {
    if (!this.hf24)
      hive.broadcast.claimRewardBalance(
        this.getKey("posting"),
        this.getName(),
        this.reward_hive.replace("HIVE", "STEEM"),
        this.reward_hbd.replace("HBD", "SBD"),
        this.reward_vests,
        callback
      );
    else
      hive.broadcast.claimRewardBalance(
        this.getKey("posting"),
        this.getName(),
        this.reward_hive,
        this.reward_hbd,
        this.reward_vests,
        callback
      );
  }

  async getVotingMana() {
    const vm = await getVotingMana(await this.getAccountInfos());
    const full = getTimeBeforeFull(vm * 100);
    return [vm, full];
  }

  async getHive() {
    return (await this.getAccountInfo("balance")).replace(" HIVE", "");
  }

  async getHBD() {
    if (await this.getAccountInfo("sbd_balance"))
      return (await this.getAccountInfo("sbd_balance")).replace(" HBD", "");
    else return (await this.getAccountInfo("hbd_balance")).replace(" HBD", "");
  }

  async getHP() {
    return await this.toHP(
      (await this.getAccountInfo("vesting_shares")).replace(" VESTS", "")
    );
  }

  async getMaxPD() {
    return Math.max(
      0,
      parseFloat(
        await this.toHP(
          parseFloat(
            (await this.getAccountInfo("vesting_shares")).replace(" VESTS", "")
          ) -
            parseFloat(
              (await this.getAccountInfo("delegated_vesting_shares")).replace(
                " VESTS",
                ""
              )
            )
        )
      ) - 5
    );
  }

  async getRC() {
    return await getRC(this.account.name);
  }

  async getVotingDollars(percentage) {
    return await getVotingDollarsPerAccount(
      percentage,
      await this.getAccountInfos(),
      (await this.props.getFund("reward_balance")).replace("HIVE", ""),
      (await this.props.getFund("recent_claims")).replace("HBD", ""),
      await this.props.getHivePrice(),
      await this.props.getProp("vote_power_reserve_rate"),
      false
    );
  }

  async getAccountValue() {
    const [hive, hbd] = await this.props.getPrices();
    console.log(hive, hbd);
    return (
      numberWithCommas(
        "$ " +
          (
            hbd * parseInt(await this.getHBD()) +
            hive *
              (parseInt(await this.getHP()) + parseInt(await this.getHive()))
          ).toFixed(2)
      ) + "\t  USD"
    );
  }

  async getTransfers() {
    const result = await hive.api.getAccountHistoryAsync(
      this.getName(),
      -1,
      1000
    );
    let transfers = result.filter(tx => tx[1].op[0] === "transfer");
    transfers = transfers.slice(-10).reverse();
    return transfers;
  }

  async getPowerDown() {
    const totalSteem = (await this.props.getProp("total_vesting_fund_steem"))
      ? Number(
          (await this.props.getProp("total_vesting_fund_steem")).split(" ")[0]
        )
      : Number(
          (await this.props.getProp("total_vesting_fund_hive")).split(" ")[0]
        );
    const totalVests = Number(
      (await this.props.getProp("total_vesting_shares")).split(" ")[0]
    );
    const withdrawn = (
      (((await this.getAccountInfo("withdrawn")) / totalVests) * totalSteem) /
      1000000
    ).toFixed(0);
    const total_withdrawing = (
      (((await this.getAccountInfo("to_withdraw")) / totalVests) * totalSteem) /
      1000000
    ).toFixed(0);
    const next_vesting_withdrawal = await this.getAccountInfo(
      "next_vesting_withdrawal"
    );
    return [withdrawn, total_withdrawing, next_vesting_withdrawal];
  }

  async powerDown(hp, callback) {
    const totalSteem = (await this.props.getProp("total_vesting_fund_steem"))
      ? Number(
          (await this.props.getProp("total_vesting_fund_steem")).split(" ")[0]
        )
      : Number(
          (await this.props.getProp("total_vesting_fund_hive")).split(" ")[0]
        );
    const totalVests = Number(
      (await this.props.getProp("total_vesting_shares")).split(" ")[0]
    );
    let vestingShares = (parseFloat(hp) * totalVests) / totalSteem;
    vestingShares = vestingShares.toFixed(6);
    vestingShares = vestingShares.toString() + " VESTS";

    hive.broadcast.withdrawVesting(
      this.getKey("active"),
      this.getName(),
      vestingShares,
      callback
    );
  }

  powerUp(amount, to, callback) {
    hive.broadcast.transferToVesting(
      this.getKey("active"),
      this.getName(),
      to,
      amount,
      callback
    );
  }

  async getDelegatees() {
    const that = this;
    let delegatees = await this.delegatees;
    delegatees = delegatees.filter(function(elt) {
      return elt.vesting_shares != 0;
    });
    if (delegatees.length > 0)
      delegatees = await Promise.all(
        delegatees.map(async elt => {
          elt.hp = parseFloat(
            await this.toHP(
              parseFloat(elt.vesting_shares.replace(" VESTS", ""))
            )
          ).toFixed(3);
          return elt;
        })
      );
    return delegatees;
  }
  async getDelegators() {
    const that = this;
    let delegators = await this.delegators;
    delegators = delegators.filter(function(elt) {
      return elt.vesting_shares != 0;
    });
    if (delegators.length > 0)
      delegators = await Promise.all(
        delegators.map(async elt => {
          const hp = await that.toHP(elt.vesting_shares + " VESTS");
          elt.hp = parseFloat(hp).toFixed(3);
          return elt;
        })
      );
    return delegators;
  }
  async delegateHP(amount, to, callback) {
    const totalSteem = (await this.props.getProp("total_vesting_fund_steem"))
      ? Number(
          (await this.props.getProp("total_vesting_fund_steem")).split(" ")[0]
        )
      : Number(
          (await this.props.getProp("total_vesting_fund_hive")).split(" ")[0]
        );
    const totalVests = Number(
      (await this.props.getProp("total_vesting_shares")).split(" ")[0]
    );
    let delegated_vest = (parseFloat(amount) * totalVests) / totalSteem;
    delegated_vest = delegated_vest.toFixed(6);
    delegated_vest = delegated_vest.toString() + " VESTS";
    hive.broadcast.delegateVestingShares(
      activeAccount.getKey("active"),
      activeAccount.getName(),
      to,
      delegated_vest,
      callback
    );
  }
}
