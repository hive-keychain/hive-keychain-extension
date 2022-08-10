import {
  KeychainKeyTypes,
  KeychainRequest,
  KeychainRequestData,
  KeychainRequestTypes,
  RequestAddAccount,
  RequestAddAccountAuthority,
  RequestAddAccountKeys,
  RequestAddKeyAuthority,
  RequestDecode,
  RequestRemoveAccountAuthority,
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

const wValues = {
  addAccount: {
    domain: 'domain',
    type: KeychainRequestTypes.addAccount,
    username: mk.user.one,
    keys: userData.one.nonEncryptKeys as RequestAddAccountKeys,
  } as RequestAddAccount,
  addAccountAuthority: {
    domain: 'domain',
    type: KeychainRequestTypes.addAccountAuthority,
    username: mk.user.one,
    role: KeychainKeyTypes.posting,
    weight: 1,
    authorizedUsername: 'theghost1980',
  } as RequestAddAccountAuthority,
  removeAccountAuthority: {
    domain: 'domain',
    type: KeychainRequestTypes.removeAccountAuthority,
    username: mk.user.one,
    authorizedUsername: 'theghost1980',
    role: KeychainKeyTypes.posting,
    method: KeychainKeyTypes.active,
  } as RequestRemoveAccountAuthority,
  addKeyAuthority: {
    domain: 'domain',
    type: KeychainRequestTypes.addKeyAuthority,
    authorizedKey: userData.one.encryptKeys.posting,
    username: mk.user.one,
    method: KeychainKeyTypes.active,
    weight: 1,
    role: KeychainKeyTypes.posting,
  } as RequestAddKeyAuthority,
};

export default { noValues, wValues };
