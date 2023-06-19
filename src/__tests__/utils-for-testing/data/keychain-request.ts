import { RequestsHandler } from '@background/requests/request-handler';
import {
  KeychainKeyTypes,
  KeychainRequest,
  KeychainRequestData,
  KeychainRequestTypes,
  RequestDecode,
  RequestId,
  RequestPost,
  RequestTransfer,
} from '@interfaces/keychain.interface';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import mk from 'src/__tests__/utils-for-testing/data/mk';

const requestHandler = new RequestsHandler();

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

const data = {
  username: mk.user.one,
  rpc: DefaultRpcs[0].uri,
  domain: 'domain',
  type: KeychainRequestTypes.addAccount,
  request_id: 1,
} as KeychainRequest;

const decodeData = {
  type: KeychainRequestTypes.decode,
  username: mk.user.one,
  message: '',
  method: KeychainKeyTypes.memo,
  rpc: DefaultRpcs[0].uri,
  domain: 'domain',
  request_id: 1,
} as RequestDecode & RequestId;

const postData = {
  type: KeychainRequestTypes.post,
  username: mk.user.one,
  body: "{'body': 'the body'}",
  parent_perm: 'https://saturnoman.com',
  json_metadata: "{'body':'the body'}",
  permlink: 'https://hive.blog/perma-1',
  comment_options: '',
  rpc: DefaultRpcs[0].uri,
  domain: 'domain',
  request_id: 1,
} as RequestPost & RequestId;

export default { noValues, data, decodeData, postData, requestHandler };
