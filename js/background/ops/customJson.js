const broadcastCustomJson = data => {
  return new Promise((resolve, reject) => {
    steem.broadcast.customJson(
      key,
      data.method.toLowerCase() == "active" ? [data.username] : null,
      data.method.toLowerCase() == "posting" ? [data.username] : null,
      data.id,
      data.json,
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
