// Content script interfacing the website and the extension

import { CommentOptionsOperation } from '@hiveio/dhive';
import {
  KeychainRequest,
  RequestAddAccountKeys,
  RequestDelegation,
  RequestPost,
  RequestResponse,
  RequestTransfer,
} from 'src/interfaces/keychain.interface';

let req: KeychainRequest | null = null;

const setupInjection = () => {
  try {
    var scriptTag = document.createElement('script');
    scriptTag.src = chrome.runtime.getURL('js/hive_keychain.js');
    var container = document.head || document.documentElement;
    container.insertBefore(scriptTag, container.children[0]);
  } catch (e) {
    console.error('Hive Keychain injection failed.', e);
  }
};

setupInjection();

// Answering the handshakes
document.addEventListener('swHandshake_hive', () => {
  window.postMessage(
    {
      type: 'hive_keychain_handshake',
    },
    window.location.origin,
  );
});

// Answering the requests
type KeychainRequestWrapper = {
  detail: KeychainRequest;
};

document.addEventListener('swRequest_hive', (request: object) => {
  const prevReq = req;
  req = (request as KeychainRequestWrapper).detail;
  // If all information are filled, send the request to the background, if not notify an error
  if (validateRequest(req)) {
    sendRequestToBackground(req);
    // cancel previous request if existing
    if (prevReq) {
      cancelPreviousRequest(prevReq);
    }
  } else {
    sendIncompleteDataResponse(req);
    req = prevReq;
  }
});

const cancelPreviousRequest = (prevReq: KeychainRequest) => {
  const response = {
    success: false,
    error: 'ignored',
    result: null,
    message: 'User ignored this transaction',
    data: prevReq,
    request_id: prevReq.request_id,
  };
  sendResponse(response);
};

const sendRequestToBackground = (req: KeychainRequest) => {
  chrome.runtime.sendMessage({
    command: 'sendRequest',
    request: req,
    domain: window.location.hostname,
    request_id: req.request_id,
  });
};

const sendIncompleteDataResponse = (req: KeychainRequest) => {
  var response = {
    success: false,
    error: 'incomplete',
    result: null,
    message: 'Incomplete data or wrong format',
    data: req,
    request_id: req.request_id,
  };
  sendResponse(response);
};

// Get notification from the background upon request completion and pass it to the website.
chrome.runtime.onMessage.addListener(function (obj, sender, sendResp) {
  if (obj.command === 'answerRequest') {
    sendResponse(obj.msg);
    req = null;
  }
});

const sendResponse = (response: RequestResponse) => {
  if (response.data.redirect_uri) {
    window.location.href = response.data.redirect_uri;
  } else {
    window.postMessage(
      {
        type: 'hive_keychain_response',
        response,
      },
      window.location.origin,
    );
  }
};

export const validateRequest = (req: KeychainRequest) => {
  return (
    req &&
    req.type &&
    ((req.type === 'decode' &&
      isFilled(req.username) &&
      isFilled(req.message) &&
      req.message[0] === '#' &&
      isFilledKey(req.method)) ||
      (req.type === 'encode' &&
        isFilled(req.username) &&
        isFilled(req.receiver) &&
        isFilled(req.message) &&
        req.message[0] === '#' &&
        isFilledKey(req.method)) ||
      (req.type === 'signBuffer' &&
        isFilled(req.message) &&
        isFilledKey(req.method)) ||
      (req.type === 'vote' &&
        isFilled(req.username) &&
        isFilledWeight(req.weight) &&
        isFilled(req.permlink) &&
        isFilled(req.author)) ||
      (req.type === 'post' &&
        isFilled(req.username) &&
        isFilled(req.body) &&
        ((isFilled(req.title) &&
          isFilledOrEmpty(req.permlink) &&
          !isFilled(req.parent_username) &&
          isFilled(req.parent_perm) &&
          isFilled(req.json_metadata)) ||
          (!isFilled(req.title) &&
            isFilledOrEmpty(req.permlink) &&
            isFilled(req.parent_username) &&
            isFilled(req.parent_perm) &&
            isFilledOrEmpty(req.json_metadata))) &&
        isCustomOptions(req)) ||
      (req.type === 'custom' && isFilled(req.json) && isFilled(req.id)) ||
      (req.type === 'addAccountAuthority' &&
        isFilled(req.authorizedUsername) &&
        isFilled(req.role) &&
        isFilled(req.weight)) ||
      (req.type === 'removeAccountAuthority' &&
        isFilled(req.authorizedUsername) &&
        isFilled(req.role)) ||
      (req.type === 'addKeyAuthority' &&
        isFilled(req.authorizedKey) &&
        isFilled(req.role) &&
        isFilled(req.weight)) ||
      (req.type === 'removeKeyAuthority' &&
        isFilled(req.authorizedKey) &&
        isFilled(req.role)) ||
      (req.type === 'broadcast' &&
        isFilled(req.operations) &&
        isFilled(req.method)) ||
      (req.type === 'signTx' && isFilled(req.tx) && isFilled(req.method)) ||
      (req.type === 'signedCall' &&
        isFilled(req.method) &&
        isFilled(req.params) &&
        isFilled(req.typeWif)) ||
      (req.type === 'witnessVote' &&
        isFilled(req.witness) &&
        isBoolean(req.vote)) ||
      (req.type === 'proxy' && isFilledOrEmpty(req.proxy)) ||
      (req.type === 'delegation' &&
        isFilled(req.delegatee) &&
        isFilledAmtSP(req) &&
        isFilledDelegationMethod(req.unit)) ||
      (req.type === 'transfer' &&
        isFilledAmt(req.amount) &&
        isFilled(req.to) &&
        isFilledCurrency(req.currency) &&
        hasTransferInfo(req)) ||
      (req.type === 'sendToken' &&
        isFilledAmt(req.amount) &&
        isFilled(req.to) &&
        isFilled(req.currency)) ||
      (req.type === 'powerUp' &&
        isFilled(req.username) &&
        isFilledAmt(req.steem) &&
        isFilled(req.recipient)) ||
      (req.type === 'powerDown' &&
        isFilled(req.username) &&
        (isFilledAmt(req.steem_power) || req.steem_power === '0.000')) ||
      (req.type === 'createClaimedAccount' &&
        isFilled(req.username) &&
        isFilled(req.new_account) &&
        isFilled(req.owner) &&
        isFilled(req.active) &&
        isFilled(req.posting) &&
        isFilled(req.memo)) ||
      (req.type === 'createProposal' &&
        isFilled(req.username) &&
        isFilled(req.receiver) &&
        isFilledDate(req.start) &&
        isFilledDate(req.end) &&
        isFilled(req.subject) &&
        isFilled(req.permlink) &&
        isFilledAmtSBD(req.daily_pay)) ||
      (req.type === 'removeProposal' &&
        isFilled(req.username) &&
        isProposalIDs(req.proposal_ids)) ||
      (req.type === 'updateProposalVote' &&
        isFilled(req.username) &&
        isProposalIDs(req.proposal_ids) &&
        isBoolean(req.approve)) ||
      (req.type === 'sendToken' &&
        isFilledAmt(req.amount) &&
        isFilled(req.to) &&
        isFilled(req.currency)) ||
      (req.type === 'addAccount' && isFilledKeys(req.keys)))
  );
};

