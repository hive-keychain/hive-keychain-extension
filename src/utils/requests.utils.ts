import {
  KeychainKeyTypesLC,
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';

export const anonymous_requests = [
  KeychainRequestTypes.delegation,
  KeychainRequestTypes.witnessVote,
  KeychainRequestTypes.proxy,
  KeychainRequestTypes.custom,
  KeychainRequestTypes.signBuffer,
  KeychainRequestTypes.recurrentTransfer,
  KeychainRequestTypes.updateProposalVote,
  KeychainRequestTypes.swap,
  KeychainRequestTypes.vscCallContract,
  KeychainRequestTypes.vscDeposit,
  KeychainRequestTypes.vscWithdrawal,
  KeychainRequestTypes.vscTransfer,
  KeychainRequestTypes.vscStaking,
];

// Get the key needed for each type of transaction
export const getRequiredWifType = (request: KeychainRequest) => {
  switch (request.type) {
    case KeychainRequestTypes.decode:
    case KeychainRequestTypes.encode:
    case KeychainRequestTypes.signBuffer:
    case KeychainRequestTypes.broadcast:
    case KeychainRequestTypes.signTx:
      return request.method.toLowerCase() as KeychainKeyTypesLC;
    case KeychainRequestTypes.post:
    case KeychainRequestTypes.vote:
      return KeychainKeyTypesLC.posting;
    case KeychainRequestTypes.custom:
    case KeychainRequestTypes.vscCallContract:
      return !request.method
        ? KeychainKeyTypesLC.posting
        : (request.method.toLowerCase() as KeychainKeyTypesLC);

    case KeychainRequestTypes.signedCall:
      return request.typeWif.toLowerCase() as KeychainKeyTypesLC;
    case KeychainRequestTypes.transfer:
    case KeychainRequestTypes.sendToken:
    case KeychainRequestTypes.delegation:
    case KeychainRequestTypes.witnessVote:
    case KeychainRequestTypes.proxy:
    case KeychainRequestTypes.powerUp:
    case KeychainRequestTypes.powerDown:
    case KeychainRequestTypes.createClaimedAccount:
    case KeychainRequestTypes.createProposal:
    case KeychainRequestTypes.removeProposal:
    case KeychainRequestTypes.updateProposalVote:
    case KeychainRequestTypes.convert:
    case KeychainRequestTypes.recurrentTransfer:
    case KeychainRequestTypes.addAccountAuthority:
    case KeychainRequestTypes.removeAccountAuthority:
    case KeychainRequestTypes.removeKeyAuthority:
    case KeychainRequestTypes.addKeyAuthority:
    case KeychainRequestTypes.vscDeposit:
    default:
      return KeychainKeyTypesLC.active;
  }
};
