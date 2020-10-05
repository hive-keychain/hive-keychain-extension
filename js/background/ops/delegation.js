const broadcastDelegation = data => {
  return new Promise((resolve, reject) => {
    const ac = accountsList.get(data.username);
    const key_delegation = ac.getKey("active");
    hive.api.getDynamicGlobalPropertiesAsync().then(res => {
      let delegated_vest = null;
      if (data.unit == "HP") {
        console.log(res);
        const totalSteem = res.total_vesting_fund_steem
          ? Number(res.total_vesting_fund_steem.split(" ")[0])
          : Number(res.total_vesting_fund_hive.split(" ")[0]);
        const totalVests = Number(res.total_vesting_shares.split(" ")[0]);
        delegated_vest = (parseFloat(data.amount) * totalVests) / totalSteem;
        delegated_vest = delegated_vest.toFixed(6);
        delegated_vest = delegated_vest.toString() + " VESTS";
      } else {
        delegated_vest = data.amount + " VESTS";
      }
      hive.broadcast.delegateVestingShares(
        key_delegation,
        data.username,
        data.delegatee,
        delegated_vest,
        (err, result) => {
          console.log(result, err);
          const err_message = beautifyErrorMessage(err);
          const message = createMessage(
            err,
            result,
            data,
            parseFloat(data.amount) === 0
              ? chrome.i18n.getMessage("bgd_ops_undelegate", [
                  data.delegatee,
                  data.username
                ])
              : chrome.i18n.getMessage("bgd_ops_delegate", [
                  `${data.amount} ${data.unit}`,
                  data.delegatee,
                  data.username
                ]),
            err_message
          );
          resolve(message);
        }
      );
    });
  });
};
