import {
  KeychainKeyTypesLC,
  KeychainRequest,
} from '@interfaces/keychain.interface';

export const anonymous_requests = [
  'delegation',
  'witnessVote',
  'proxy',
  'custom',
  'signBuffer',
  'recurrentTransfer',
];

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
