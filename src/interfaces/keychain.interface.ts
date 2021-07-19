import { Operation, Transaction } from '@hiveio/dhive';

export enum KeychainRequestTypes {
  decode = 'decode',
  encode = 'encode',
  signBuffer = 'signBuffer',
  broadcast = 'broadcast',
  addAccountAuthority = 'addAccountAuthority',
  removeAccountAuthority = 'removeAccountAuthority',
  removeKeyAuthority = 'removeKeyAuthority',
  addKeyAuthority = 'addKeyAuthority',
  signTx = 'signTx',
  post = 'post',
  vote = 'vote',
  custom = 'custom',
  signedCall = 'signedCall',
  transfer = 'transfer',
  sendToken = 'sendToken',
  delegation = 'delegation',
  witnessVote = 'witnessVote',
  proxy = 'proxy',
  powerUp = 'powerUp',
  powerDown = 'powerDown',
  createClaimedAccount = 'createClaimedAccount',
  createProposal = 'createProposal',
  removeProposal = 'removeProposal',
  updateProposalVote = 'updateProposalVote',
  addAccount = 'addAccount',
  convert = 'convert',
  recurrentTransfer = 'recurrentTransfer',
}

export enum KeychainKeyTypes {
  posting = 'Posting',
  active = 'Active',
  memo = 'Memo',
}

type CommonRequestParams = {
  rpc?: string;
  domain: string;
};

export type RequestDecode = CommonRequestParams & {
  type: KeychainRequestTypes.decode;
  username: string;
  message: string;
  method: KeychainKeyTypes;
};

export type RequestEncode = CommonRequestParams & {
  type: KeychainRequestTypes.encode;
  username: string;
  receiver: string;
  message: string;
  method: KeychainKeyTypes;
};

export type RequestSignBuffer = CommonRequestParams & {
  type: KeychainRequestTypes.signBuffer;
  username?: string;
  message: string;
  method: KeychainKeyTypes;
  title?: string;
};

export type RequestBroadcast = CommonRequestParams & {
  type: KeychainRequestTypes.broadcast;
  username: string;
  operations: string | Operation[];
  method: KeychainKeyTypes;
};

export type RequestAddAccountAuthority = CommonRequestParams & {
  type: KeychainRequestTypes.addAccountAuthority;
  authorizedUsername: string;
  role: KeychainKeyTypes;
  weight: number;
  username: string;
  method: KeychainKeyTypes.active;
};

export type RequestRemoveAccountAuthority = CommonRequestParams & {
  type: KeychainRequestTypes.removeAccountAuthority;
  authorizedUsername: string;
  role: KeychainKeyTypes;
  username: string;
  method: KeychainKeyTypes.active;
};

export type RequestAddKeyAuthority = CommonRequestParams & {
  type: KeychainRequestTypes.addKeyAuthority;
  authorizedKey: string;
  role: KeychainKeyTypes;
  username: string;
  method: KeychainKeyTypes.active;
  weight: number;
};

export type RequestRemoveKeyAuthority = CommonRequestParams & {
  type: KeychainRequestTypes.removeKeyAuthority;
  authorizedKey: string;
  role: KeychainKeyTypes;
  username: string;
  method: KeychainKeyTypes.active;
};

export type RequestSignTx = CommonRequestParams & {
  type: KeychainRequestTypes.signTx;
  username: string;
  tx: Transaction;
  method: KeychainKeyTypes;
};

export type RequestPost = CommonRequestParams & {
  type: KeychainRequestTypes.post;
  username: string;
  title?: string;
  body: string;
  parent_perm: string;
  parent_username?: string;
  json_metadata: string;
  permlink: string;
  comment_options: string;
};

export type RequestVote = CommonRequestParams & {
  type: KeychainRequestTypes.vote;
  username: string;
  permlink: string;
  author: string;
  weight: string | number;
};

export type RequestCustomJSON = CommonRequestParams & {
  type: KeychainRequestTypes.custom;
  username?: string;
  id: string;
  method: KeychainKeyTypes;
  json: string;
  display_msg: string;
};

export type RequestSignedCall = CommonRequestParams & {
  type: KeychainRequestTypes.signedCall;
  username: string;
  method: string;
  params: string;
  typeWif: KeychainKeyTypes;
};

