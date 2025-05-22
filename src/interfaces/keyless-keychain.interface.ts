import { AuthPayloadUri, ChallengeReqData } from '@interfaces/has.interface';
import { KeychainRequest } from '@interfaces/keychain.interface';

export interface KeylessAuthData {
  appName: string;
  authKey: string;
  uuid?: string;
  expire?: number;
  challenge?: ChallengeReqData;
  token?: string;
}

export interface KeylessAuthDataUserDictionary {
  [username: string]: KeylessAuthData[];
}

export interface KeylessRequest extends KeylessAuthData {
  request: KeychainRequest;
}

export interface KeylessKeychainState {
  auth_payload_uri: AuthPayloadUri;
}
