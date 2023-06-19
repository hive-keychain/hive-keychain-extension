import { RequestsHandler } from '@background/requests/request-handler';
import { AuthorityType, Operation, Transaction } from '@hiveio/dhive';
import {
  KeychainKeyTypes,
  KeychainRequest,
  KeychainRequestData,
  KeychainRequestTypes,
  RequestAddAccountKeys,
  RequestDecode,
  RequestId,
  RequestPost,
  RequestTransfer,
} from '@interfaces/keychain.interface';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import operation from 'src/__tests__/utils-for-testing/data/operation';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';

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

const getWithAllGenericData = () => {
  const authType = {
    weight_threshold: 1,
    account_auths: [],
    key_auths: [],
  } as AuthorityType;
  const cloneData = objects.clone(data) as any;
  cloneData.message = '';
  cloneData.method = KeychainKeyTypes.active;
  cloneData.keys = userData.one.nonEncryptKeys as RequestAddAccountKeys;
  cloneData.id = '1';
  cloneData.json = JSON.stringify({
    command: 'send_tokens',
    amount: 1,
  });
  cloneData.display_msg = 'display_msg';
  cloneData.permlink = 'https://link.hive';
  cloneData.author = 'theghost1980';
  cloneData.weight = 100;
  cloneData.to = 'theghost1980';
  cloneData.amount = '0.001';
  cloneData.collaterized = false;
  cloneData.memo = '';
  cloneData.enforce = false;
  cloneData.currency = 'HIVE';
  cloneData.title = 'title';
  cloneData.body = 'body_stringyfied';
  cloneData.parent_perm = 'https://hive.com/perm-link/';
  cloneData.parent_username = 'theghost1980';
  cloneData.json_metadata = 'metadata_stringyfied';
  cloneData.permlink = 'https://hive.com/perm-link-1/';
  cloneData.comment_options = '';
  cloneData.extensions = '';
  cloneData.role = KeychainKeyTypes.posting;
  cloneData.authorizedUsername = 'theghost1980';
  cloneData.authorizedKey = userData.one.encryptKeys.posting;
  cloneData.operations = operation.array.filter((op) => op['0'] === 'transfer');
  cloneData.new_account = 'new_account';
  cloneData.owner = JSON.stringify(authType);
  cloneData.active = JSON.stringify(authType);
  cloneData.posting = JSON.stringify(authType);
  cloneData.memo = JSON.stringify(authType);
  cloneData.receiver = 'keychain';
  cloneData.subject = 'Create a keychain coin';
  cloneData.start = '21/12/2022';
  cloneData.end = '21/12/2024';
  cloneData.daily_pay = '300 HBD';
  cloneData.delegatee = 'theghost1980';
  cloneData.unit = 'HP';
  cloneData.hive_power = '0.001';
  cloneData.hive = '0.001';
  cloneData.proxy = '';
  cloneData.recurrence = 2;
  cloneData.executions = 2;
  cloneData.title = 'title';
  cloneData.tx = {
    ref_block_num: 1000,
    ref_block_prefix: 1,
    expiration: '12/12/2023',
    operations: [] as Operation[],
    extensions: [],
  } as Transaction;
  cloneData.enforce = false;
  cloneData.proposal_ids = [1];
  cloneData.approve = true;
  cloneData.witness = 'keychain';

  return cloneData;
};

export default {
  noValues,
  data,
  decodeData,
  postData,
  requestHandler,
  getWithAllGenericData,
};
