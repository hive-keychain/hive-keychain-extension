export enum HasCmd {
  AUTH_REQ = 'auth_req',
  AUTH_WAIT = 'auth_wait',
  AUTH_ACK = 'auth_ack',
  AUTH_NACK = 'auth_nack',
  SIGN_REQ = 'sign_req',
  SIGN_WAIT = 'sign_wait',
  SIGN_ACK = 'sign_ack',
  SIGN_NACK = 'sign_nack',
  CHALLENGE_REQ = 'challenge_req',
  CHALLENGE_WAIT = 'challenge_wait',
  CHALLENGE_ACK = 'challenge_ack',
  CHALLENGE_NACK = 'challenge_nack',
}

export interface AuthReqData {
  app: {
    name: string;
    description?: string;
    icon?: string;
  };
  challenge?: ChallengeReqData;
  token?: string;
}

export interface AuthReq {
  cmd: HasCmd.AUTH_REQ;
  account: string;
  data: AuthReqData | string;
}

export interface AuthWait {
  cmd: HasCmd.AUTH_WAIT;
  uuid: string;
  expire: number;
  account: string;
}

export interface AuthAck {
  cmd: HasCmd.AUTH_ACK;
  uuid: string;
  data: string | AuthAckData;
}

export interface AuthNack {
  cmd: HasCmd.AUTH_NACK;
  uuid: string;
  data: string;
}

export interface AuthAckData {
  expire: number;
  challenge: ChallengeReqData;
  token: string; // DEPRECATED - protocol < 1.0 only
}

export interface ChallengeReqData {
  key_type: string;
  challenge: string | object;
  pubkey?: string;
  decrypt?: boolean;
  nonce?: number;
}

export interface ChallengeReq {
  cmd: HasCmd.CHALLENGE_REQ;
  account: string;
  data: ChallengeReqData | string;
  token?: string;
}

export interface ChallengeWait extends Omit<SignWait, 'cmd'> {
  cmd: HasCmd.CHALLENGE_WAIT;
}

export interface ChallengeAck extends Omit<AuthAck, 'cmd' | 'data'> {
  cmd: HasCmd.CHALLENGE_ACK;
  data: string | ChallengeAckData;
}

export interface ChallengeAckData {
  pubkey: string;
  challenge: string;
}

export interface ChallengeNack {
  cmd: HasCmd.CHALLENGE_NACK;
  uuid: string;
  data: string;
}

export interface AuthPayload {
  account: string;
  uuid: string;
  key: string;
  host: string;
}

export type AuthPayloadUri = `has://auth?${string}` | string | undefined;

export interface SignReqData {
  key_type: string;
  ops: Object[];
  broadcast: boolean;
  nonce: number;
}

export interface SignReq {
  cmd: HasCmd.SIGN_REQ;
  account: string;
  data: SignReqData | string;
  token?: string;
}

export interface SignWait {
  cmd: HasCmd.SIGN_WAIT;
  uuid: string;
  expire: number;
}

export interface SignAck {
  cmd: HasCmd.SIGN_ACK;
  uuid: string;
  broadcast: boolean;
  data: string;
}

export interface SignNack {
  cmd: HasCmd.SIGN_NACK;
  uuid: string;
  data: string;
}
