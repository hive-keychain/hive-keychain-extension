const broadcastCreateProposal = data => {
  return new Promise((resolve, reject) => {
    let keys = {};
    keys[data.typeWif] = key;
    createProposal(
      keys,
      data.username,
      data.receiver,
      data.start,
      data.end,
      data.daily_pay,
      data.subject,
      data.permlink,
      data.extensions,
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

const broadcastUpdateProposalVote = data => {
  return new Promise((resolve, reject) => {
    let voteKeys = {};
    voteKeys[data.typeWif] = key;
    voteForProposal(
      voteKeys,
      data.username,
      data.proposal_ids,
      data.approve,
      data.extensions,
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

const broadcastRemoveProposal = data => {
  return new Promise((resolve, reject) => {
    let removeProposalKeys = {};
    removeProposalKeys[data.typeWif] = key;
    removeProposal(
      removeProposalKeys,
      data.username,
      data.proposal_ids,
      data.extensions,
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
