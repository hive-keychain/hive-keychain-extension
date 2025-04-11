import { RequestsHandler } from '@background/requests/request-handler';
import KeylessKeychainUtils from '@background/utils/keylessKeychain.utils';
import { AUTH_PAYLOD } from '@interfaces/has.interface';
import {
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import { KeylessRequest } from '@interfaces/keyless-keychain.interface';
import HASUtils from 'src/utils/has-utils';
export const keylessKeychainRequest = async (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
) => {
  await HASUtils.connect();

  if (request.type === KeychainRequestTypes.signBuffer) {
    if (!request.username) {
      throw new Error('Username is required');
    }
    const username = request.username;
    // handle login/registration
    const keylessAuthData = await KeylessKeychainUtils.registerUserAndDapp(
      request,
      domain,
    );
    if (keylessAuthData) {
      const keylessRequest: KeylessRequest = {
        ...keylessAuthData,
        request: request,
      };
      //
      const auth_wait = await HASUtils.authenticate(keylessRequest);
      await KeylessKeychainUtils.updateAuthenticatedKeylessAuthData(
        keylessRequest,
        auth_wait,
      );

      const auth_payload: AUTH_PAYLOD = {
        account: username,
        uuid: auth_wait.uuid,
        key: keylessRequest.authKey,
        host: `wss://hive-auth.arcange.eu/`,
      };
      const auth_payload_uri = await HASUtils.generateAuthPayloadURI(
        auth_payload,
      );
      console.log(`auth_payload_uri:${auth_payload_uri}`);

      //TODO: show the QR code of the auth_payload_uri
    }
  }
};
