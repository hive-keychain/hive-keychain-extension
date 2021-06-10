//HF21 wrapper

const createProposal = (
  keys,
  creator,
  receiver,
  start_date,
  end_date,
  daily_pay,
  subject,
  permlink,
  extensions = "[]",
  callback
) => {
  let tx = {
    operations: [
      [
        "create_proposal",
        {
          creator,
          receiver,
          start_date,
          end_date,
          daily_pay,
          subject,
          permlink
        }
      ]
    ],
    extensions: JSON.parse(extensions)
  };
  return broadcast(tx, keys, callback);
};

const voteForProposal = (
  keys,
  voter,
  proposal_ids,
  approve,
  extensions = "[]",
  callback
) => {
  let tx = {
    operations: [
      [
        "update_proposal_votes",
        {
          voter,
          proposal_ids: JSON.parse(proposal_ids),
          approve
        }
      ]
    ],
    extensions: JSON.parse(extensions)
  };
  return broadcast(tx, keys, callback);
};

const removeProposal = (
  keys,
  proposal_owner,
  proposal_ids,
  extensions = "[]",
  callback
) => {
  let tx = {
    operations: [
      [
        "remove_proposal",
        {
          proposal_owner,
          proposal_ids: JSON.parse(proposal_ids)
        }
      ]
    ],
    extensions: JSON.parse(extensions)
  };
  return broadcast(tx, keys, callback);
};

const broadcast = (tx, keys, callback) => {
  hive.broadcast.send(tx, keys, (error, result) => {
    callback(error, result);
  });
};
