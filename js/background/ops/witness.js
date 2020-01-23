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
          data.vote
            ? chrome.i18n.getMessage("bgd_ops_witness_voted", [data.witness])
            : chrome.i18n.getMessage("bgd_ops_witness_unvoted", [data.witness]),
          err_message
        );
        resolve(message);
      }
    );
  });
};
