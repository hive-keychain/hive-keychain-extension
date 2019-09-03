/**
 *
 * @type {{requestTransfer: keychainify.requestTransfer, initBackground: keychainify.initBackground, isKeychainifyEnabled: (function(): Promise), getVarsFromURL: (function(*)), requestWitnessVote: keychainify.requestWitnessVote, keychainifyUrl: keychainify.keychainifyUrl, requestDelegation: keychainify.requestDelegation, dispatchRequest: keychainify.dispatchRequest}}
 */
const keychainify = {
  /**
   * Checks local storage for whether the feature has been disabled by the user
   * @returns {Promise}
   */
  isKeychainifyEnabled: function () {
    return new Promise(function(resolve, reject) {
      try {
        chrome.storage.local.get(['keychainify_enabled'], function(items) {
          const featureStatus = items.hasOwnProperty('keychainify_enabled') && items.keychainify_enabled;
          resolve(featureStatus);
        });
      } catch(err) {
        reject(err);
      }
    });
  },

  isUrlSupported: function(url) {
    return url.includes('steemconnect.com/sign/transfer')
  },

  /**
   * Transform a known URL to a Keychain operation
   * @param tab
   */
  keychainifyUrl: function (tab) {
    let url;
    if (typeof tab === 'string') {
      url = tab;
      tab = null;
    } else {
      url = tab.url;
    }

    const vars = keychainify.getVarsFromURL(url);
    let payload = {},
      defaults = {};

    switch(true) {
      /**
       * Transfer fund
       */
      case (url.includes('steemconnect.com/sign/transfer')):
        defaults = {
          from: null,
          to: null,
          amount: 0,
          memo: '',
          currency: 'STEEM'
        };

        payload = Object.assign(defaults, vars);

        [payload.amount, payload.currency] = vars.amount.split(' ');
        keychainify.requestTransfer(tab, payload.from, payload.to, payload.amount, payload.memo, payload.currency);
        break;

      /**
       * Delegate Steem Power
       */
      case (url.includes('steemconnect.com/sign/delegate-vesting-shares')):
        // @TODO currently Steem Keychain does not allow null delegator account. Awaiting https://github.com/MattyIce/steem-keychain/issues/101 to continue
        //let [amount, unit] = vars.vesting_shares.split(' ');
        //keychainify.requestDelegation(null, vars.delegatee, amount, unit, null);
        window.location.href = url;
        break;

      case (url.includes('steemconnect.com/sign/account-witness-vote')):
        // @TODO currently Steem Keychain does not allow null voter account. Awaiting https://github.com/MattyIce/steem-keychain/issues/101 to continue
        //keychainify.requestWitnessVote(null, vars.witness, vars.approve);
        window.location.href = url;
        break;
    }
  },

  /**
   * Dispatch a Keychain operation
   * @param tab
   * @param request
   */
  dispatchRequest: function(tab, request) {
    const now = new Date().getTime();

    if (tab) {
      chromeMessageHandler(
        {
          command: "sendRequest",
          request: request,
          domain: window.location.hostname,
          request_id: now
        },
        {
          tab: tab
        }
      );
    } else {
      chrome.runtime.sendMessage({
        command: "sendRequest",
        request: request,
        domain: window.location.hostname,
        request_id: now
      });
    }
  },

  /**
   * Requesting a Keychain transfer operation
   * @param tab
   * @param account
   * @param to
   * @param amount
   * @param memo
   * @param currency
   * @param enforce
   */
  requestTransfer: function(tab, account, to, amount, memo, currency, enforce = false) {
    const request = {
      type: "transfer",
      username: account,
      to: to,
      amount: amount,
      memo: memo,
      enforce: enforce,
      currency: currency
    };

    keychainify.dispatchRequest(tab, request);
  },

  /**
   * Requesting a Keychain witness vote operation
   * @param tab
   * @param username
   * @param witness
   * @param vote
   */
  requestWitnessVote: function(tab, username, witness, vote) {
    var request = {
      type: "witnessVote",
      username: username,
      witness: witness,
      vote: vote
    };
    keychainify.dispatchRequest(tab, equest);
  },

  /**
   * Requesting a Keychain delegation operation
   * @param tab
   * @param username
   * @param delegatee
   * @param amount
   * @param unit
   */
  requestDelegation: function(tab, username, delegatee, amount, unit) {
    const request = {
      type: "delegation",
      username: username,
      delegatee: delegatee,
      amount: amount,
      unit: unit
    };

    keychainify.dispatchRequest(tab, request);
  },

  /**
   * Parsing the query string
   * @param url
   */
  getVarsFromURL: function(url) {
    const argsParsed = {};

    if (url.indexOf('?') !== -1) {
      const query = url.split('?').pop();
      const args = query.split('&');
      let arg, kvp, key, value;

      for (let i=0; i<args.length; i++) {
        arg = args[i];
        if (arg.indexOf('=') === -1) {
          argsParsed[decodeURIComponent(arg)] = true;
        } else {
          kvp = arg.split('=');
          key = decodeURIComponent(kvp[0]);
          value = decodeURIComponent(kvp[1]);
          argsParsed[key] = value;
        }
      }
    }

    return argsParsed;
  }
};