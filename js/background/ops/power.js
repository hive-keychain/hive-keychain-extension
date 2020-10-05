const broadcastPowerUp = data => {
  return new Promise((resolve, reject) => {
    hive.broadcast.transferToVesting(
      key,
      data.username,
      data.recipient,
      `${data.steem} STEEM`,
      (err, result) => {
        console.log(result, err);
        const err_message = beautifyErrorMessage(err);
        const message = createMessage(
          err,
          result,
          data,
          chrome.i18n.getMessage("bgd_ops_pu", [data.steem, data.recipient]),
          err_message
        );
        resolve(message);
      }
    );
  });
};

const broadcastPowerDown = data => {
  return new Promise((resolve, reject) => {
    hive.api.getDynamicGlobalPropertiesAsync().then(res => {
      let vestingShares = null;
      const totalSteem = res.total_vesting_fund_steem
        ? Number(res.total_vesting_fund_steem.split(" ")[0])
        : Number(res.total_vesting_fund_hive.split(" ")[0]);
      const totalVests = Number(res.total_vesting_shares.split(" ")[0]);
      vestingShares = (parseFloat(data.steem_power) * totalVests) / totalSteem;
      vestingShares = vestingShares.toFixed(6);
      vestingShares = vestingShares.toString() + " VESTS";

      hive.broadcast.withdrawVesting(
        key,
        data.username,
        vestingShares,
        (err, result) => {
          console.log(result, err);
          const err_message = beautifyErrorMessage(err);
          const message = createMessage(
            err,
            result,
            data,
            parseFloat(data.steem_power) == 0
              ? chrome.i18n.getMessage("bgd_ops_pd_stop", [data.username])
              : chrome.i18n.getMessage("bgd_ops_pd", [
                  data.steem_power,
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
