import { RequestsHandler } from '@background/requests/request-handler';
import { KeylessKeychainUtils } from '@background/utils/keyless-keychain.utils';
import { AUTH_PAYLOAD, AUTH_PAYLOAD_URI } from '@interfaces/has.interface';
import {
  KeychainRequest,
  KeychainRequestTypes,
  RequestSignBuffer,
} from '@interfaces/keychain.interface';
import { KeylessRequest } from '@interfaces/keyless-keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import Config from 'src/config';
import HASUtils from 'src/utils/has-utils';

const handleOperation = async (
  requestHandler: RequestsHandler,
  request: KeychainRequest,
  domain: string,
  tab: number,
) => {
  await HASUtils.connect();

  switch (request.type) {
    case KeychainRequestTypes.signBuffer:
      HASUtils.challengeRequest(requestHandler, request, domain, tab);
      break;
    case KeychainRequestTypes.encode:
      HASUtils.challengeRequest(requestHandler, request, domain, tab);
      break;
    case KeychainRequestTypes.decode:
      HASUtils.challengeRequest(requestHandler, request, domain, tab);
      break;
    case KeychainRequestTypes.swap:
    case KeychainRequestTypes.encodeWithKeys:
      chrome.runtime.sendMessage({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          message: await chrome.i18n.getMessage(
            'dialog_keyless_unsupported_operation',
            [request.type],
          ),
        },
      });
      break;
    default:
      HASUtils.signRequest(request, domain, tab);
  }
};

const register = async (
  requestHandler: RequestsHandler,
  request: KeychainRequest,
  domain: string,
  tab: number,
) => {
  await HASUtils.connect();
  if (!request.username) {
    chrome.runtime.sendMessage({
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        success: false,
        message: await chrome.i18n.getMessage(
          'dialog_keyless_username_required',
        ),
      },
    });
    return;
  }
  const username = request.username;
  const keylessAuthData = await KeylessKeychainUtils.registerUserAndDapp(
    request,
    domain,
  );
  if (keylessAuthData) {
    const keylessRequest: KeylessRequest = {
      ...keylessAuthData,
      request: {
        ...request,
        ...(request.type === KeychainRequestTypes.signBuffer
          ? {
              key: (request as RequestSignBuffer).method.toLowerCase(),
              message: (request as RequestSignBuffer).message.replace(
                /\\/g,
                '',
              ),
            }
          : {}),
      },
    };

    const authWait = await HASUtils.authenticate(keylessRequest);
    keylessRequest.uuid = authWait.uuid;
    keylessRequest.expire = authWait.expire;
    await KeylessKeychainUtils.updateAuthenticatedKeylessAuthData(
      keylessRequest,
      authWait,
    );
    const authPayload: AUTH_PAYLOAD = {
      account: username,
      uuid: authWait.uuid,
      key: keylessRequest.authKey,
      host: Config.keyless.host,
    };
    const authPayloadUri = await HASUtils.generateAuthPayloadURI(authPayload);
    showQRCode(keylessRequest, domain, authPayloadUri);
    await HASUtils.listenToAuthAck(
      requestHandler,
      username,
      keylessRequest,
      tab,
    );
  }
};
const showQRCode = (
  request: KeychainRequest | KeylessRequest,
  domain: string,
  authPayloadUri: AUTH_PAYLOAD_URI,
) => {
  chrome.runtime.sendMessage({
    command: DialogCommand.REGISTER_KEYLESS_KEYCHAIN,
    data: request,
    domain,
    authPayloadUri,
  });
};

/**
 * Check if the keyless auth data is registered and valid for the given username and domain
 * @param request - The request
 * @param domain - The domain
 * @param tab - The tab
 * @returns The keyless auth data if it is registered and valid, undefined otherwise
 */
const getKeylessRegistrationInfo = async (
  request: KeychainRequest,
  domain: string,
  tab: number,
) => {
  const keylessAuthData =
    await KeylessKeychainUtils.getKeylessAuthDataByAppName(
      request.username!,
      domain,
    );
  if (keylessAuthData) {
    const isRegistered =
      KeylessKeychainUtils.isKeylessAuthDataRegistered(keylessAuthData);
    return isRegistered ? keylessAuthData : undefined;
  }
  return undefined;
};

export const KeylessKeychainModule = {
  register,
  handleOperation,
  getKeylessRegistrationInfo,
};
