const broadcastVote = data => {
  return new Promise((resolve, reject) => {
    steem.broadcast.vote(
      key,
      data.username,
      data.author,
      data.permlink,
      parseInt(data.weight),
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
