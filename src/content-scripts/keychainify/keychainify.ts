import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import Logger from 'src/utils/logger.utils';

/**
 *
 * @type {{requestTransfer: keychainify.requestTransfer, initBackground: keychainify.initBackground, isKeychainifyEnabled: (function(): Promise), getVarsFromURL: (function(*)), requestWitnessVote: keychainify.requestWitnessVote, keychainifyUrl: keychainify.keychainifyUrl, requestDelegation: keychainify.requestDelegation,requestProxy: keychainify.requestProxy, dispatchRequest: keychainify.dispatchRequest}}
 */
export default {
  /**
   * Checks local storage for whether the feature has been disabled by the user
   * @returns {Promise}
   */
  isKeychainifyEnabled: function () {
    return new Promise(function (resolve, reject) {
      try {
        chrome.storage.local.get(['keychainify_enabled'], function (items) {
          const featureStatus =
            items.hasOwnProperty('keychainify_enabled') &&
            items.keychainify_enabled;

          resolve(featureStatus);
        });
      } catch (err) {
        Logger.error("Can't get Keychainfy params");
        reject(err);
      }
    });
  },

  isUrlSupported: function (url: string) {
    return (
      url.includes('hivesigner.com/sign/transfer') ||
      url.includes('hivesigner.com/sign/account-witness-vote') ||
      url.includes('hivesigner.com/sign/delegate-vesting-shares') ||
      url.includes('hivesigner.com/sign/account-witness-proxy')
    );
  },

  /**
   * Transform a known URL to a Keychain operation
   * @param tab
   */
  keychainifyUrl: function (tab: any) {
    let url;
    if (typeof tab === 'string') {
      url = tab;
      tab = null;
    } else {
      url = tab.url;
    }
    const vars: any = this.getVarsFromURL(url);
    let payload: any = {},
      defaults = {};

    switch (true) {
      /**
       * Transfer fund
       */
      case url.includes('hivesigner.com/sign/transfer'):
        defaults = {
          from: null,
          to: null,
          amount: 0,
          memo: '',
          currency: 'HIVE',
        };

        payload = Object.assign(defaults, vars);

        [payload.amount, payload.currency] = vars.amount.split(' ');
        this.requestTransfer(
          tab,
          payload.from,
          payload.to,
          payload.amount,
          payload.memo,
          payload.currency,
          payload.redirect_uri,
        );
        break;

      /**
       * Delegate Hive Power
       */
      case url.includes('hivesigner.com/sign/delegate-vesting-shares') ||
        url.includes('hivesigner.com/sign/delegate_vesting_shares'):
        defaults = {
          delegator: null,
          delegatee: null,
          amount: 0,
          unit: 'HP',
        };

        payload = Object.assign(defaults, vars);

        let [amount, unit] = vars.vesting_shares.split(' ');
        this.requestDelegation(
          tab,
          vars.delegator,
          vars.delegatee,
          amount,
          unit,
        );
        break;

      case url.includes('hivesigner.com/sign/account-witness-vote') ||
        url.includes('hivesigner.com/sign/account_witness_vote'):
        defaults = {
          account: null,
          witness: null,
          approve: '1',
        };
        vars.approve = ['false', '0'].includes(vars.approve) ? '0' : '1';
        vars.approve as string;
        payload = Object.assign(defaults, vars);
        this.requestWitnessVote(
          tab,
          payload.account,
          payload.witness,
          parseInt(payload.approve),
        );
        break;
      case url.includes('https://hivesigner.com/sign/account-witness-proxy') ||
        url.includes('https://hivesigner.com/sign/account_witness_proxy'):
        defaults = {
          account: null,
          proxy: '',
        };

        payload = Object.assign(defaults, vars);

        this.requestProxy(tab, payload.account, payload.proxy);
        break;
      case url.includes('https://hivesigner.com/sign/custom-json') ||
        url.includes('https://hivesigner.com/sign/custom_json'):
        defaults = {
          required_auths: null,
          required_posting_auths: null,
          id: null,
          json: null,
        };

        payload = Object.assign(defaults, vars);

        this.requestCustomJSON(
          tab,
          payload.required_posting_auths,
          payload.required_auths,
          payload.authority,
          payload.id,
          payload.json,
          payload.display_msg,
          payload.redirect_uri,
        );
        break;
    }
  },

  /**
   * Dispatch a Keychain operation
   * @param tab
   * @param request
   */
  dispatchRequest: function (tab: any, request: any) {
    const now = new Date().getTime();

    chrome.runtime.sendMessage({
      command: BackgroundCommand.SEND_REQUEST,
      request: request,
      domain: window.location.hostname,
      request_id: now,
    });
  },

  /**
   * Requesting a Keychain transfer operation
   * @param tab
   * @param account
   * @param to
   * @param amount
   * @param memo
   * @param currency
   * @param redirect_uri
   * @param enforce
   */
  requestTransfer: function (
    tab: any,
    account: string,
    to: string,
    amount: string,
    memo: string,
    currency: string,
    redirect_uri: string,
    enforce = false,
  ) {
    const request = {
      type: 'transfer',
      username: account,
      to: to,
      amount: amount,
      memo: memo,
      enforce: enforce,
      currency: currency,
      redirect_uri,
    };

    if (to && amount && currency) {
      this.dispatchRequest(tab, request);
    } else {
      console.error('[keychainify] Missing parameters for transfers');
    }
  },

  /**
   * Requesting a Keychain witness vote operation
   * @param tab
   * @param username
   * @param witness
   * @param vote
   */
  requestWitnessVote: function (
    tab: any,
    username: string,
    witness: string,
    vote: number,
  ) {
    var request = {
      type: 'witnessVote',
      username: username,
      witness: witness,
      vote: vote,
    };

    if (witness && vote !== undefined) {
      this.dispatchRequest(tab, request);
    } else {
      console.error('[keychainify] Missing parameters for witness vote');
    }
  },

  /**
   * Requesting a Keychain proxy operation
   * @param tab
   * @param username
   * @param proxy
   */
  requestProxy: function (tab: any, username: string, proxy: string) {
    var request = {
      type: 'proxy',
      username,
      proxy,
    };

    this.dispatchRequest(tab, request);
  },

  /**
   * Requesting a Keychain delegation operation
   * @param tab
   * @param username
   * @param delegatee
   * @param amount
   * @param unit
   */
  requestDelegation: function (
    tab: any,
    username: string,
    delegatee: string,
    amount: string,
    unit: string,
  ) {
    type Request = {
      type: 'delegation';
      delegatee: string;
      amount: string;
      unit: string;
      username?: string;
    };
    const request: Request = {
      type: 'delegation',
      delegatee,
      amount,
      unit,
      username: undefined,
    };
    if (username) request.username = username;
    if (delegatee && amount && unit) {
      this.dispatchRequest(tab, request);
    } else {
      console.error('[keychainify] Missing parameters for delegation');
    }
  },
  /**
   * Requesting a Keychain custom_json
   * @param required_posting_auths
   * @param required_auths
   * @param id
   * @param json
   * @param display_msg
   * @param redirect_uri
   */
  requestCustomJSON: function (
    tab: any,
    required_posting_auths: any,
    required_auths: any,
    authority: string,
    id: string,
    json: string,
    display_msg: string,
    redirect_uri: string,
  ) {
    let username = null;
    if (!['[]', '["__signer"]'].includes(required_posting_auths))
      username = required_posting_auths;
    if (!['[]', '["__signer"]'].includes(required_auths))
      username = required_auths;
    var request = {
      type: 'custom',
      username,
      id,
      method: authority,
      json,
      display_msg,
      redirect_uri,
    };

    this.dispatchRequest(tab, request);
  },
  /**
   * Parsing the query string
   * @param url
   */
  getVarsFromURL: function (url: string) {
    const argsParsed: { [foo: string]: boolean | string } = {};

    if (url.indexOf('?') !== -1) {
      const query = url.split('?').pop()!;
      const args = query.split('&');
      let arg, kvp, key, value;

      for (let i = 0; i < args.length; i++) {
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
};
