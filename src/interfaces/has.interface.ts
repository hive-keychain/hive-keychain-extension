export enum HAS_CMD {
  AUTH_REQ = 'auth_req',
  AUTH_WAIT = 'auth_wait',
  AUTH_ACK = 'auth_ack',
  AUTH_NACK = 'auth_nack',
  SIGN_REQ = 'sign_req',
  SIGN_WAIT = 'sign_wait',
  SIGN_ACK = 'sign_ack',
  SIGN_NACK = 'sign_nack',
}

export interface AUTH_REQ_DATA {
  app: {
    name: string;
    description?: string;
    icon?: string;
  };
  challenge: HasChallenge;
  token?: string;
}

export interface AUTH_REQ {
  cmd: HAS_CMD.AUTH_REQ;
  account: string;
  data: AUTH_REQ_DATA | string;
}

export interface AUTH_WAIT {
  cmd: HAS_CMD.AUTH_WAIT;
  uuid: string;
  expire: number;
  account: string;
}
export interface AUTH_ACK {
  cmd: HAS_CMD.AUTH_ACK;
  uuid: string;
  data: string | AUTH_ACK_DATA;
}

export interface AUTH_NACK {
  cmd: HAS_CMD.AUTH_NACK;
  uuid: string;
  data: string;
}

export interface AUTH_ACK_DATA {
  expire: number;
  challenge: HasChallenge;
  token: string; // DEPRECATED - protocol < 1.0 only
}
export interface HasChallenge {
  key_type: string;
  challenge: string | object;
  pubkey?: string;
}
export interface AUTH_PAYLOAD {
  account: string;
  uuid: string;
  key: string;
  host: string;
}

export type AUTH_PAYLOAD_URI = `has://auth?${string}` | string | undefined;

export interface SIGN_REQ_DATA {
  key_type: string;
  ops: Object[];
  broadcast: boolean;
  nonce: number;
}

export interface SIGN_REQ {
  cmd: HAS_CMD.SIGN_REQ;
  account: string;
  data: SIGN_REQ_DATA | string;
  token?: string;
}

export interface SIGN_WAIT {
  cmd: HAS_CMD.SIGN_WAIT;
  uuid: string;
  expire: number;
}

export interface SIGN_ACK {
  cmd: HAS_CMD.SIGN_ACK;
  uuid: string;
  broadcast: boolean;
  data: string;
}

export interface SIGN_NACK {
  cmd: HAS_CMD.SIGN_NACK;
  uuid: string;
  data: string;
}
