const broadcastData = data => {
  return new Promise((resolve, reject) => {
    const operations = data.operations;
    const broadcastKeys = {};
    broadcastKeys[data.typeWif] = key;
    steem.broadcast.send(
      {
        operations,
        extensions: []
      },
      broadcastKeys,
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
