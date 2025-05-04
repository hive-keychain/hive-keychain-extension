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
  console.log('keyless: request', request);
  if (!request.username || request.username.trim() === '') {
    console.log('keyless: anonymous keyless op');
    createAnonymousKeylessOpPopup(requestHandler, tab, request, domain);
  } else if (request.type === KeychainRequestTypes.addAccount) {
    console.log('keyless: add account request');
    createAddAccountPopup(requestHandler, tab, request, domain);
  } else {
    console.log('keyless: registered, proceed to sign');
    const keylessAuthData =
      await KeylessKeychainModule.checkKeylessRegistration(
        request,
        domain,
        tab,
      );
    if (!keylessAuthData) {
      console.log('keyless: reauthentication or new registration');
      createRegisterKeylessKeychainPopup(requestHandler, tab, request, domain);
    } else {
      console.log('keyless: proceed to sign');
      performKeylessOperation(requestHandler, tab, request, domain);
    }
  }
};

const createAnonymousKeylessOpPopup = async (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
) => {
  const callback = async () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.ANONYMOUS_KEYLESS_OP,
      requestHandler,
      data: request,
      tab,
      domain,
    });
  };
  createPopup(callback, requestHandler);
};

const createAddAccountPopup = (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
) => {
  const callback = async () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.ADD_ACCOUNT,
      requestHandler,
      data: request,
      tab,
      domain,
    });
  };
  createPopup(callback, requestHandler);
};

const createRegisterKeylessKeychainPopup = (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
) => {
  const callback = async () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.REGISTER_KEYLESS_KEYCHAIN,
      requestHandler,
      data: request,
      tab,
      domain,
    });
  };
  createPopup(callback, requestHandler);
};
