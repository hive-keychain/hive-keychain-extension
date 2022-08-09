import {
  KeychainKeyTypes,
  KeychainRequest,
  KeychainRequestData,
  KeychainRequestTypes,
  RequestAddAccount,
  RequestAddAccountKeys,
  RequestDecode,
  RequestTransfer,
} from '@interfaces/keychain.interface';
import mk from 'src/__tests__/utils-for-testing/data/mk';

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
    keys: {} as RequestAddAccountKeys,
  } as RequestAddAccount,
};

export default { noValues, wValues };
