import {
  KeychainKeyTypesLC,
  KeychainRequest,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';

export const anonymous_requests = [
  'delegation',
  'witnessVote',
  'proxy',
  'custom',
  'signBuffer',
  'recurrentTransfer',
];
export const hasNoConfirm = (
  arr: string,
  data: KeychainRequest,
  domain: string,
  current_rpc: Rpc,
) => {
  try {
    if (
      getRequiredWifType(data) === KeychainKeyTypesLC.active ||
      !arr ||
      current_rpc.testnet
    ) {
      return false;
    } else {
      return JSON.parse(arr)[data.username!][domain][data.type] === true;
    }
  } catch (e) {
    console.log(e);
    return false;
  }
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
