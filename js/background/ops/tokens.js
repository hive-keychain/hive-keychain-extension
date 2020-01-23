const broadcastSendToken = data => {
  return new Promise((resolve, reject) => {
    const id = config.mainNet;
    const json = {
      contractName: "tokens",
      contractAction: "transfer",
      contractPayload: {
        symbol: data.currency,
        to: data.to,
        quantity: data.amount,
        memo: data.memo
      }
    };
    steem.broadcast.customJson(
      key,
      [data.username],
      null,
      id,
      JSON.stringify(json),
      (err, result) => {
        console.log(result, err);
        const message = createMessage(
          err,
          result,
          data,
          chrome.i18n.getMessage("bgd_ops_tokens"),
          chrome.i18n.getMessage("bgd_ops_error_broadcasting")
        );
        resolve(message);
      }
    );
  });
};
