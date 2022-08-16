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
import sendTokenMocks from 'src/__tests__/background/requests/operations/ops/mocks/send-token-mocks';
import signTxMocks from 'src/__tests__/background/requests/operations/ops/mocks/sign-tx-mocks';
import signMessageMocks from 'src/__tests__/background/requests/operations/ops/mocks/signMessage-mocks';
import transferMocks from 'src/__tests__/background/requests/operations/ops/mocks/transfer-mocks';
import voteMocks from 'src/__tests__/background/requests/operations/ops/mocks/vote-mocks';
import witnessVoteMocks from 'src/__tests__/background/requests/operations/ops/mocks/witness-vote-mocks';

export const requestsData = [
  { data: addAccountMocks.constants.data, callingWith: [] },
  { data: customJsonMocks.constants.data, callingWith: [] },
  { data: voteMocks.constants.data, callingWith: [] },
  { data: transferMocks.constants.data, callingWith: [] },
  { data: postMocks.constants.data, callingWith: [] },
  { data: authority.constants.data.addAccountAuthority, callingWith: [] },
  { data: authority.constants.data.removeAccountAuthority, callingWith: [] },
  { data: authority.constants.data.addKeyAuthority, callingWith: [] },
  { data: authority.constants.data.removeKeyAuthority, callingWith: [] },
  { data: broadcast.constants.data, callingWith: [] },
  { data: createClaimedAccount.constants.data, callingWith: [] },
  { data: delegationMocks.constants.data, callingWith: [] },
  { data: witnessVoteMocks.constants.data, callingWith: [] },
  { data: proxyMocks.constants.data, callingWith: [] },
  { data: powerMocks.constants.data.powerUp, callingWith: [] },
  { data: powerMocks.constants.data.powerDown, callingWith: [] },
  { data: sendTokenMocks.constants.data, callingWith: [] },
  { data: proposalsMocks.constants.data.create, callingWith: [] },
  { data: proposalsMocks.constants.data.update, callingWith: [] },
  { data: proposalsMocks.constants.data.remove, callingWith: [] },
  { data: decodeMemo.constants.data, callingWith: [] },
  { data: encodeMemo.constants.data, callingWith: [] },
  { data: signMessageMocks.constants.data, callingWith: [] },
  { data: signTxMocks.constants.data, callingWith: [] },
  { data: convertMocks.constants.data, callingWith: [] },
  { data: recurrentTransferMocks.constants.data, callingWith: [] },
];

//TODO delete this after finishing index tests
// let one = {
//   command: 'answerRequest',
//   msg: {
//     data: {
//       domain: 'domain',
//       keys: {
//         active: '5Jsjk3iAyAKUf5qMxphGUt1sJQkvndjzdmroAUhRQxPAZiquBMF',
//         activePubkey: 'STM622dVYEu3Hiic6F4QiH1JALAXm8yRqfLd5kCq8xs8ZzNRnKGXC',
//         fakeKey: '5Jq1oDi61PWMq7DNeJWQUVZV3v85QVFMN9ro3Dnmi1DySjgU1v9',
//         master: 'P5JNBox9D8vcrWQ7KCzjqUiQ4CpEocDukZtGGiKN76vb3njBcXg3',
//         memo: '5JoFncMNkxo1Mr3YJrKYhPqUfkkG36mqy3YhNMSzPT3jcmZc9RA',
//         memoPubkey: 'STM8eALyQwyb2C4XhXJ7eZfjfjfSeNeeZREaxPcJRApie1uwzzcuF',
//         owner: '5JFdARgUWNqnuagqUTX6iRNo2HbrdksLk3pkJvBfFZ6GUtwfSCc',
//         posting: '5K3R75h6KGBLbEHkmkL34MND95bMveeEu8jPSZWLh5X6DhcnKzM',
//         postingPubkey: 'STM7KKUZb1CzwRiaN2RQcGeJUpcHM5BmCNudxXW21xqktBe91RpD8',
//         randomStringKey51:
//           'MknOPyeXr5CGsCgvDewdny55MREtDpAjhkT9OsPPLCujYD82Urk',
//       },
//       type: 'addAccount',
//       username: 'keychain.tests',
//     },
//     error: false,
//     message: 'Succesfully added account @keychain.tests to Keychain.',
//     publicKey: undefined,
//     request_id: 1,
//     result: true,
//     success: true,
//   },
// };
