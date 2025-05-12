import { performKeylessOperation } from '@background/index';
import { KeylessKeychainModule } from '@background/keyless-keychain.module';
import { createPopup } from '@background/requests/dialog-lifecycle';
import { RequestsHandler } from '@background/requests/request-handler';
import {
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import { KeylessAuthData } from '@interfaces/keyless-keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
export const keylessKeychainRequest = async (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
) => {
  const keylessAuthData = await KeylessKeychainModule.checkKeylessRegistration(
    request,
    domain,
    tab,
  );
  if (!request.username || request.username.trim() === '') {
    createAnonymousKeylessOpPopup(
      requestHandler,
      tab,
      request,
      domain,
      keylessAuthData,
    );
  } else if (request.type === KeychainRequestTypes.addAccount) {
    createAddAccountPopup(requestHandler, tab, request, domain);
  } else if (request.type === KeychainRequestTypes.swap) {
    createUnsupportedOperationPopup(requestHandler, tab, request, domain);
  } else if (request.type === KeychainRequestTypes.encodeWithKeys) {
    createUnsupportedOperationPopup(requestHandler, tab, request, domain);
  } else {
    if (!keylessAuthData) {
      createRegisterKeylessKeychainPopup(requestHandler, tab, request, domain);
    } else {
      performKeylessOperation(requestHandler, tab, request, domain);
    }
  }
};

const createAnonymousKeylessOpPopup = async (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
  keylessAuthData: KeylessAuthData | undefined,
) => {
  await requestHandler.setIsAnonymous(true);
  await requestHandler.setIsWaitingForConfirmation(!keylessAuthData);
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

const createUnsupportedOperationPopup = (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
) => {
  const callback = async () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        success: false,
        message: await chrome.i18n.getMessage(
          'dialog_keyless_unsupported_operation',
          [
            request.type
              .replace(/([A-Z])/g, ' $1')
              .toLowerCase()
              .replace(/^./, (str) => str.toUpperCase()),
          ],
        ),
      },
    });
  };
  createPopup(callback, requestHandler);
};
