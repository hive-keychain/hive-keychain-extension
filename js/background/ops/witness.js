const broadcastWitnessVote = data => {
  return new Promise((resolve, reject) => {
    steem.broadcast.accountWitnessVote(
      key,
      data.username,
      data.witness,
      data.vote ? 1 : 0,
      (err, result) => {
        console.log(result, err);
        const err_message = beautifyErrorMessage(err);
        const message = createMessage(
          err,
          result,
          data,
          `Successfully ${!data.vote ? "un" : ""}voted @${
            data.witness
          } for witness`,
          err_message
        );
        resolve(message);
      }
    );
  });
};
