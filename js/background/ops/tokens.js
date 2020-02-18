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
          "The transaction has been broadcasted successfully. Please check your balance to confirm that it was processed succesfully.",
          "There was an error broadcasting this transaction, please try again."
        );
        resolve(message);
      }
    );
  });
};
