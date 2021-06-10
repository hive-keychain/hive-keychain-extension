const broadcastVote = data => {
  return new Promise((resolve, reject) => {
    hive.broadcast.vote(
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
          chrome.i18n.getMessage("bgd_ops_vote", [
            data.author,
            data.permlink,
            parseInt(data.weight) / 100
          ]),
          err_message
        );
        resolve(message);
      }
    );
  });
};
