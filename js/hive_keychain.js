// Content script interfacing the website and the extension
var hive_keychain = {
  current_id: 1,
  requests: {},
  handshake_callback: null,

  requestHandshake: function(callback) {
    this.handshake_callback = callback;
    this.dispatchCustomEvent("swHandshake_hive", "");
  },

  requestVerifyKey: function(account, message, key, callback, rpc) {
    var request = {
      type: "decode",
      username: account,
      message: message,
      method: key,
      rpc
    };

    this.dispatchCustomEvent("swRequest_hive", request, callback);
  },

  requestSignBuffer: function(account, message, key, callback, rpc) {
    var request = {
      type: "signBuffer",
      username: account,
      message: message,
      method: key,
      rpc
    };

    this.dispatchCustomEvent("swRequest_hive", request, callback);
  },

  requestAddAccountAuthority: function(
    account,
    authorizedUsername,
    role,
    weight,
    callback,
    rpc
  ) {
    var request = {
      type: "addAccountAuthority",
      username: account,
      authorizedUsername,
      role,
      weight,
      method: "Active",
      rpc
    };

    this.dispatchCustomEvent("swRequest_hive", request, callback);
  },

  requestRemoveAccountAuthority: function(
    account,
    authorizedUsername,
    role,
    callback,
    rpc
  ) {
    var request = {
      type: "removeAccountAuthority",
      username: account,
      authorizedUsername,
      role,
      method: "Active",
      rpc
    };

    this.dispatchCustomEvent("swRequest_hive", request, callback);
  },
  requestAddKeyAuthority: function(
    account,
    authorizedKey,
    role,
    weight,
    callback,
    rpc
  ) {
    var request = {
      type: "addKeyAuthority",
      username: account,
      authorizedKey,
      weight,
      role,
      method: "Active",
      rpc
    };

    this.dispatchCustomEvent("swRequest_hive", request, callback);
  },
  requestRemoveKeyAuthority: function(
    account,
    authorizedKey,
    role,
    callback,
    rpc
  ) {
    var request = {
      type: "removeKeyAuthority",
      username: account,
      authorizedKey,
      role,
      method: "Active",
      rpc
    };

    this.dispatchCustomEvent("swRequest_hive", request, callback);
  },

  requestBroadcast: function(account, operations, key, callback, rpc) {
    var request = {
      type: "broadcast",
      username: account,
      operations,
      method: key,
      rpc
    };

    this.dispatchCustomEvent("swRequest_hive", request, callback);
  },

  requestSignTx: function(account, tx, key, callback, rpc) {
    var request = {
      type: "signTx",
      username: account,
      tx,
      method: key,
      rpc
    };

    this.dispatchCustomEvent("swRequest_hive", request, callback);
  },

  requestSignedCall: function(account, method, params, key, callback, rpc) {
    console.log("getting request");
    var request = {
      type: "signedCall",
      username: account,
      method,
      params,
      typeWif: key,
      rpc
    };
    console.log(request);
    this.dispatchCustomEvent("swRequest_hive", request, callback);
  },

  // Example comment_options: {"author":"stoodkev","permlink":"hi","max_accepted_payout":"100000.000 SBD","percent_steem_dollars":10000,"allow_votes":true,"allow_curation_rewards":true,"extensions":[[0,{"beneficiaries":[{"account":"yabapmatt","weight":1000},{"account":"steemplus-pay","weight":500}]}]]}
  requestPost: function(
    account,
    title,
    body,
    parent_perm,
    parent_account,
    json_metadata,
    permlink,
    comment_options,
    callback,
    rpc
  ) {
    var request = {
      type: "post",
      username: account,
      title,
      body,
      parent_perm,
      parent_username: parent_account,
      json_metadata,
      permlink,
      comment_options,
      rpc
    };
    this.dispatchCustomEvent("swRequest_hive", request, callback);
  },

  requestVote: function(account, permlink, author, weight, callback, rpc) {
    var request = {
      type: "vote",
      username: account,
      permlink,
      author,
      weight,
      rpc
    };

    this.dispatchCustomEvent("swRequest_hive", request, callback);
  },

  requestCustomJson: function(
    account,
    id,
    key,
    json,
    display_msg,
    callback,
    rpc
  ) {
    var request = {
      type: "custom",
      username: account,
      id: id, //can be "custom", "follow", "reblog" etc.
      method: key, // Posting key is used by default, active can be specified for id=custom .
      json: json, //content of your json
      display_msg: display_msg,
      rpc
    };

    this.dispatchCustomEvent("swRequest_hive", request, callback);
  },
  requestTransfer: function(
    account,
    to,
    amount,
    memo,
    currency,
    callback,
    enforce = false,
    rpc
  ) {
    var request = {
      type: "transfer",
      username: account,
      to,
      amount,
      memo,
      enforce,
      currency,
      rpc
    };
    this.dispatchCustomEvent("swRequest_hive", request, callback);
  },
  // requestSendToken: function(
  //   account,
  //   to,
  //   amount,
  //   memo,
  //   currency,
  //   callback,
  //   rpc
  // ) {
  //   var request = {
  //     type: "sendToken",
  //     username: account,
  //     to,
  //     amount,
  //     memo,
  //     currency,
  //     rpc
  //   };
  //   this.dispatchCustomEvent("swRequest_hive", request, callback);
  // },
  requestDelegation: function(
    username,
    delegatee,
    amount,
    unit,
    callback,
    rpc
  ) {
    var request = {
      type: "delegation",
      username,
      delegatee,
      amount,
      unit,
      rpc
    };
    this.dispatchCustomEvent("swRequest_hive", request, callback);
  },
  requestWitnessVote: function(username, witness, vote, callback, rpc) {
    var request = {
      type: "witnessVote",
      username,
      witness,
      vote,
      rpc
    };
    this.dispatchCustomEvent("swRequest_hive", request, callback);
  },
  requestProxy: function(username, proxy, callback, rpc) {
    console.log(username, proxy);
    var request = {
      type: "proxy",
      username,
      proxy,
      rpc
    };
    this.dispatchCustomEvent("swRequest_hive", request, callback);
  },
  requestPowerUp: function(username, recipient, steem, callback, rpc) {
    var request = {
      type: "powerUp",
      username,
      recipient,
      steem,
      rpc
    };
    this.dispatchCustomEvent("swRequest_hive", request, callback);
  },
  requestPowerDown: function(username, steem_power, callback, rpc) {
    var request = {
      type: "powerDown",
      username,
      steem_power,
      rpc
    };
    this.dispatchCustomEvent("swRequest_hive", request, callback);
  },

  requestCreateClaimedAccount: function(
    username,
    new_account,
    owner,
    active,
    posting,
    memo,
    callback,
    rpc
  ) {
    const request = {
      type: "createClaimedAccount",
      username,
      new_account,
      owner,
      active,
      posting,
      memo,
      rpc
    };

    this.dispatchCustomEvent("swRequest_hive", request, callback);
  },

  //HF21
  requestCreateProposal: function(
    username,
    receiver,
    subject,
    permlink,
    daily_pay,
    start,
    end,
    extensions,
    callback,
    rpc
  ) {
    const request = {
      type: "createProposal",
      username,
      receiver,
      subject,
      permlink,
      start,
      end,
      daily_pay,
      extensions,
      rpc
    };

    this.dispatchCustomEvent("swRequest_hive", request, callback);
  },

  requestRemoveProposal: function(
    username,
    proposal_ids,
    extensions,
    callback,
    rpc
  ) {
    const request = {
      type: "removeProposal",
      username,
      proposal_ids,
      extensions,
      rpc
    };

    this.dispatchCustomEvent("swRequest_hive", request, callback);
  },
  requestUpdateProposalVote: function(
    username,
    proposal_ids,
    approve,
    extensions,
    callback,
    rpc
  ) {
    const request = {
      type: "updateProposalVote",
      username,
      proposal_ids,
      approve,
      extensions,
      rpc
    };

    this.dispatchCustomEvent("swRequest_hive", request, callback);
  },

  // Send the customEvent
  dispatchCustomEvent: function(name, data, callback) {
    this.requests[this.current_id] = callback;
    data = Object.assign(
      {
        request_id: this.current_id
      },
      data
    );
    document.dispatchEvent(
      new CustomEvent(name, {
        detail: data
      })
    );
    this.current_id++;
  }
};

window.addEventListener(
  "message",
  function(event) {
    // We only accept messages from ourselves
    if (event.source != window) return;

    if (event.data.type && event.data.type == "hive_keychain_response") {
      const response = event.data.response;
      if (response && response.request_id) {
        if (hive_keychain.requests[response.request_id]) {
          hive_keychain.requests[response.request_id](response);
          delete hive_keychain.requests[response.request_id];
        }
      }
    } else if (
      event.data.type &&
      event.data.type == "hive_keychain_handshake"
    ) {
      if (hive_keychain.handshake_callback) {
        hive_keychain.handshake_callback();
      }
    }
  },
  false
);
