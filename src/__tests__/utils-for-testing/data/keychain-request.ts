import {
  KeychainKeyTypes,
  KeychainRequest,
  KeychainRequestData,
  KeychainRequestTypes,
  RequestDecode,
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
};

export default { noValues };
