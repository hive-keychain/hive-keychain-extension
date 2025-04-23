import { AUTH_PAYLOAD_URI, HasChallenge } from '@interfaces/has.interface';
import { KeychainRequest } from '@interfaces/keychain.interface';

export interface KeylessAuthData {
  appName: string;
  authKey: string;
  uuid?: string;
  expire?: number;
  challenge?: HasChallenge;
  token?: string;
}

export interface KeylessAuthDataUserDictionary {
  [username: string]: KeylessAuthData[];
}

export interface KeylessRequest extends KeylessAuthData {
  request: KeychainRequest;
}

export interface KeylessKeychainState {
  auth_payload_uri: AUTH_PAYLOAD_URI;
}