export type RequestTransfer = CommonRequestParams & {
  type: KeychainRequestTypes.transfer;
  username?: string;
  to: string;
  amount: string;
  memo: string;
  enforce: boolean;
  currency: string;
};

export type RequestSendToken = CommonRequestParams & {
  type: KeychainRequestTypes.sendToken;
  username: string;
  to: string;
  amount: string;
  memo: string;
  currency: string;
};

export type RequestDelegation = CommonRequestParams & {
  type: KeychainRequestTypes.delegation;
  username?: string;
  delegatee: string;
  amount: string;
  unit: string;
};

export type RequestWitnessVote = CommonRequestParams & {
  type: KeychainRequestTypes.witnessVote;
  username?: string;
  witness: string;
  vote: boolean;
};

export type RequestProxy = CommonRequestParams & {
  type: KeychainRequestTypes.proxy;
  username?: string;
  proxy: string;
};

export type RequestPowerUp = CommonRequestParams & {
  type: KeychainRequestTypes.powerUp;
  username: string;
  recipient: string;
  steem: string;
};

export type RequestPowerDown = CommonRequestParams & {
  type: KeychainRequestTypes.powerDown;
  username: string;
  steem_power: string;
};

export type RequestCreateClaimedAccount = CommonRequestParams & {
  type: KeychainRequestTypes.createClaimedAccount;
  username: string;
  new_account: string;
  owner: string;
  active: string;
  posting: string;
  memo: string;
};

export type RequestUpdateProposalVote = CommonRequestParams & {
  type: KeychainRequestTypes.updateProposalVote;
  username: string;
  proposal_ids: string;
  approve: boolean;
  extensions: string | any[];
};

export type RequestCreateProposal = CommonRequestParams & {
  type: KeychainRequestTypes.createProposal;
  username: string;
  receiver: string;
  subject: string;
  permlink: string;
  start: string;
  end: string;
  daily_pay: string;
  extensions: string;
};

export type RequestRemoveProposal = CommonRequestParams & {
  type: KeychainRequestTypes.removeProposal;
  username: string;
  proposal_ids: string;
  extensions: string;
};

export type RequestAddAccountKeys = {
  posting?: string;
  active?: string;
  memo?: string;
};

export type RequestAddAccount = CommonRequestParams & {
  type: KeychainRequestTypes.addAccount;
  username: string;
  keys: RequestAddAccountKeys;
};

export type RequestConvert = CommonRequestParams & {
  type: KeychainRequestTypes.convert;
  username: string;
  amount: string;
  collaterized: boolean;
};

export type RequestRecurrentTransfer = CommonRequestParams & {
  type: KeychainRequestTypes.recurrentTransfer;
  username?: string;
  to: string;
  amount: string;
  currency: string;
  memo: string;
  recurrence: number;
  executions: number;
};

export type KeychainRequestData = (
  | RequestDecode
  | RequestEncode
  | RequestSignBuffer
  | RequestBroadcast
  | RequestAddAccountAuthority
  | RequestRemoveAccountAuthority
  | RequestAddKeyAuthority
  | RequestRemoveKeyAuthority
  | RequestSignTx
  | RequestPost
  | RequestVote
  | RequestCustomJSON
  | RequestSignedCall
  | RequestTransfer
  | RequestSendToken
  | RequestDelegation
  | RequestWitnessVote
  | RequestProxy
  | RequestPowerUp
  | RequestPowerDown
  | RequestCreateClaimedAccount
  | RequestUpdateProposalVote
  | RequestCreateProposal
  | RequestRemoveProposal
  | RequestAddAccount
  | RequestConvert
  | RequestRecurrentTransfer
) & { redirect_uri?: string };

export type RequestId = { request_id: number };

export type KeychainRequest = KeychainRequestData & RequestId;

export type HiveErrorMessage = {
  message: string;
  code: number;
  data?: any;
};

export type RequestSuccess = {
  data: KeychainRequestData;
  request_id: number;
  result: any;
  message: string;
};
export type RequestError = {
  data: KeychainRequestData;
  request_id: number;
  error: any;
  message: string;
};

export type RequestResponse = {
  success: boolean;
  error: any | null;
  result: any | null;
} & (RequestSuccess | RequestError);
