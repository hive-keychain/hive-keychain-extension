import {
  KeychainKeyTypesLC,
  KeychainRequest,
} from '@interfaces/keychain.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';

export const anonymous_requests = [
  'delegation',
  'witnessVote',
  'proxy',
  'custom',
  'signBuffer',
  'recurrentTransfer',
];
export const isWhitelisted = (
  arr: NoConfirm,
  data: KeychainRequest,
  domain: string,
  current_rpc: Rpc,
) => {
  try {
    if (
      getRequiredWifType(data) === KeychainKeyTypesLC.active ||
      !arr ||
      !data.username ||
      current_rpc.testnet
    ) {
      return false;
    } else {
      return arr[data.username][domain][data.type];
    }
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const addToWhitelist = (
  username: string,
  domain: string,
  type: string,
) => {
  chrome.storage.local.get([LocalStorageKeyEnum.NO_CONFIRM], (items) => {
    let keep = !items.no_confirm ? {} : JSON.parse(items.no_confirm);
    if (keep[username] == undefined) {
      keep[username] = {};
    }
    if (keep[username][domain] == undefined) {
      keep[username][domain] = {};
    }
    keep[username][domain][type] = true;
    chrome.storage.local.set({
      no_confirm: keep,
    });
  });
};

// Get the key needed for each type of transaction
export const getRequiredWifType = (request: KeychainRequest) => {
  switch (request.type) {
    case 'decode':
    case 'encode':
    case 'signBuffer':
    case 'broadcast':
    case 'addAccountAuthority':
    case 'removeAccountAuthority':
    case 'removeKeyAuthority':
    case 'addKeyAuthority':
    case 'signTx':
      return request.method.toLowerCase() as KeychainKeyTypesLC;
    case 'post':
    case 'vote':
      return KeychainKeyTypesLC.posting;
    case 'custom':
      return !request.method
        ? KeychainKeyTypesLC.posting
        : (request.method.toLowerCase() as KeychainKeyTypesLC);

    case 'signedCall':
      return request.typeWif.toLowerCase() as KeychainKeyTypesLC;
    case 'transfer':
    case 'sendToken':
    case 'delegation':
    case 'witnessVote':
    case 'proxy':
    case 'powerUp':
    case 'powerDown':
    case 'createClaimedAccount':
    case 'createProposal':
    case 'removeProposal':
    case 'updateProposalVote':
    case 'convert':
    case 'recurrentTransfer':
    default:
      return KeychainKeyTypesLC.active;
  }
};
