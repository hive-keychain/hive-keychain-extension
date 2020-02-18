const broadcastCreateClaimedAccount = data => {
  return new Promise((resolve, reject) => {
    steem.broadcast.createClaimedAccount(
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
        const message = createMessage(
          err,
          result,
          data,
          "The transaction has been broadcasted successfully.",
          "There was an error broadcasting this transaction, please try again."
        );
        resolve(message);
      }
    );
  });
};
