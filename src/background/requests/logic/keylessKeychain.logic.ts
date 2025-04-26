import { performKeylessOperation } from '@background/index';
import { KeylessKeychainModule } from '@background/keyless-keychain.module';
import { createPopup } from '@background/requests/dialog-lifecycle';
import { RequestsHandler } from '@background/requests/request-handler';
import {
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
export const keylessKeychainRequest = async (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
) => {
  // when it is not yet registered or it is a signBuffer request
  //TODO: handle when authentication is expired -> if the request is not a signBuffer request,
  // then create a signBuffer request
  // out of the information from the actual request and proceed to authentication
  if (request.type === KeychainRequestTypes.signBuffer) {
    const keylessAuthData =
      await KeylessKeychainModule.checkKeylessRegistration(
        request,
        domain,
        tab,
      );
    if (!keylessAuthData) {
      console.log('keyless: reauthentication or new registration');
      const callback = async () => {
        chrome.runtime.sendMessage({
          command: DialogCommand.REGISTER_KEYLESS_KEYCHAIN,
          data: request,
          domain,
          tab,
        });
      };
      createPopup(callback, requestHandler);
    } else {
      console.log('keyless: proceed to sign');
      performKeylessOperation(requestHandler, tab, request, domain);
    }
  } else if (request.type === KeychainRequestTypes.addAccount) {
    console.log('keyless: add account request');
    const callback = async () => {
      chrome.runtime.sendMessage({
        command: DialogCommand.ADD_ACCOUNT,
        data: request,
        domain,
        tab,
      });
    };
    createPopup(callback, requestHandler);
  } else {
    console.log('keyless: registered, proceed to sign');
    performKeylessOperation(requestHandler, tab, request, domain);
  }
};
