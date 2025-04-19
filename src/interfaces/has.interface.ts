import { KeylessChallenge } from '@interfaces/keyless-keychain.interface';

export interface AUTH_REQ_DATA {
  app: {
    name: string;
    description?: string;
    icon?: string;
  };
  challenge: KeylessChallenge;
  toketn?: string;
}

export interface AUTH_REQ {
  cmd: 'auth_req';
  account: string;
  data: AUTH_REQ_DATA | string;
}

export interface AUTH_WAIT {
  cmd: 'auth_wait';
  uuid: string;
  expire: number;
  account: string;
}
export interface AUTH_ACK {
  cmd: 'auth_ack';
  uuid: string;
  data: string | AUTH_ACK_DATA;
}

export interface AUTH_NACK {
  cmd: 'auth_nack';
  uuid: string;
  data: string;
}

export interface AUTH_ACK_DATA {
  expire: number;
  challenge_data?: object;
  token?: string; // DEPRECATED - protocol < 1.0 only
}

export interface AUTH_PAYLOAD {
  account: string;
  uuid: string;
  key: string;
  host: string;
}

export type AUTH_PAYLOAD_URI = `has://auth?${string}` | string | undefined;
