import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import {
  RequestAddAccount,
  RequestAddAccountAuthority,
  RequestAddKeyAuthority,
  RequestBroadcast,
  RequestConvert,
  RequestCreateClaimedAccount,
  RequestCreateProposal,
  RequestCustomJSON,
  RequestDecode,
  RequestDelegation,
  RequestEncode,
  RequestId,
  RequestPost,
  RequestPowerDown,
  RequestPowerUp,
  RequestProxy,
  RequestRecurrentTransfer,
  RequestRemoveAccountAuthority,
  RequestRemoveKeyAuthority,
  RequestRemoveProposal,
  RequestSendToken,
  RequestSignBuffer,
  RequestSignTx,
  RequestTransfer,
  RequestUpdateProposalVote,
  RequestVote,
  RequestWitnessVote,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';

type PropsCommon = {
  domain: string;
  tab: number;
  rpc: Rpc;
};

export type PropsRequestBalance = {
  amount: number;
  currency: string;
  username?: string;
  rpc: Rpc;
};

export type PropsRequestItem = {
  title: string;
  content: string;
  pre?: boolean;
  red?: boolean;
};

export type PropsRequestTokenBalance = {
  amount: number;
  currency: string;
  username: string;
  hiveEngineConfig: HiveEngineConfig;
};

export type PropsRequestUsername = {
  accounts: string[];
  username: string;
  setUsername: (username: string) => void;
};

export type PropsRequestProxy = {
  data: RequestProxy & RequestId;
  accounts?: string[];
} & PropsCommon;

export type PropsRequestTransfer = {
  data: RequestTransfer & RequestId;
  accounts?: string[];
} & PropsCommon;

export type PropsRequestAddAccountAuthority = {
  data: RequestAddAccountAuthority & RequestId;
} & PropsCommon;

export type PropsRequestAddKeyAuthority = {
  data: RequestAddKeyAuthority & RequestId;
} & PropsCommon;

export type PropsRequestRemoveAccountAuthority = {
  data: RequestRemoveAccountAuthority & RequestId;
} & PropsCommon;

export type PropsRequestRemoveKeyAuthority = {
  data: RequestRemoveKeyAuthority & RequestId;
} & PropsCommon;

export type PropsRequestPowerDown = {
  data: RequestPowerDown & RequestId;
} & PropsCommon;

export type PropsRequestPowerUp = {
  data: RequestPowerUp & RequestId;
} & PropsCommon;

export type PropsRequestCreateProposal = {
  data: RequestCreateProposal & RequestId;
} & PropsCommon;

export type PropsRequestRemoveProposal = {
  data: RequestRemoveProposal & RequestId;
} & PropsCommon;

export type PropsRequestUpdateProposal = {
  data: RequestUpdateProposalVote & RequestId;
} & PropsCommon;

export type PropsRequestAddAccount = {
  data: RequestAddAccount & RequestId;
} & PropsCommon;

export type PropsRequestBroadcast = {
  data: RequestBroadcast & RequestId;
} & PropsCommon;

export type PropsRequestConvert = {
  data: RequestConvert & RequestId;
} & PropsCommon;

export type PropsRequestCreateClaimedAccount = {
  data: RequestCreateClaimedAccount & RequestId;
} & PropsCommon;

export type PropsRequestCustomJSON = {
  data: RequestCustomJSON & RequestId;
  accounts?: string[];
} & PropsCommon;

export type PropsRequestDecodeMemo = {
  data: RequestDecode & RequestId;
} & PropsCommon;

export type PropsRequestDelegation = {
  data: RequestDelegation & RequestId;
  accounts?: string[];
} & PropsCommon;

export type PropsRequestEncodeMemo = {
  data: RequestEncode & RequestId;
} & PropsCommon;

export type PropsRequestPost = {
  data: RequestPost & RequestId;
} & PropsCommon;

export type PropsRequestRecurrentTransfer = {
  data: RequestRecurrentTransfer & RequestId;
  accounts?: string[];
} & PropsCommon;

export type PropsRequestSendToken = {
  data: RequestSendToken & RequestId;
  hiveEngineConfig: HiveEngineConfig;
} & PropsCommon;

export type PropsRequestSignBuffer = {
  data: RequestSignBuffer & RequestId;
  accounts?: string[];
} & PropsCommon;

export type PropsRequestsSignTx = {
  data: RequestSignTx & RequestId;
} & PropsCommon;

export type PropsRequestVote = {
  data: RequestVote & RequestId;
} & PropsCommon;

export type PropsRequestWitnessVote = {
  data: RequestWitnessVote & RequestId;
  accounts?: string[];
} & PropsCommon;
