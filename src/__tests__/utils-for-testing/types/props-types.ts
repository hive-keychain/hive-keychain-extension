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
  RequestTransfer,
  RequestUpdateProposalVote,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
//TODO change all common by & PropsCommon.
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
  domain: string;
  tab: number;
  rpc: Rpc;
  accounts?: string[];
};

export type PropsRequestTransfer = {
  data: RequestTransfer & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  accounts?: string[];
};

export type PropsRequestAddAccountAuthority = {
  data: RequestAddAccountAuthority & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

export type PropsRequestAddKeyAuthority = {
  data: RequestAddKeyAuthority & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

export type PropsRequestRemoveAccountAuthority = {
  data: RequestRemoveAccountAuthority & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

export type PropsRequestRemoveKeyAuthority = {
  data: RequestRemoveKeyAuthority & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

export type PropsRequestPowerDown = {
  data: RequestPowerDown & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

export type PropsRequestPowerUp = {
  data: RequestPowerUp & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

export type PropsRequestCreateProposal = {
  data: RequestCreateProposal & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

export type PropsRequestRemoveProposal = {
  data: RequestRemoveProposal & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

export type PropsRequestUpdateProposal = {
  data: RequestUpdateProposalVote & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

export type PropsRequestAddAccount = {
  data: RequestAddAccount & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

export type PropsRequestBroadcast = {
  data: RequestBroadcast & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

export type PropsRequestConvert = {
  data: RequestConvert & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

export type PropsRequestCreateClaimedAccount = {
  data: RequestCreateClaimedAccount & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

export type PropsRequestCustomJSON = {
  data: RequestCustomJSON & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  accounts?: string[];
};

export type PropsRequestDecodeMemo = {
  data: RequestDecode & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

export type PropsRequestDelegation = {
  data: RequestDelegation & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  accounts?: string[];
};

export type PropsRequestEncodeMemo = {
  data: RequestEncode & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

export type PropsRequestPost = {
  data: RequestPost & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

export type PropsRequestRecurrentTransfer = {
  data: RequestRecurrentTransfer & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  accounts?: string[];
};

export type PropsRequestSendToken = {
  data: RequestSendToken & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  hiveEngineConfig: HiveEngineConfig;
};

export type PropsRequestSignBuffer = {
  data: RequestSignBuffer & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  accounts?: string[];
};
