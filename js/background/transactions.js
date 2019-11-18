const performTransaction = async (data, tab, no_confirm) => {
  let message = null;
  try {
    console.log(data);
    if (data.rpc) rpc.setOptions(data.rpc, true);
    switch (data.type) {
      case "custom":
        message = await broadcastCustomJson(data);
        break;
      case "vote":
        message = await broadcastVote(data);
        break;
      case "transfer":
        message = await broadcastTransfer(data);
        break;
      case "post":
        console.log("post");
        message = await broadcastPost(data);
        break;
      case "addAccountAuthority":
        message = await broadcastAddAccountAuthority(data);
        break;
      case "removeAccountAuthority":
        message = await broadcastRemoveAccountAuthority(data);
        break;
      case "broadcast":
        message = await broadcastData(data);
        break;
      case "createClaimedAccount":
        message = await broadcastCreateClaimedAccount(data);
        break;
      case "signedCall":
        message = await broadcastSignedCall(data);
        break;
      case "delegation":
        message = await broadcastDelegation(data);
        break;
      case "witnessVote":
        message = await broadcastWitnessVote(data);
        break;
      case "powerUp":
        message = await broadcastPowerUp(data);
        break;
      case "powerDown":
        message = await broadcastPowerDown(data);
        break;
      case "sendToken":
        message = await broadcastSendToken(data);
        break;
      case "createProposal":
        message = await broadcastCreateProposal(data);
        break;
      case "updateProposalVote":
        message = await broadcastUpdateProposalVote(data);
        break;
      case "removeProposal":
        message = await broadcastRemoveProposal(data);
        break;
      case "decode":
        message = await decodeMessage(data);
        break;
      case "signBuffer":
        message = await signBuffer(data);
        break;
    }
    chrome.tabs.sendMessage(tab, message);
  } catch (e) {
    console.log("error", e);
    sendErrors(
      tab,
      e,
      "An unknown error has occurred.",
      "An unknown error has occurred.",
      data
    );
  } finally {
    if (no_confirm) {
      if (id_win != null) {
        removeWindow(id_win);
      }
    } else chrome.runtime.sendMessage(message);
    key = null;
    accounts = null;
    rpc.rollback();
  }
};

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

