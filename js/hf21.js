//HF21 wrapper

const createProposal = (keys, creator, receiver, start_date, end_date, daily_pay, subject, permlink, extensions = '[]') => {
  let tx = {
    'operations': [
      [
        'create_proposal', {
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
  }
  return broadcast(tx, keys);
}

const voteForProposal = (keys, voter, proposal_ids, approve, extensions = '[]') => {
  let tx = {
    'operations': [
      [
        'update_proposal_votes', {
          voter,
          proposal_ids: JSON.parse(proposal_ids),
          approve
        }
      ]
    ],
    extensions: JSON.parse(extensions)
  }
  return broadcast(tx, keys);
}

const removeProposal = (keys, proposal_owner, proposal_ids, extensions = '[]') => {
  let tx = {
    'operations': [
      [
        'remove_proposal', {
          proposal_owner,
          proposal_ids: JSON.parse(proposal_ids)
        }
      ]
    ],
    extensions: JSON.parse(extensions)
  }
  return broadcast(tx, keys);
}

const broadcast = (tx, keys) => {
  return new Promise((fulfill, reject) => {
    steem.broadcast.send(tx, keys, (error, result) => {
      if (!error)
        fulfill(result);
      else
        reject(error);
    });
  });
}