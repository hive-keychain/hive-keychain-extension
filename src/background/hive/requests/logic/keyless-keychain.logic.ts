import { performKeylessOperation } from '@background/hive/hive-service-worker';
import {
  HiveRequestLocator,
  HiveRequestsHandler,
} from '@background/hive/requests/hive-request-handler';
import { KeylessKeychainModule } from '@background/keyless-keychain.module';
import { createOrUpdateDialog } from '@background/multichain/dialog-lifecycle';
import {
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import { KeylessAuthData } from '@interfaces/keyless-keychain.interface';
import { PendingRequestSource } from '@interfaces/pending-request.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { anonymousRequests } from 'src/utils/requests.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
const toLocator = (
  request: KeychainRequest,
  source: PendingRequestSource,
): HiveRequestLocator | undefined => {
  if (request.request_id == null) return undefined;
  return { requestId: request.request_id, ...source };
};

export const keylessKeychainRequest = async (
  requestHandler: HiveRequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
  source: PendingRequestSource,
) => {
  const keylessAuthData =
    await KeylessKeychainModule.getKeylessRegistrationInfo(
      request,
      domain,
      tab,
    );
  if (
    anonymousRequests.includes(request.type) &&
    (!request.username || request.username.trim() === '')
  ) {
    createAnonymousKeylessOpPopup(
      requestHandler,
      tab,
      request,
      domain,
      keylessAuthData,
      source,
    );
  } else if (request.type === KeychainRequestTypes.addAccount) {
    createAddAccountPopup(requestHandler, tab, request, domain, source);
  } else if (request.type === KeychainRequestTypes.swap) {
    createUnsupportedOperationPopup(
      requestHandler,
      tab,
      request,
      domain,
      source,
    );
  } else if (request.type === KeychainRequestTypes.encodeWithKeys) {
    createUnsupportedOperationPopup(
      requestHandler,
      tab,
      request,
      domain,
      source,
    );
  } else {
    if (!keylessAuthData) {
      createRegisterKeylessKeychainPopup(
        requestHandler,
        tab,
        request,
        domain,
        source,
      );
    } else {
      performKeylessOperation(requestHandler, tab, request, domain, source);
    }
  }
};

const createAnonymousKeylessOpPopup = async (
  requestHandler: HiveRequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
  keylessAuthData: KeylessAuthData | undefined,
  source: PendingRequestSource,
) => {
  const locator = toLocator(request, source);
  if (locator) {
    await requestHandler.setIsKeyless(true, locator);
    await requestHandler.setIsWaitingForConfirmation(
      !keylessAuthData,
      locator,
    );
  }
  const callback = async () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.ANONYMOUS_KEYLESS_OP,
      requestHandler,
      data: request,
      tab,
      domain,
      requestSource: source,
    });
  };
  createOrUpdateDialog(callback, requestHandler);
};

const createAddAccountPopup = (
  requestHandler: HiveRequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
  source: PendingRequestSource,
) => {
  const callback = async () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.ADD_ACCOUNT,
      requestHandler,
      data: request,
      tab,
      domain,
      requestSource: source,
    });
  };
  createOrUpdateDialog(callback, requestHandler);
};

const createRegisterKeylessKeychainPopup = async (
  requestHandler: HiveRequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
  source: PendingRequestSource,
) => {
  const locator = toLocator(request, source);
  if (locator) {
    await requestHandler.setIsKeyless(true, locator);
    await requestHandler.setIsWaitingForConfirmation(true, locator);
  }
  const callback = async () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.REGISTER_KEYLESS_KEYCHAIN,
      requestHandler,
      data: request,
      tab,
      domain,
      requestSource: source,
    });
  };
  createOrUpdateDialog(callback, requestHandler);
};

const createUnsupportedOperationPopup = (
  requestHandler: HiveRequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
  source: PendingRequestSource,
) => {
  const callback = async () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        success: false,
        message: await I18nUtils.getMessage(
          'dialog_keyless_unsupported_operation',
          [
            request.type
              .replace(/([A-Z])/g, ' $1')
              .toLowerCase()
              .replace(/^./, (str) => str.toUpperCase()),
          ],
        ),
        tab: tab,
        request_id: request.request_id,
      },
      requestSource: source,
    });
  };
  createOrUpdateDialog(callback, requestHandler);
};
