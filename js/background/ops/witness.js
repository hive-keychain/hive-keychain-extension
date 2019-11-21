const broadcastWitnessVote = data => {
  return new Promise((resolve, reject) => {
    steem.broadcast.accountWitnessVote(
      key,
      data.username,
      data.witness,
      data.vote ? 1 : 0,
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
