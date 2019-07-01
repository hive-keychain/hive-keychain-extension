
let contentScript = {
  init: function () {
    contentScript.process.checkAnchors();
  },

  /**
   * This contains the logic for actually processing the content on the page
   */
  process: {
    initialized: false,
    observer: null,
    observerConfig: {
      attributes: false,
      childList: true,
      subtree: true,
      characterData: false
    },
    observerTimer: null,

    /**
     * Initializing the MutationObserver to support pages with lazy-loading.
     * Dynamically reacts to page change instead of regular polling.
     */
    initObserver: function () {
      let body = document.body;

      // Using a MutationObserver to wait for a DOM change
      // This is to scan dynamically loaded content (lazyload of comments for example)
      contentScript.process.observer = new MutationObserver(function (process) {
        return function (mutations) {
          mutations.forEach(function (mutation) {
            // Preventing multipl calls to checkAnchors()
            if (process.observerTimer) {
              window.clearTimeout(process.observerTimer);
            }

            // Lets wait for a DOM change
            process.observerTimer = window.setTimeout(function () {
              process.checkAnchors();
            }, 500);
          });
        };
      }(contentScript.process));

      // Waiting for the DOM to be modified (lazy loading)
      contentScript.process.observer.observe(body, contentScript.process.observerConfig);
    },

    /**
     * Verify all anchors to find scammy links
     */
    checkAnchors: function () {
      let anchors = document.querySelectorAll('a[href]:not(.steem-keychain-checked)');

      for (let i = 0; i < anchors.length; i++) {
        let anchor = anchors[i];

        if (
          anchor.href
          && anchor.href.indexOf('steemconnect.com') !== -1
          && !anchor.classList.contains('steem-keychain-checked')  // That was not checked before
        ) {
          anchor.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();

            if (await contentScript.process.isKeychainifyEnabled()) {
              contentScript.process.convertSteemConnectUrl(this.href);
            } else {
              window.location.href = this.href;
            }
          });
        }

        anchor.classList.add("steem-keychain-checked");
      }
    },

    getVarsFromURl: function (url) {
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
    },

    convertSteemConnectUrl: function(url) {
      const vars = contentScript.process.getVarsFromURl(url);
      let payload = {},
        defaults = {};

      switch(true) {
        /**
         * Transfer fund
         */
        case (url.indexOf('steemconnect.com/sign/transfer') !== -1):
          defaults = {
            from: null,
            to: null,
            amount: 0,
            memo: '',
            currency: 'STEEM'
          };

          payload = Object.assign(defaults, vars);

          [payload.amount, payload.currency] = vars.amount.split(' ');
          contentScript.process.requestTransfer(payload.from, payload.to, payload.amount, payload.memo, payload.currency);
          break;

        /**
         * Delegate Steem Power
         */
        case (url.indexOf('steemconnect.com/sign/delegate-vesting-shares') !== -1):
          // @TODO currently Steem Keychain does not allow null delegator account. Awaiting https://github.com/MattyIce/steem-keychain/issues/101 to continue
          //let [amount, unit] = vars.vesting_shares.split(' ');
          //contentScript.process.requestDelegation(null, vars.delegatee, amount, unit, null);
          window.location.href = url;
          break;

        case (url.indexOf('steemconnect.com/sign/account-witness-vote') !== -1):
          // @TODO currently Steem Keychain does not allow null voter account. Awaiting https://github.com/MattyIce/steem-keychain/issues/101 to continue
          //contentScript.process.requestWitnessVote(null, vars.witness, vars.approve);
          window.location.href = url;
          break;
      }
    },

    requestWitnessVote: function(username, witness, vote) {
      var request = {
        type: "witnessVote",
        username: username,
        witness: witness,
        vote: vote
      };
      contentScript.process.dispatchRequest(request);
    },

    requestDelegation: function(username, delegatee, amount, unit) {
      const request = {
        type: "delegation",
        username: username,
        delegatee: delegatee,
        amount: amount,
        unit: unit
      };

      contentScript.process.dispatchRequest(request);
    },

    requestTransfer: function(account, to, amount, memo, currency, enforce = false) {
      const request = {
        type: "transfer",
        username: account,
        to: to,
        amount: amount,
        memo: memo,
        enforce: enforce,
        currency: currency
      };

      contentScript.process.dispatchRequest(request);
    },

    dispatchRequest: function(request) {
      const now = new Date().getTime();

      chrome.runtime.sendMessage({
        command: "sendRequest",
        request: request,
        domain: window.location.hostname,
        request_id: now
      });
    },

    isKeychainifyEnabled: function() {
      return new Promise(function(resolve, reject) {
        try {
          chrome.storage.local.get(['steemconnect_keychainify'], function(items) {
            resolve(!items.hasOwnProperty('steemconnect_keychainify') || items.steemconnect_keychainify)
          });
        } catch(err) {
          reject(err);
        }
      });
    },

    /**
     * Initialize the scanning process
     */
    init: function () {
      contentScript.process.initObserver();
      contentScript.process.checkAnchors();
    }
  }
};

contentScript.init();