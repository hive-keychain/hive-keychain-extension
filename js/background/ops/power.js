const broadcastPowerUp = data => {
  return new Promise((resolve, reject) => {
    steem.broadcast.transferToVesting(
      key,
      data.username,
      data.recipient,
      data.steem + " STEEM",
      (err, result) => {
        console.log(result, err);
        const err_message = beautifyErrorMessage(err);
        const message = createMessage(
          err,
          result,
          data,
          `Powered up ${data.steem} STEEM on @${data.recipient}`,
          err_message
        );
        resolve(message);
      }
    );
  });
};

const broadcastPowerDown = data => {
  return new Promise((resolve, reject) => {
    steem.api.getDynamicGlobalPropertiesAsync().then(res => {
      let vestingShares = null;
      const totalSteem = Number(res.total_vesting_fund_steem.split(" ")[0]);
      const totalVests = Number(res.total_vesting_shares.split(" ")[0]);
      vestingShares = (parseFloat(data.steem_power) * totalVests) / totalSteem;
      vestingShares = vestingShares.toFixed(6);
      vestingShares = vestingShares.toString() + " VESTS";

      steem.broadcast.withdrawVesting(
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
            vestingShares == 0
              ? `Stopped Power Down on @${data.username}`
              : `Started a ${data.steem_power} SP Power Down on @${data.username}`,
            err_message
          );
          resolve(message);
        }
      );
    });
  });
};
