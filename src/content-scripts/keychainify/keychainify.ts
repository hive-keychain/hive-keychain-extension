/* istanbul ignore file */
import {
  KeychainKeyTypes,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import * as HiveUri from 'hive-uri';
import { HiveUriTransaction } from 'src/content-scripts/keychainify/hive-uri.types';
import Logger from 'src/utils/logger.utils';

if (window.chrome) {
  //@ts-ignore
  window.chrome.storage.session = undefined;
}

/**
 *
 * @type {{requestTransfer: keychainify.requestTransfer, initBackground: keychainify.initBackground, isKeychainifyEnabled: (function(): Promise<boolean>), getVarsFromURL: (function(*)), requestWitnessVote: keychainify.requestWitnessVote, keychainifyUrl: keychainify.keychainifyUrl, requestDelegation: keychainify.requestDelegation,requestProxy: keychainify.requestProxy, dispatchRequest: keychainify.dispatchRequest}}
 */
export default {
  /**
   * Checks local storage for whether the feature has been disabled by the user
   * @returns {Promise}
   */
  isKeychainifyEnabled: function (): Promise<boolean> {
    return new Promise(function (resolve, reject) {
      try {
        chrome.storage.local.get(['keychainify_enabled'], function (items) {
          const featureStatus = (items.hasOwnProperty('keychainify_enabled') &&
            items.keychainify_enabled) as boolean;

          resolve(featureStatus);
        });
      } catch (err) {
        Logger.error("Can't get Keychainfy params");
        reject(err);
      }
    });
  },

  isSupportedHiveSignerUrl: function (url: string) {
    return (
      url.includes('hivesigner.com/sign/transfer') ||
      url.includes('hivesigner.com/sign/account-witness-vote') ||
      url.includes('hivesigner.com/sign/delegate-vesting-shares') ||
      url.includes('hivesigner.com/sign/custom-json') ||
      url.includes('hivesigner.com/sign/account-witness-proxy')
      //
    );
  },
  isSupportedHiveUri: function (uri: string) {
    return uri.startsWith('hive://');
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
       * Parse all operations from a valid hive-uri
       */
      case url.includes('hive://'):
        this.parseHiveUri(url, tab);
        break;
      /**
       * Transfer fund
       * i.e. : https://hivesigner.com/sign/transfer?to=lecaillon&amount=1%20HIVE
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
       * i.e. : https://hivesigner.com/sign/delegate-vesting-shares?delegatee=keychain&vesting_shares=100%20HP
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
      /**
       * Vote for witness
       * i.e. : https://hivesigner.com/sign/account-witness-vote?witness=stoodkev&approve=1
       */
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
      /**
       * Chose a proxy
       * i.e. : https://hivesigner.com/sign/account-witness-proxy?proxy=stoodkev
       */
      case url.includes('https://hivesigner.com/sign/account-witness-proxy') ||
        url.includes('https://hivesigner.com/sign/account_witness_proxy'):
        defaults = {
          account: null,
          proxy: '',
        };

        payload = Object.assign(defaults, vars);

        this.requestProxy(tab, payload.account, payload.proxy);
        break;
      /**
       * Broadcast a custom-json
       * i.e. : https://hivesigner.com/sign/custom-json?required_posting_auths=%5Bstoodkev%5D&id=custom&json=%7B%22hive%22%3A%22keychain%22%7D
       */
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
          payload.id,
          payload.json,
          payload.display_msg,
          payload.redirect_uri,
        );
        break;
    }
  },

  /**
   * Parse and process all the operations in the URI
   *
   * @param uri
   * @param tab
   * @param account optional for anonymous op
   */
  parseHiveUri(uri: string, tab: any, account: string = '') {
    const hiveUriTx = HiveUri.decode(uri) as HiveUriTransaction;
    const { operations } = hiveUriTx.tx;
    operations.forEach(([type, data]) => {
      switch (type) {
        /**
         * Transfer fund
         * i.e. : hive://sign/op/WyJ0cmFuc2ZlciIseyJ0byI6ImhyZGNyLWhpdmUiLCJhbW91bnQiOiIwLjAwMSBISVZFIiwibWVtbyI6InRlc3QifV0.
         */
        case 'transfer':
          const [transferAmount, transferCurrency] = data.amount.split(' ');
          this.requestTransfer(
            tab,
            account,
            data.to,
            transferAmount,
            data.memo,
            transferCurrency,
            '',
            false,
          );
          break;

        /**
         * Delegate Hive Power
         * i.e. : hive://sign/op/WyJkZWxlZ2F0ZV92ZXN0aW5nX3NoYXJlcyIseyJkZWxlZ2F0ZWUiOiJocmRjci1oaXZlIiwidmVzdGluZ19zaGFyZXMiOiIwLjAwMSBIUCJ9XQ..
         */
        case 'delegate_vesting_shares':
          this.requestDelegation(
            tab,
            account,
            data.delegatee,
            data.vesting_shares,
            'HP',
          );
          break;

        /**
         * Vote for witness
         * i.e. : hive://sign/op/WyJhY2NvdW50X3dpdG5lc3Nfdm90ZSIseyJ3aXRuZXNzIjoic3Rvb2RrZXYiLCJhcHByb3ZlIjp0cnVlfV0.
         */
        case 'account_witness_vote':
          this.requestWitnessVote(
            tab,
            account,
            data.witness,
            data.approve ? 1 : 0,
          );
          break;

        /**
         * Chose a proxy
         * i.e. : hive://sign/op/WyJhY2NvdW50X3dpdG5lc3NfcHJveHkiLHsicHJveHkiOiJwYW1wYW1wb21wb20ifV0.
         */
        case 'account_witness_proxy':
          this.requestProxy(tab, account, data.proxy);
          break;

        /**
         * Update proposal
         * i.e. : hive://sign/op/WyJ1cGRhdGVfcHJvcG9zYWxfdm90ZXMiLHsicHJvcG9zYWxfaWRzIjpbMF0sImFwcHJvdmUiOnRydWUsImV4dGVuc2lvbnMiOltdfV0.
         */
        case 'update_proposal_votes':
          this.requestProposalVotes(
            tab,
            account,
            data.proposal_ids,
            data.approve,
          );
          break;

        /**
         * Recurrent fund transfer
         * i.e. : hive://sign/op/WyJyZWN1cnJlbnRfdHJhbnNmZXIiLHsidG8iOiJzdG9vZGtldiIsImFtb3VudCI6IjAuMDAxIEhJVkUiLCJtZW1vIjoiIiwicmVjdXJyZW5jZSI6MjQsImV4ZWN1dGlvbnMiOjIsImV4dGVuc2lvbnMiOltdfV0.
         */
        case 'recurrent_transfer':
          const [recurrentTxAmount, recurrentTxCurrency] =
            data.amount.split(' ');

          this.requestRecurrentTransfer(
            tab,
            account,
            data.to,
            recurrentTxAmount,
            recurrentTxCurrency,
            data.memo,
            data.recurrence,
            data.executions,
          );
          break;
        default:
          Logger.error(`Unsupported operation: ${type}`);
      }
    });
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
      type: KeychainRequestTypes.transfer,
      username: account,
      to: to,
      amount: (+amount).toFixed(3),
      memo: memo,
      enforce: enforce,
      currency: currency,
      redirect_uri,
    };

    if (to && amount && currency) {
      this.dispatchRequest(tab, request);
    } else {
      Logger.error('[keychainify] Missing parameters for transfers');
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
      type: KeychainRequestTypes.witnessVote,
      username: username,
      witness: witness,
      vote: vote,
    };

    if (witness && vote !== undefined) {
      this.dispatchRequest(tab, request);
    } else {
      Logger.error('[keychainify] Missing parameters for witness vote');
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
      type: KeychainRequestTypes.proxy,
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
      type: KeychainRequestTypes.delegation;
      delegatee: string;
      amount: string;
      unit: string;
      username?: string;
    };
    const request: Request = {
      type: KeychainRequestTypes.delegation,
      delegatee,
      amount,
      unit,
      username: undefined,
    };
    if (username) request.username = username;
    if (delegatee && amount && unit) {
      this.dispatchRequest(tab, request);
    } else {
      Logger.error('[keychainify] Missing parameters for delegation');
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
    id: string,
    json: string,
    display_msg: string,
    redirect_uri: string,
  ) {
    let username,
      authority = null;
    if (!['[]', '["__signer"]'].includes(required_posting_auths)) {
      username = required_posting_auths;
      authority = KeychainKeyTypes.posting;
    }
    if (!['[]', '["__signer"]'].includes(required_auths)) {
      username = required_auths;
      authority = KeychainKeyTypes.posting;
    }
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
   * Requesting a Keychain update_proposal_votes
   * @param tab
   * @param username
   * @param proposal_ids
   * @param approve
   */
  requestProposalVotes(
    tab: any,
    username: string,
    proposal_ids: number[],
    approve: boolean,
  ) {
    const request = {
      type: KeychainRequestTypes.updateProposalVote,
      username,
      proposal_ids,
      approve,
    };
    this.dispatchRequest(tab, request);
  },

  /**
   * Requesting a Keychain recurrent_transfer
   * @param tab
   * @param account
   * @param to
   * @param amount
   * @param currency
   * @param memo
   * @param recurrence
   * @param executions
   */
  requestRecurrentTransfer(
    tab: any,
    account: string,
    to: string,
    amount: string,
    currency: string,
    memo: string,
    recurrence: string,
    executions: string,
  ) {
    const request = {
      type: KeychainRequestTypes.recurrentTransfer,
      username: account,
      to,
      amount: (+amount).toFixed(3),
      currency,
      memo,
      recurrence,
      executions,
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
