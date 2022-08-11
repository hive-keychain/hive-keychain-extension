import { AuthorityType } from '@hiveio/dhive';
import {
  KeychainKeyTypes,
  KeychainRequest,
  KeychainRequestData,
  KeychainRequestTypes,
  RequestAddAccount,
  RequestAddAccountAuthority,
  RequestAddAccountKeys,
  RequestAddKeyAuthority,
  RequestBroadcast,
  RequestConvert,
  RequestCreateClaimedAccount,
  RequestCustomJSON,
  RequestDecode,
  RequestRemoveAccountAuthority,
  RequestRemoveKeyAuthority,
  RequestTransfer,
} from '@interfaces/keychain.interface';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';

const requestDecode = {
  rpc: '',
  domain: '',
  key: '',
  type: KeychainRequestTypes.decode,
  username: '',
  message: '',
  method: KeychainKeyTypes.memo,
} as RequestDecode;
const keyChainRequestData: KeychainRequestData = {
  ...requestDecode,
  redirect_uri: '',
};

const noValues = {
  decode: {
    ...keyChainRequestData,
    request_id: 0,
  } as KeychainRequest,
  transfer: {
    domain: '',
    type: KeychainRequestTypes.transfer,
    to: '',
    amount: '',
    memo: '',
    enforce: false,
    currency: '',
  } as RequestTransfer,
};

const commonValues = {
  domain: 'domain',
  username: mk.user.one,
};

const authType = {
  weight_threshold: 1,
  account_auths: [],
  key_auths: [],
} as AuthorityType;

const wValues = {
  addAccount: {
    ...commonValues,
    type: KeychainRequestTypes.addAccount,
    keys: userData.one.nonEncryptKeys as RequestAddAccountKeys,
  } as RequestAddAccount,
  addAccountAuthority: {
    ...commonValues,
    type: KeychainRequestTypes.addAccountAuthority,
    role: KeychainKeyTypes.posting,
    weight: 1,
    authorizedUsername: 'theghost1980',
  } as RequestAddAccountAuthority,
  removeAccountAuthority: {
    ...commonValues,
    type: KeychainRequestTypes.removeAccountAuthority,
    authorizedUsername: 'theghost1980',
    role: KeychainKeyTypes.posting,
    method: KeychainKeyTypes.active,
  } as RequestRemoveAccountAuthority,
  addKeyAuthority: {
    ...commonValues,
    type: KeychainRequestTypes.addKeyAuthority,
    authorizedKey: userData.one.encryptKeys.posting,
    method: KeychainKeyTypes.active,
    weight: 1,
    role: KeychainKeyTypes.posting,
  } as RequestAddKeyAuthority,
  removeKeyAuthority: {
    ...commonValues,
    type: KeychainRequestTypes.removeKeyAuthority,
    authorizedKey: userData.one.encryptKeys.posting,
    method: KeychainKeyTypes.active,
    role: KeychainKeyTypes.posting,
  } as RequestRemoveKeyAuthority,
  broadcastOperation: {
    ...commonValues,
    type: KeychainRequestTypes.broadcast,
    operations: 'transfer',
    method: KeychainKeyTypes.posting,
  } as RequestBroadcast,
  convert: {
    ...commonValues,
    type: KeychainRequestTypes.convert,
    amount: '0.1',
    collaterized: false,
  } as RequestConvert,
  claimedAccount: {
    ...commonValues,
    type: KeychainRequestTypes.createClaimedAccount,
    new_account: 'new_account',
    owner: JSON.stringify(authType),
    active: JSON.stringify(authType),
    posting: JSON.stringify(authType),
    memo: JSON.stringify(authType),
  } as RequestCreateClaimedAccount,
  customJson: {
    ...commonValues,
    type: KeychainRequestTypes.custom,
    id: '1',
    json: JSON.stringify({
      command: 'send_tokens',
      amount: 1,
    }),
    display_msg: 'display_msg',
    method: KeychainKeyTypes.active,
  } as RequestCustomJSON,
  decode: {
    ...commonValues,
    type: KeychainRequestTypes.decode,
    message: '',
    method: KeychainKeyTypes.active,
  } as RequestDecode,
};

export default { noValues, wValues };
