import KeylessKeychainUtils from '@background/utils/keylessKeychain.utils';
import { AUTH_PAYLOAD, AUTH_PAYLOAD_URI } from '@interfaces/has.interface';
import {
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import { KeylessRequest } from '@interfaces/keyless-keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import HASUtils from 'src/utils/has-utils';

const handleOperation = async (request: KeychainRequest, domain: string) => {
  await HASUtils.connect();
  console.log('handleOperation', request, domain);
  switch (request.type) {
    case KeychainRequestTypes.signBuffer:
      register(request, domain);
      break;
    default:
      throw new Error('Invalid request type');
  }
};

const register = async (request: KeychainRequest, domain: string) => {
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
      const auth_payload: AUTH_PAYLOAD = {
        account: username,
        uuid: auth_wait.uuid,
        key: keylessRequest.authKey,
        host: `wss://hive-auth.arcange.eu/`,
      };
      const auth_payload_uri = await HASUtils.generateAuthPayloadURI(
        auth_payload,
      );
      showQRCode(request, domain, auth_payload_uri);
      await HASUtils.listenToAuthAck(username, keylessAuthData);
    }
  }
};
const showQRCode = (
  request: KeychainRequest,
  domain: string,
  auth_payload_uri: AUTH_PAYLOAD_URI,
) => {
  chrome.runtime.sendMessage({
    command: DialogCommand.REGISTER_KEYLESS_KEYCHAIN,
    data: request,
    domain,
    auth_payload_uri,
  });
};
export const KeylessKeychainModule = {
  handleOperation,
};
