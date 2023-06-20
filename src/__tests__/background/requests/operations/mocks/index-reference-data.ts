import { KeychainRequest } from '@interfaces/keychain.interface';
import addAccountMocks from 'src/__tests__/background/requests/operations/ops/mocks/add-account-mocks';
import authority from 'src/__tests__/background/requests/operations/ops/mocks/authority';
import broadcast from 'src/__tests__/background/requests/operations/ops/mocks/broadcast';
import convertMocks from 'src/__tests__/background/requests/operations/ops/mocks/convert-mocks';
import createClaimedAccount from 'src/__tests__/background/requests/operations/ops/mocks/create-claimed-account';
import customJsonMocks from 'src/__tests__/background/requests/operations/ops/mocks/custom-json-mocks';
import decodeMemo from 'src/__tests__/background/requests/operations/ops/mocks/decode-memo';
import delegationMocks from 'src/__tests__/background/requests/operations/ops/mocks/delegation-mocks';
import encodeMemo from 'src/__tests__/background/requests/operations/ops/mocks/encode-memo';
import postMocks from 'src/__tests__/background/requests/operations/ops/mocks/post-mocks';
import powerMocks from 'src/__tests__/background/requests/operations/ops/mocks/power-mocks';
import proposalsMocks from 'src/__tests__/background/requests/operations/ops/mocks/proposals-mocks';
import proxyMocks from 'src/__tests__/background/requests/operations/ops/mocks/proxy-mocks';
import recurrentTransferMocks from 'src/__tests__/background/requests/operations/ops/mocks/recurrent-transfer-mocks';
// import sendTokenMocks from 'src/__tests__/background/requests/operations/ops/mocks/send-token-mocks';
// import signTxMocks from 'src/__tests__/background/requests/operations/ops/mocks/sign-tx-mocks';
// import signMessageMocks from 'src/__tests__/background/requests/operations/ops/mocks/signMessage-mocks';
// import transferMocks from 'src/__tests__/background/requests/operations/ops/mocks/transfer-mocks';
// import voteMocks from 'src/__tests__/background/requests/operations/ops/mocks/vote-mocks';
// import witnessVoteMocks from 'src/__tests__/background/requests/operations/ops/mocks/witness-vote-mocks';
//TODO remove file after refactoring bg tests section
const indexData = [
  addAccountMocks.constants.data,
  customJsonMocks.constants.data,
  // voteMocks.constants.data,
  // transferMocks.constants.data,
  postMocks.constants.data,
  authority.constants.data.addAccountAuthority,
  authority.constants.data.removeAccountAuthority,
  authority.constants.data.addKeyAuthority,
  authority.constants.data.removeKeyAuthority,
  broadcast.constants.data,
  createClaimedAccount.constants.data,
  delegationMocks.constants.data,
  // witnessVoteMocks.constants.data,
  proxyMocks.constants.data,
  powerMocks.constants.data.powerUp,
  powerMocks.constants.data.powerDown,
  // sendTokenMocks.constants.data,
  proposalsMocks.constants.data.create,
  proposalsMocks.constants.data.update,
  proposalsMocks.constants.data.remove,
  decodeMemo.constants.data,
  encodeMemo.constants.data,
  // signMessageMocks.constants.data,
  // signTxMocks.constants.data,
  convertMocks.constants.data,
  recurrentTransferMocks.constants.data,
] as KeychainRequest[];

export default { indexData };
