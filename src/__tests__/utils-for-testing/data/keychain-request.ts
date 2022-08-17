import {
  KeychainKeyTypes,
  KeychainRequest,
  KeychainRequestData,
  KeychainRequestTypes,
  RequestDecode,
  RequestTransfer,
} from '@interfaces/keychain.interface';

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

export default { noValues };
