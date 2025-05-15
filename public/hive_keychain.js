/**
 * Use the `hive_keychain` methods listed below to issue requests to the Hive blockchain.
 */
var hive_keychain = {
  current_id: 1,
  requests: {},
  handshake_callback: null,
  /**
   * @callback requestCallback
   * @param {Object} response Keychain's response to the request
   */

  /**
   * This function is called to verify Keychain installation on a user's device
   * @param {function} callback Confirms Keychain installation (has no parameters)
   */
  requestHandshake: function (callback) {
    this.handshake_callback = callback;
    this.dispatchCustomEvent('swHandshake_hive', '');
  },

  /**
   * This function is called to verify that the user has a certain authority over an account, by requesting to decode a message
   * @example
   * const keychain = window.hive_keychain;
   * const message = username + Date.now();
   * keychain.requestEncodeMessage(username, myUsername, message, 'Memo', (response) => {
   *   if (response.success) {
   *     const encodedMessage = response.result;
   *     // Send message to a server where you can use your private key to decode it
   *   }
   * });
   *
   * @param {String} username Hive account to perform the request
   * @param {String} receiver Account that will decode the string
   * @param {String} message Message to be encrypted
   * @param {String} key Type of key. Can be 'Posting','Active' or 'Memo'
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   */
  requestEncodeMessage: function (username, receiver, message, key, callback) {
    var request = {
      type: 'encode',
      username,
      receiver,
      message,
      method: key,
    };

    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * This function is called to allow encoding a message with multiple receivers. This is used in the case of multisig
   * @example
   * const keychain = window.hive_keychain;
   * const message = username + Date.now();
   * keychain.requestEncodeMessage(username, [pubKey1, pubKey2], message, 'Memo', (response) => {
   *   if (response.success) {
   *     const encodedMessages = response.result;
   *     // Send message to a server where you can use your private key to decode it
   *   }
   * });
   *
   * @param {String} username Hive account to perform the request
   * @param {Array<String>} publicKeys Key that can decode the string
   * @param {String} message Message to be encrypted
   * @param {String} key Type of key. Can be 'Posting','Active' or 'Memo'
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   */
  requestEncodeWithKeys: function (
    username,
    publicKeys,
    message,
    key,
    callback,
  ) {
    var request = {
      type: 'encodeWithKeys',
      username,
      publicKeys,
      message,
      method: key,
    };

    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * This function is called to verify that the user has a certain authority over an account, by requesting to decode a message
   * @example
   * const keychain = window.hive_keychain;
   * keychain.requestVerifyKey('stoodkev', encodedMessage, 'Posting', (response) => {
   *   if (response.success === true) {
   *     const decodedMessage = response.result;
   *   }
   * });
   * @param {String} account Hive account to perform the request
   * @param {String} message Message to be decoded by the account
   * @param {String} key Type of key. Can be 'Posting','Active' or 'Memo'
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   */
  requestVerifyKey: function (account, message, key, callback) {
    var request = {
      type: 'decode',
      username: account,
      message: message,
      method: key,
    };

    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * Requests a message to be signed with proper authority
   * @param {String} [account=null] Hive account to perform the request. If null, user can choose the account from a dropdown
   * @param {String} message Message to be signed by the account
   * @param {String} key Type of key. Can be 'Posting','Active' or 'Memo'
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
   * @param {String} [title=null] Override "Sign message" title
   */
  requestSignBuffer: function (account, message, key, callback, rpc, title) {
    var request = {
      type: 'signBuffer',
      username: account,
      message: message,
      method: key,
      rpc,
      title,
    };

    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * Requests to add account authority over another account. For more information about multisig, please read https://peakd.com/utopian-io/@stoodkev/how-to-set-up-and-use-multisignature-accounts-on-steem-blockchain
   * @example
   * // Gives @stoodkev active authority with weight 2 to `account`
   * const keychain = window.hive_keychain
   * keychain.requestAddAccountAuthority(account, 'stoodkev', 'Active', 2, (response) => {
   *   console.log(response);
   * });
   *
   * @param {String} account Hive account to perform the request
   * @param {String} authorizedUsername Authorized account
   * @param {String} role Type of authority. Can be 'Posting','Active' or 'Memo'
   * @param {number} weight Weight of the authority
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestAddAccountAuthority: function (
    account,
    authorizedUsername,
    role,
    weight,
    callback,
    rpc,
  ) {
    var request = {
      type: 'addAccountAuthority',
      username: account,
      authorizedUsername,
      role,
      weight,
      method: 'Active',
      rpc,
    };

    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * Requests to remove an account authority over another account. For more information about multisig, please read https://peakd.com/utopian-io/@stoodkev/how-to-set-up-and-use-multisignature-accounts-on-steem-blockchain
   * @example
   * // Removes @stoodkev's active authority from `account`
   * const keychain = window.hive_keychain;
   * keychain.requestRemoveAccountAuthority(account, 'stoodkev', 'Active', (response) => {
   *   console.log(response);
   * });
   *
   * @param {String} account Hive account to perform the request
   * @param {String} authorizedUsername Account to lose authority
   * @param {String} role Type of authority. Can be 'Posting','Active' or 'Memo'
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestRemoveAccountAuthority: function (
    account,
    authorizedUsername,
    role,
    callback,
    rpc,
  ) {
    var request = {
      type: 'removeAccountAuthority',
      username: account,
      authorizedUsername,
      role,
      method: 'Active',
      rpc,
    };

    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * Requests to add a new key authority to an account. For more information about multisig, please read https://peakd.com/utopian-io/@stoodkev/how-to-set-up-and-use-multisignature-accounts-on-steem-blockchain
   * @example
   * const keychain = window.hive_keychain;
   * keychain.requestAddKeyAuthority(username, publicKey, 'Memo', 1, (response) => {
   *   console.log(response);
   * });
   *
   * @param {String} account Hive account to perform the request
   * @param {String} authorizedKey New public key to be associated with the account
   * @param {String} role Type of authority. Can be 'Posting','Active' or 'Memo'
   * @param {number} weight Weight of the key authority
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestAddKeyAuthority: function (
    account,
    authorizedKey,
    role,
    weight,
    callback,
    rpc,
  ) {
    var request = {
      type: 'addKeyAuthority',
      username: account,
      authorizedKey,
      weight,
      role,
      method: 'Active',
      rpc,
    };

    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * Requests to remove a key to an account. For more information about multisig, please read https://peakd.com/utopian-io/@stoodkev/how-to-set-up-and-use-multisignature-accounts-on-steem-blockchain
   * @example
   * const keychain = window.hive_keychain;
   * keychain.requestRemoveKeyAuthority(username, publicKey, 'Memo', (response) => {
   *   console.log(response);
   * });
   * @param {String} account Hive account to perform the request
   * @param {String} authorizedKey Key to be removed (public key).
   * @param {String} role Type of authority. Can be 'Posting','Active' or 'Memo'.
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestRemoveKeyAuthority: function (
    account,
    authorizedKey,
    role,
    callback,
    rpc,
  ) {
    var request = {
      type: 'removeKeyAuthority',
      username: account,
      authorizedKey,
      role,
      method: 'Active',
      rpc,
    };

    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * Generic broadcast request
   * @example
   * const keychain = window.hive_keychain;
   * keychain.requestBroadcast('npfedwards', [
   *   [
   *     'account_witness_vote',
   *     {
   *       account: 'npfedwards',
   *       witness: 'stoodkev',
   *       approve: true
   *     }
   *   ]
   * ], 'Active', (response) => {
   *   console.log(response);
   * });
   *
   * @param {String} account Hive account to perform the request
   * @param {Array} operations Array of operations to be broadcasted
   * @param {String} key Type of key. Can be 'Posting','Active' or 'Memo'
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestBroadcast: function (account, operations, key, callback, rpc) {
    var request = {
      type: 'broadcast',
      username: account,
      operations,
      method: key,
      rpc,
    };

    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * Requests to sign a transaction with a given authority
   * @example
   * // This example would be done much easier with requestBroadcast
   * import dhive from '@hiveio/dhive';
   *
   * const client = new dhive.Client(['https://api.hive.blog', 'https://anyx.io', 'https://api.openhive.network']);
   * const keychain = window.hive_keychain;
   *
   * const props = await client.database.getDynamicGlobalProperties();
   * const headBlockNumber = props.head_block_number;
   * const headBlockId = props.head_block_id;
   * const expireTime = 600000;
   *
   * const op = {
   *   ref_block_num: headBlockNumber & 0xffff,
   *   ref_block_prefix: Buffer.from(headBlockId, 'hex').readUInt32LE(4),
   *   expiration: new Date(Date.now() + expireTime).toISOString(),
   *   operations: [...] // Add operations here
   * };
   * keychain.requestSignTx(username, op, 'Posting', async (response) => {
   *   if (!response.error) {
   *     console.log(response.result);
   *     await client.database.verifyAuthority(response.result);
   *     await client.broadcast.send(response.result);
   *   }
   * });
   *
   * @param {String} account Hive account to perform the request
   * @param {Object} tx Unsigned transaction
   * @param {String} key Type of key. Can be 'Posting','Active' or 'Memo'
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestSignTx: function (account, tx, key, callback, rpc) {
    var request = {
      type: 'signTx',
      username: account,
      tx,
      method: key,
      rpc,
    };

    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * Requests a signed call
   * @deprecated
   * @param {String} account Hive account to perform the request
   * @param {String} method Method of the call
   * @param {String} params Parameters of the call
   * @param {String} key Type of key. Can be 'Posting','Active' or 'Memo'
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestSignedCall: function (account, method, params, key, callback, rpc) {
    console.warn('requestSignedCall has been deprecated.');
    // var request = {
    //   type: 'signedCall',
    //   username: account,
    //   method,
    //   params,
    //   typeWif: key,
    //   rpc,
    // };
    // this.dispatchCustomEvent('swRequest_hive', request, callback);
  },

  // Example comment_options: {"author":"stoodkev","permlink":"hi","max_accepted_payout":"100000.000 SBD","percent_steem_dollars":10000,"allow_votes":true,"allow_curation_rewards":true,"extensions":[[0,{"beneficiaries":[{"account":"yabapmatt","weight":1000},{"account":"steemplus-pay","weight":500}]}]]}
  /**
   * Requests to broadcast a blog post/comment
   * @example
   * const keychain = window.hive_keychain;
   * keychain.requestPost('stoodkev', 'Hello World!', '## This is a blog post \
   * \
   * And this is some text', 'Blog', null, {format:'markdown',description:'A blog post',tags:['Blog']},'hello-world', {"author":"stoodkev","permlink":"hi","max_accepted_payout":"100000.000 SBD","percent_steem_dollars":10000,"allow_votes":true,"allow_curation_rewards":true,"extensions":[[0,{"beneficiaries":[{"account":"yabapmatt","weight":1000},{"account":"steemplus-pay","weight":500}]}]]}, (response) => {
   *   console.log(response);
   * });
   *
   * @param {String} account Hive account to perform the request
   * @param {String} title Title of the blog post
   * @param {String} body Content of the blog post
   * @param {String} parent_perm Permlink of the parent post. Main tag for a root post
   * @param {String} parent_account Author of the parent post. Pass null for root post
   * @param {Object} json_metadata Parameters of the call
   * @param {String} permlink Permlink of the blog post
   * @param {Object} comment_options Options attached to the blog post. Consult Hive documentation at <https://developers.hive.io/apidefinitions/#broadcast_ops_comment_options> to learn more about it
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestPost: function (
    account,
    title,
    body,
    parent_perm,
    parent_account,
    json_metadata,
    permlink,
    comment_options,
    callback,
    rpc,
  ) {
    var request = {
      type: 'post',
      username: account,
      title,
      body,
      parent_perm,
      parent_username: parent_account,
      json_metadata,
      permlink,
      comment_options,
      rpc,
    };
    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * Requests a vote
   * @example
   * // Upvote with 50% weight
   * const keychain = window.hive_keychain;
   * keychain.requestVote('npfedwards', 'hello-world', 'stoodkev', 5000, (response) => {
   *   console.log(response);
   * });
   * @param {String} account Hive account to perform the request
   * @param {String} permlink Permlink of the blog post
   * @param {String} author Author of the blog post
   * @param {Number} weight Weight of the vote, comprised between -10,000 (-100%) and 10,000 (100%)
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestVote: function (account, permlink, author, weight, callback, rpc) {
    var request = {
      type: 'vote',
      username: account,
      permlink,
      author,
      weight,
      rpc,
    };

    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * Requests a custom JSON broadcast
   * @example
   * const keychain = window.hive_keychain;
   * keychain.requestCustomJson(null, 'sm_market_rent', 'Active', JSON.stringify({items:["9292cd44ccaef8b73a607949cc787f1679ede10b-93"],currency:"DEC",days:1}), 'Rent 1 card on Splinterlands', (response) => {
   *   console.log(response);
   * });
   * @param {String} [account=null] Hive account to perform the request. If null, user can choose the account from a dropdown
   * @param {String} id Type of custom_json to be broadcasted
   * @param {String} key Type of key. Can be 'Posting','Active' or 'Memo'
   * @param {String} json Stringified custom json
   * @param {String} display_msg Message to display to explain to the user what this broadcast is about
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestCustomJson: function (
    account,
    id,
    key,
    json,
    display_msg,
    callback,
    rpc,
  ) {
    var request = {
      type: 'custom',
      username: account,
      id: id, //can be "custom", "follow", "reblog" etc.
      method: key || 'Posting', // Posting key is used by default, active can be specified for id=custom .
      json: json, //content of your json
      display_msg: display_msg,
      rpc,
    };
    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * Requests a transfer
   * @example
   * const keychain = window.hive_keychain;
   * keychain.requestTransfer(username, toUsername, amount.toFixed(3),'','HIVE',(response) => {
   *   console.log(response)
   * }, true);
   *
   * @param {String} account Hive account to perform the request
   * @param {String} to Hive account to receive the transfer
   * @param {String} amount Amount to be transfered. Requires 3 decimals.
   * @param {String} memo The memo will be automatically encrypted if starting by '#' and the memo key is available on Keychain. It will also overrule the account to be enforced, regardless of the 'enforce' parameter
   * @param {String} currency 'HIVE' or 'HBD'
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {boolean} [enforce=false] If set to true, user cannot chose to make the transfer from another account
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestTransfer: function (
    account,
    to,
    amount,
    memo,
    currency,
    callback,
    enforce = false,
    rpc,
  ) {
    var request = {
      type: 'transfer',
      username: account,
      to,
      amount,
      memo,
      enforce,
      currency,
      rpc,
    };
    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * Requests a token transfer
   * @example
   * if (window.hive_keychain) {
   *   const keychain = window.hive_keychain;
   *   keychain.requestSendToken(username, toUsername, amount.toFixed(3), memo, 'DEC', (response) => {
   *     console.log(response);
   *   });
   * } else {
   *   alert('You do not have hive keychain installed');
   * }
   *
   * @param {String} account Hive account to perform the request
   * @param {String} to Hive account to receive the transfer
   * @param {String} amount Amount to be transferred. Requires 3 decimals.
   * @param {String} memo Memo attached to the transfer
   * @param {String} currency Token to be sent
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestSendToken: function (
    account,
    to,
    amount,
    memo,
    currency,
    callback,
    rpc,
  ) {
    var request = {
      type: 'sendToken',
      username: account,
      to,
      amount,
      memo,
      currency,
      rpc,
    };
    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * Requests a delegation broadcast
   * @example
   * if (window.hive_keychain) {
   *   const keychain = window.hive_keychain;
   *   keychain.requestDelegation(null, 'stoodkev', '1.000', 'HP', (response) => {
   *     console.log(response);
   *   });
   * } else {
   *   alert('You do not have hive keychain installed');
   * }
   *
   * @param {String} [username=null] Hive account to perform the request. If null, user can choose the account from a dropdown
   * @param {String} delegatee Account to receive the delegation
   * @param {String} amount Amount to be transfered. Requires 3 decimals for HP, 6 for VESTS.
   * @param {String} unit HP or VESTS
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestDelegation: function (
    username,
    delegatee,
    amount,
    unit,
    callback,
    rpc,
  ) {
    var request = {
      type: 'delegation',
      username,
      delegatee,
      amount,
      unit,
      rpc,
    };
    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * Requests a witness vote broadcast
   * @example
   * // Unvote our witness vote for @stoodkev
   * if (window.hive_keychain) {
   *   const keychain = window.hive_keychain;
   *   keychain.requestWitnessVote(null, 'stoodkev', false, (response) => {
   *     console.log(response);
   *   });
   * } else {
   *   alert('You do not have hive keychain installed');
   * }
   * @param {String} [username=null] Hive account to perform the request. If null, user can choose the account from a dropdown
   * @param {String} witness Account to receive the witness vote
   * @param {boolean} vote Set to true to vote for the witness, false to unvote
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestWitnessVote: function (username, witness, vote, callback, rpc) {
    var request = {
      type: 'witnessVote',
      username,
      witness,
      vote,
      rpc,
    };
    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * Select an account as proxy
   * @example
   * // Let @stoodkev use our voting power in governance votes
   * if (window.hive_keychain) {
   *   const keychain = window.hive_keychain;
   *   keychain.requestProxy(null, 'stoodkev', (response) => {
   *     console.log(response);
   *   });
   * } else {
   *   alert('You do not have hive keychain installed');
   * }
   * @example
   * // Remove voting proxy
   * if (window.hive_keychain) {
   *   const keychain = window.hive_keychain;
   *   keychain.requestProxy(null, '', (response) => {
   *     console.log(response);
   *   });
   * } else {
   *   alert('You do not have hive keychain installed');
   * }
   * @param {String} [username=null] Hive account to perform the request. If null, user can choose the account from a dropdown
   * @param {String} proxy Account to become the proxy. Empty string ('') to remove a proxy
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestProxy: function (username, proxy, callback, rpc) {
    var request = {
      type: 'proxy',
      username,
      proxy,
      rpc,
    };
    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * Request a power up
   * @example
   * // Power up 5 HP
   * if (window.hive_keychain) {
   *   const keychain = window.hive_keychain;
   *   keychain.requestPowerUp(username, username, '5.000', (response) => {
   *     console.log(response);
   *   });
   * } else {
   *   alert('You do not have hive keychain installed');
   * }
   * @param {String} username Hive account to perform the request
   * @param {String} recipient Account to receive the power up
   * @param {String} hive Amount of HIVE to be powered up
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestPowerUp: function (username, recipient, hive, callback, rpc) {
    var request = {
      type: 'powerUp',
      username,
      recipient,
      hive,
      rpc,
    };
    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * Request a power down
   * @example
   * // Power down 5 HP
   * if (window.hive_keychain) {
   *   const keychain = window.hive_keychain;
   *   keychain.requestPowerDown(username, '5.000', (response) => {
   *     console.log(response);
   *   });
   * } else {
   *   alert('You do not have hive keychain installed');
   * }
   * @param {String} username Hive account to perform the request
   * @param {String} hive_power Amount of HIVE to be powered down
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestPowerDown: function (username, hive_power, callback, rpc) {
    var request = {
      type: 'powerDown',
      username,
      hive_power,
      rpc,
    };
    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * Request the creation of an account using claimed tokens
   * @param {String} username Hive account to perform the request
   * @param {String} new_account New account to be created
   * @param {object} owner owner authority object
   * @param {object} active active authority object
   * @param {object} posting posting authority object
   * @param {String} memo public memo key
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestCreateClaimedAccount: function (
    username,
    new_account,
    owner,
    active,
    posting,
    memo,
    callback,
    rpc,
  ) {
    const request = {
      type: 'createClaimedAccount',
      username,
      new_account,
      owner,
      active,
      posting,
      memo,
      rpc,
    };

    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },

  //HF21
  /**
   * Request the creation of a DHF proposal
   * @example
   * if (window.hive_keychain) {
   *   const keychain = window.hive_keychain;
   *   keychain.requestCreateProposal('keychain', 'keychain', 'Hive Keychain development', 'hive-keychain-proposal-dhf-ran717', '10.000', '2022-03-22', '2023-03-21', JSON.stringify([]), (response) => {
   *     console.log(response);
   *   });
   * } else {
   *   alert('You do not have hive keychain installed');
   * }
   * @param {String} username Hive account to perform the request
   * @param {String} receiver Account receiving the funding if the proposal is voted
   * @param {String} subject Title of the DAO
   * @param {String} permlink Permlink to the proposal description
   * @param {String} daily_pay Daily amount to be received by `receiver`
   * @param {String} start Starting date
   * @param {String} end Ending date
   * @param {String} extensions Stringified Array of extensions
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestCreateProposal: function (
    username,
    receiver,
    subject,
    permlink,
    daily_pay,
    start,
    end,
    extensions,
    callback,
    rpc,
  ) {
    const request = {
      type: 'createProposal',
      username,
      receiver,
      subject,
      permlink,
      start,
      end,
      daily_pay,
      extensions,
      rpc,
    };

    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * Request the removal of a DHF proposal
   * @example
   * if (window.hive_keychain) {
   *   const keychain = window.hive_keychain;
   *   keychain.requestRemoveProposal(username, JSON.stringify([216]), JSON.stringify([]), (response) => {
   *     console.log(response);
   *   });
   * } else {
   *   alert('You do not have hive keychain installed');
   * }
   * @param {String} username Hive account to perform the request
   * @param {String} proposal_ids Stringified Array of ids of the proposals to be removed
   * @param {String} extensions Stringified Array of extensions
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestRemoveProposal: function (
    username,
    proposal_ids,
    extensions,
    callback,
    rpc,
  ) {
    const request = {
      type: 'removeProposal',
      username,
      proposal_ids,
      extensions,
      rpc,
    };

    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * Vote/Unvote a DHF proposal
   * @example
   * // Approve a proposal
   * if (window.hive_keychain) {
   *   const keychain = window.hive_keychain;
   *   keychain.requestUpdateProposalVote(username, JSON.stringify([216]), true, JSON.stringify([]), (response) => {
   *     console.log(response);
   *   });
   * } else {
   *   alert('You do not have hive keychain installed');
   * }
   * @example
   * // Unapprove a proposal
   * if (window.hive_keychain) {
   *   const keychain = window.hive_keychain;
   *   keychain.requestUpdateProposalVote(username, JSON.stringify([216]), false, JSON.stringify([]), (response) => {
   *     console.log(response);
   *   });
   * } else {
   *   alert('You do not have hive keychain installed');
   * }
   * @param {String} username Hive account to perform the request
   * @param {String} proposal_ids Stringified Array of Ids of the proposals to be voted
   * @param {boolean} approve Set to true to support the proposal, false to remove a vote
   * @param {String} extensions Stringified Array of extensions
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestUpdateProposalVote: function (
    username,
    proposal_ids,
    approve,
    extensions,
    callback,
    rpc,
  ) {
    const request = {
      type: 'updateProposalVote',
      username,
      proposal_ids,
      approve,
      extensions,
      rpc,
    };

    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * Add a new account to Keychain
   * @example
   * if (window.hive_keychain) {
   *   const postingKey = '...';
   *   const keychain = window.hive_keychain;
   *   keychain.requestConversion(username, {
   *     posting: postingKey
   *   }, (response) => {
   *     console.log(response);
   *   });
   * } else {
   *   alert('You do not have hive keychain installed');
   * }
   * @param {String} username username of the account to be added
   * @param {Object} keys private keys of the account : {active:'...',posting:'...',memo:'...'}. At least one must be specified. Alternatively, authorized accounts can be specified with @${username}.
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   */
  requestAddAccount: function (username, keys, callback) {
    const request = {
      type: 'addAccount',
      username,
      keys,
    };

    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * Request currency conversion
   * @example
   * // Convert 5 HIVE to HBD
   * if (window.hive_keychain) {
   *   const keychain = window.hive_keychain;
   *   keychain.requestConversion(username, '5.000', true, (response) => {
   *     console.log(response);
   *   });
   * } else {
   *   alert('You do not have hive keychain installed');
   * }
   *
   * @param {String} username Hive account to perform the request
   * @param {String} amount amount to be converted.
   * @param {Boolean} collaterized true to convert HIVE to HBD. false to convert HBD to HIVE.
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestConversion: function (username, amount, collaterized, callback, rpc) {
    const request = {
      type: 'convert',
      username,
      amount,
      collaterized,
      rpc,
    };

    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  /**
   * Request recurrent transfer
   * @example
   * // Let's send @stoodkev 5 HIVE a day
   * if (window.hive_keychain) {
   *   const keychain = window.hive_keychain;
   *   keychain.requestConversion(null, 'stoodkev', '5.000', 'HIVE', memo, 24, 7, (response) => {
   *     console.log(response);
   *   });
   * } else {
   *   alert('You do not have hive keychain installed');
   * }
   * @param {String} [username=null] Hive account to perform the request
   * @param {String} to Hive account receiving the transfers.
   * @param {String} amount amount to be sent on each execution.
   * @param {String} currency HIVE or HBD on mainnet.
   * @param {String} memo transfer memo
   * @param {Number} recurrence How often will the payment be triggered (in hours) - minimum 24.
   * @param {Number} executions The times the recurrent payment will be executed - minimum 2.
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestRecurrentTransfer: function (
    username,
    to,
    amount,
    currency,
    memo,
    recurrence,
    executions,
    callback,
    rpc,
  ) {
    const request = {
      type: 'recurrentTransfer',
      username,
      to,
      amount,
      currency,
      memo,
      recurrence,
      executions,
      rpc,
    };

    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },

  /**
   * Request swap
   * @example
   * // Let's swap 5 HIVE to DEC
   * // Estimated steps can be obtained via KeychainSDK.swaps.getEstimation()
   *
   * if (window.hive_keychain) {
   *   const keychain = window.hive_keychain;
   *   keychain.requestSwap('keychain', 'HIVE', 'DEC', 5, 1, estimatedSteps, (response) => {
   *     console.log(response);
   *   });
   * } else {
   *   alert('You do not have hive keychain installed');
   * }
   * @param {String} [username=null] Hive account to perform the request
   * @param {String} startToken Incoming token
   * @param {String} endToken Outgoing token
   * @param {number} amount Amount of tokens to be swapped
   * @param {number} slippage Max slippage
   * @param {Object} steps Steps returned by KeychainSDK.swaps.getEstimation(), of type IStep[]
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
   * @param {string} [partnerUsername=null] Partner Hive account hosting the widget
   * @param {number} [partnerFee=null] Fee received when executing & hosting a Keychain Swap. 0 - 1%
  
   */
  requestSwap: function (
    username,
    startToken,
    endToken,
    amount,
    slippage,
    steps,
    callback,
    rpc,
    partnerUsername,
    partnerFee,
  ) {
    const request = {
      type: 'swap',
      username,
      startToken,
      endToken,
      amount,
      slippage,
      steps,
      partnerUsername,
      partnerFee,
      rpc,
    };

    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },

  /**
   * Request a VSC contract call
   * @example
   * // Let's make a test call to a VSC contract
   *
   * if (window.hive_keychain) {
   *   const keychain = window.hive_keychain;
   *   keychain.requestVscCallContract('keychain',
   *    'vs41q9c3ygynfp6kl86qnlaswuwvam748s5lvugns5schg4hte5vhusnx7sg5u8falrt',
   *    'testJSON', {
   *      hello: "World",
   *    },'Posting', (response) => {
   *     console.log(response);
   *   });
   * } else {
   *   alert('You do not have hive keychain installed');
   * }
   * @param {String} [username=null] Hive account to perform the request
   * @param {String} contractId Smart contract ID
   * @param {String} action Contract action
   * @param {Object} payload Contract payload
   * @param {String} method Type of key. Can be 'Posting' or 'Active'
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [rpc=null] Override user's RPC settings
  
   */
  requestVscCallContract: function (
    username,
    contractId,
    action,
    payload,
    method,
    callback,
    rpc,
  ) {
    const request = {
      type: 'vscCallContract',
      username,
      contractId,
      action,
      payload,
      method,
      rpc,
    };

    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },

  /**
   * Requests a VSC Deposit
   * @example
   * const keychain = window.hive_keychain;
   * keychain.requestVscDeposit(username, amount.toFixed(3),'HIVE',(response) => {
   *   console.log(response)
   * });
   *
   * @param {String} from Hive account to perform the request
   * @param {String} amount Amount to be transfered. Requires 3 decimals.
   * @param {String} currency 'HIVE' or 'HBD'
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [to=null] Hive or EVM Address
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestVscDeposit: function (from, amount, currency, callback, to, rpc) {
    var request = {
      type: 'vscDeposit',
      username: from,
      to,
      amount,
      currency,
      rpc,
    };
    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },

  /**
   * Requests a VSC Withdrawal
   * @example
   * const keychain = window.hive_keychain;
   * keychain.requestVscWithdrawal(username,username, amount.toFixed(3),'HIVE','withdrawing...',(response) => {
   *   console.log(response)
   * });
   *
   * @param {String} from Hive account to perform the request
   * @param {String} to Hive Address
   * @param {String} amount Amount to be transfered. Requires 3 decimals.
   * @param {String} currency 'HIVE' or 'HBD'
   * @param {String} memo Withdrawal memo
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [netId=vsc-mainnet] Override user's VSC net
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestVscWithdrawal: function (
    from,
    to,
    amount,
    currency,
    memo,
    callback,
    netId,
    rpc,
  ) {
    var request = {
      type: 'vscWithdrawal',
      username: from,
      to,
      amount,
      currency,
      memo,
      netId,
      rpc,
    };
    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },

  /**
   * Requests a VSC Transfer
   * @example
   * const keychain = window.hive_keychain;
   * keychain.requestVscTransfer(username,username2, amount.toFixed(3),'HIVE','hi!',(response) => {
   *   console.log(response)
   * });
   *
   * @param {String} from Hive account to perform the request
   * @param {String} to Hive Address
   * @param {String} amount Amount to be transfered. Requires 3 decimals.
   * @param {String} currency 'HIVE' or 'HBD'
   * @param {String} memo Transfer memo
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [netId=vsc-mainnet] Override user's VSC net
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestVscTransfer: function (
    from,
    to,
    amount,
    currency,
    memo,
    callback,
    netId,
    rpc,
  ) {
    var request = {
      type: 'vscTransfer',
      username: from,
      to,
      amount,
      currency,
      memo,
      netId,
      rpc,
    };
    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },

  /**
   * Requests a VSC Staking / Unstaking operation
   * @example
   * const keychain = window.hive_keychain;
   * keychain.requestVscStaking(username,username2, amount.toFixed(3),'HIVE','hi!',(response) => {
   *   console.log(response)
   * });
   *
   * @param {String} from Hive account to perform the request
   * @param {String} to Hive Address
   * @param {String} amount Amount to be transfered. Requires 3 decimals.
   * @param {String} currency Only accepts 'HBD' for the moment
   * @param {String} operation 'STAKING' or 'UNSTAKING'
   * @param {requestCallback} callback Function that handles Keychain's response to the request
   * @param {String} [netId=vsc-mainnet] Override user's VSC net
   * @param {String} [rpc=null] Override user's RPC settings
   */
  requestVscStaking: function (
    from,
    to,
    amount,
    currency,
    operation,
    callback,
    netId,
    rpc,
  ) {
    var request = {
      type: 'vscStaking',
      username: from,
      to,
      amount,
      currency,
      operation,
      netId,
      rpc,
    };
    this.dispatchCustomEvent('swRequest_hive', request, callback);
  },
  // Send the customEvent
  dispatchCustomEvent: function (name, data, callback) {
    this.requests[this.current_id] = callback;
    data = Object.assign(
      {
        request_id: this.current_id,
      },
      data,
    );
    document.dispatchEvent(
      new CustomEvent(name, {
        detail: data,
      }),
    );
    this.current_id++;
  },
};

window.addEventListener(
  'message',
  function (event) {
    // We only accept messages from ourselves
    if (event.source != window) return;

    if (event.data.type && event.data.type == 'hive_keychain_response') {
      const response = event.data.response;
      if (response && response.request_id) {
        if (hive_keychain.requests[response.request_id]) {
          hive_keychain.requests[response.request_id](response);
          delete hive_keychain.requests[response.request_id];
        }
      }
    } else if (
      event.data.type &&
      event.data.type == 'hive_keychain_handshake'
    ) {
      if (hive_keychain.handshake_callback) {
        hive_keychain.handshake_callback();
      }
    }
  },
  false,
);
