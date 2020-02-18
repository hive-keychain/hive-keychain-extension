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
        const err_message = beautifyErrorMessage(err);
        const message = createMessage(
          err,
          result,
          data,
          `Successfully voted for @${data.author}'s post ${
            data.permlink
          } at ${parseInt(data.weight) / 100}%`,
          err_message
        );
        resolve(message);
      }
    );
  });
};
