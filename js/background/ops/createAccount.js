const broadcastCreateClaimedAccount = data => {
  return new Promise((resolve, reject) => {
    hive.broadcast.createClaimedAccount(
      key,
      data.username,
      data.new_account,
      JSON.parse(data.owner),
      JSON.parse(data.active),
      JSON.parse(data.posting),
      data.memo,
      {},
      [],
      (err, result) => {
        console.log(result, err);
        const err_message = beautifyErrorMessage(err);
        const message = createMessage(
          err,
          result,
          data,
          chrome.i18n.getMessage("bgd_ops_create_account", [data.new_account]),
          err_message
        );
        resolve(message);
      }
    );
  });
};