const broadcastTransfer = data => {
  return new Promise(async (resolve, reject) => {
    let ac = accounts.list.find(function(e) {
      return e.name == data.username;
    });
    let memo = data.memo || "";
    let key_transfer = ac.keys.active;
    if (data.memo && data.memo.length > 0 && data.memo[0] == "#") {
      try {
        const receiver = await steem.api.getAccountsAsync([data.to]);
        const memoReceiver = receiver["0"].memo_key;
        memo = window.encodeMemo(ac.keys.memo, memoReceiver, memo);
      } catch (e) {
        console.log(e);
      }
    }
    steem.broadcast.transfer(
      key_transfer,
      data.username,
      data.to,
      data.amount + " " + data.currency,
      memo,
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

const broadcastPost = data => {
  console.log("broadcastPost");
  console.log(data);
  return new Promise((resolve, reject) => {
    if (data.comment_options == "") {
      steem.broadcast.comment(
        key,
        data.parent_username,
        data.parent_perm,
        data.username,
        data.permlink,
        data.title,
        data.body,
        data.json_metadata,
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
    } else {
      const operations = [
        [
          "comment",
          {
            parent_author: data.parent_username,
            parent_permlink: data.parent_perm,
            author: data.username,
            permlink: data.permlink,
            title: data.title,
            body: data.body,
            json_metadata: data.json_metadata
          }
        ],
        ["comment_options", JSON.parse(data.comment_options)]
      ];
      steem.broadcast.send(
        {
          operations,
          extensions: []
        },
        {
          posting: key
        },
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
    }
  });
};

const broadcastAddAccountAuthority = data => {
  return new Promise((resolve, reject) => {
    steem.broadcast.addAccountAuth(
      {
        signingKey: key,
        username: data.username,
        authorizedUsername: data.authorizedUsername,
        role: data.role.toLowerCase(),
        weight: parseInt(data.weight)
      },
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

const broadcastRemoveAccountAuthority = data => {
  return new Promise((resolve, reject) => {
    steem.broadcast.removeAccountAuth(
      {
        signingKey: key,
        username: data.username,
        authorizedUsername: data.authorizedUsername,
        role: data.role.toLowerCase()
      },
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

const broadcastData = data => {
  return new Promise((resolve, reject) => {
    const operations = data.operations;
    const broadcastKeys = {};
    broadcastKeys[data.typeWif] = key;
    steem.broadcast.send(
      {
        operations,
        extensions: []
      },
      broadcastKeys,
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

const broadcastCreateClaimedAccount = data => {
  return new Promise((resolve, reject) => {
    steem.broadcast.createClaimedAccount(
      key,
      data.username,
      data.new_account,
      JSON.parse(data.owner),
      JSON.parse(data.active),
      JSON.parse(data.posting),
      data.memo,
      {},
      [],
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

const broadcastSignedCall = data => {
  return new Promise((resolve, reject) => {
    window.signedCall(
      data.method,
      data.params,
      data.username,
      key,
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

const broadcastDelegation = data => {
  return new Promise((resolve, reject) => {
    steem.api.getDynamicGlobalPropertiesAsync().then(res => {
      let delegated_vest = null;
      if (data.unit == "SP") {
        const totalSteem = Number(res.total_vesting_fund_steem.split(" ")[0]);
        const totalVests = Number(res.total_vesting_shares.split(" ")[0]);
        delegated_vest = (parseFloat(data.amount) * totalVests) / totalSteem;
        delegated_vest = delegated_vest.toFixed(6);
        delegated_vest = delegated_vest.toString() + " VESTS";
      } else {
        delegated_vest = data.amount + " VESTS";
      }
      steem.broadcast.delegateVestingShares(
        key,
        data.username,
        data.delegatee,
        delegated_vest,
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
  });
};

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

const broadcastPowerUp = data => {
  return new Promise((resolve, reject) => {
    steem.broadcast.transferToVesting(
      key,
      data.username,
      data.recipient,
      data.steem + " STEEM",
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

const broadcastPowerDown = data => {
  return new Promise((resolve, reject) => {
    steem.api.getDynamicGlobalPropertiesAsync().then(res => {
      let vestingShares = null;
      const totalSteem = Number(res.total_vesting_fund_steem.split(" ")[0]);
      const totalVests = Number(res.total_vesting_shares.split(" ")[0]);
      vestingShares = (parseFloat(data.steem_power) * totalVests) / totalSteem;
      vestingShares = vestingShares.toFixed(6);
      vestingShares = vestingShares.toString() + " VESTS";

      steem.broadcast.withdrawVesting(
        key,
        data.username,
        vestingShares,
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
  });
};

const broadcastSendToken = data => {
  return new Promise((resolve, reject) => {
    const id = config.mainNet;
    const json = {
      contractName: "tokens",
      contractAction: "transfer",
      contractPayload: {
        symbol: data.currency,
        to: data.to,
        quantity: data.amount,
        memo: data.memo
      }
    };
    steem.broadcast.customJson(
      key,
      [data.username],
      null,
      id,
      JSON.stringify(json),
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

const decodeMessage = data => {
  let message = null;
  let decoded = null;
  let error = null;
  try {
    decoded = window.decodeMemo(key, data.message);
  } catch (err) {
    error = err;
  } finally {
    return createMessage(
      error,
      decoded,
      data,
      "Memo decoded succesfully",
      "Could not verify key."
    );
  }
};

const signBuffer = data => {
  let message = null;
  let signed = null;
  let error = null;
  try {
    signed = window.signBuffer(data.message, key);
  } catch (err) {
    error = err;
  } finally {
    return createMessage(
      error,
      signed,
      data,
      "Message signed succesfully",
      "Could not sign"
    );
  }
};

const createMessage = (err, result, data, success_message, fail_message) => {
  return {
    command: "answerRequest",
    msg: {
      success: !err,
      error: err,
      result: result,
      data: data,
      message: !err ? success_message : fail_message,
      request_id
    }
  };
};
