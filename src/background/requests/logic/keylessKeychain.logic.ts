import { RequestsHandler } from '@background/requests/request-handler';
import KeylessKeychainUtils from '@background/utils/keylessKeychain.utils';
import {
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
export const keylessKeychainRequest = async (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
) => {
  if (request.type === KeychainRequestTypes.signBuffer) {
    // handle login/registration
    await KeylessKeychainUtils.registerUserAndDapp(request, domain);
  }
};