// Functions used to check the incoming data
const hasTransferInfo = (req: RequestTransfer) => {
  if (req.enforce) {
    return isFilled(req.username);
  } else if (isFilled(req.memo) && req.memo[0] === '#') {
    return isFilled(req.username);
  } else {
    return true;
  }
};

const isFilled = (obj: any) => {
  return !!obj && obj !== '';
};

const isBoolean = (obj: any) => {
  return typeof obj === typeof true;
};

const isFilledOrEmpty = (obj: string) => {
  return obj || obj === '';
};

const isProposalIDs = (obj: string) => {
  const parsed = JSON.parse(obj);
  return Array.isArray(parsed) && !parsed.some(isNaN);
};

const isFilledDelegationMethod = (obj: string) => {
  return obj === 'VESTS' || obj === 'HP';
};

const isFilledDate = (date: string) => {
  const regex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d/;
  return regex.test(date);
};

const isFilledAmt = (obj: string) => {
  return (
    isFilled(obj) &&
    !isNaN(parseFloat(obj)) &&
    parseFloat(obj) > 0 &&
    countDecimals(obj) === 3
  );
};

const isFilledAmtSP = (obj: RequestDelegation) => {
  return (
    isFilled(obj.amount) &&
    !isNaN(parseFloat(obj.amount)) &&
    ((countDecimals(obj.amount) === 3 && obj.unit === 'HP') ||
      (countDecimals(obj.amount) === 6 && obj.unit === 'VESTS'))
  );
};

const isFilledAmtSBD = (amt: string) => {
  return (
    amt &&
    amt.split(' ').length === 2 &&
    !isNaN(parseFloat(amt.split(' ')[0])) &&
    countDecimals(amt.split(' ')[0]) === 3 &&
    amt.split(' ')[1] === 'HBD'
  );
};

const isFilledWeight = (obj: string | number) => {
  return (
    isFilled(obj) &&
    !isNaN(+obj) &&
    obj >= -10000 &&
    obj <= 10000 &&
    +obj === Math.floor(+obj)
  );
};

const isFilledCurrency = (obj: string) => {
  return isFilled(obj) && (obj === 'HIVE' || obj === 'HBD');
};

const isFilledKey = (obj: string) => {
  return (
    isFilled(obj) && (obj === 'Memo' || obj === 'Active' || obj === 'Posting')
  );
};

const isFilledKeys = (obj: RequestAddAccountKeys) => {
  if (typeof obj !== 'object') {
    return false;
  }
  const keys = Object.keys(obj);
  if (!keys.length) {
    return false;
  }
  if (
    keys.includes('posting') ||
    keys.includes('active') ||
    keys.includes('memo')
  ) {
    return true;
  }
};

const isCustomOptions = (obj: RequestPost) => {
  if (obj.comment_options === '') {
    return true;
  }
  let comment_options: CommentOptionsOperation[1] = JSON.parse(
    obj.comment_options,
  );
  if (
    comment_options.author !== obj.username ||
    comment_options.permlink !== obj.permlink
  ) {
    return false;
  }
  return (
    comment_options.hasOwnProperty('max_accepted_payout') &&
    (comment_options.hasOwnProperty('percent_steem_dollars') ||
      comment_options.hasOwnProperty('percent_hbd')) &&
    comment_options.hasOwnProperty('allow_votes') &&
    comment_options.hasOwnProperty('allow_curation_rewards') &&
    comment_options.hasOwnProperty('extensions')
  );
};

const countDecimals = (nb: string) => {
  return nb.toString().split('.')[1] === undefined
    ? 0
    : nb.toString().split('.')[1].length || 0;
};
