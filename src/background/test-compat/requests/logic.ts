import { KeylessKeychainModule } from '@background/keyless-keychain.module';
import {
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { anonymousRequests as anonymousRequestTypes } from 'src/utils/requests.utils';
import { performKeylessOperation, performOperationFromIndex } from '../index';
import { createPopup } from './dialog-lifecycle';
import { RequestsHandler } from './request-handler';

type TransferKeychainRequest = Extract<
  KeychainRequest,
  { type: KeychainRequestTypes.transfer }
>;

const sendAnswerError = async (
  key: string,
  tab: number,
  data: KeychainRequest,
) => {
  chrome.runtime.sendMessage({
    command: DialogCommand.ANSWER_REQUEST,
    msg: {
      success: false,
      error: key,
      result: null,
      data,
      message: await chrome.i18n.getMessage(key),
    },
    tab,
  });
};

const sendPopupMessage = async (
  command: string,
  requestHandler: RequestsHandler,
  data: KeychainRequest,
  tab: number,
  domain: string,
  extra: Record<string, unknown> = {},
) => {
  chrome.runtime.sendMessage({
    command,
    requestHandler,
    data,
    tab,
    domain,
    ...extra,
  });
};

export const initializeWallet = (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
) => {
  createPopup(async () => {
    await sendAnswerError('bgd_init_no_wallet', tab, request);
  }, requestHandler);
};

export const addAccountToEmptyWallet = (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
) => {
  createPopup(async () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.REGISTER,
      msg: {
        success: false,
        message: await chrome.i18n.getMessage('popup_html_register'),
      },
      requestHandler,
      data: request,
      tab,
      domain,
    });
  }, requestHandler);
};

export const unlockWallet = (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
  command = DialogCommand.UNLOCK,
) => {
  createPopup(async () => {
    chrome.runtime.sendMessage({
      command,
      msg: {
        success: false,
        error: 'locked',
        result: null,
        data: request,
        message: await chrome.i18n.getMessage('bgd_auth_locked'),
        display_msg: await chrome.i18n.getMessage('bgd_auth_locked_desc'),
      },
      tab,
      domain,
    });
  }, requestHandler);
};

export const addAccountRequest = (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
  account?: LocalAccount,
) => {
  createPopup(async () => {
    if (account) {
      chrome.runtime.sendMessage({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error: 'popup_accounts_already_registered',
          result: null,
          data: request,
          message: await chrome.i18n.getMessage(
            'popup_accounts_already_registered',
          ),
        },
        tab,
      });
      return;
    }
    chrome.runtime.sendMessage({
      command: DialogCommand.ADD_ACCOUNT,
      requestHandler,
      data: request,
      tab,
      domain,
    });
  }, requestHandler);
};

export const anonymousRequests = (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
  accounts: LocalAccount[],
  rpc: Rpc,
) => {
  createPopup(async () => {
    if (!accounts?.length) {
      await sendAnswerError('bgd_auth_no_active', tab, request);
      return;
    }
    chrome.runtime.sendMessage({
      command: DialogCommand.SEND_DIALOG_CONFIRM,
      requestHandler,
      data: request,
      tab,
      domain,
      rpc,
      accounts,
    });
  }, requestHandler);
};

export const missingUser = (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  _username: string,
) => {
  createPopup(async () => {
    await sendAnswerError('bgd_auth_no_account', tab, request);
  }, requestHandler);
};

export const missingKey = (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  _username: string,
  _typeWif: string,
) => {
  createPopup(async () => {
    await sendAnswerError('bgd_auth_no_key', tab, request);
  }, requestHandler);
};

export const transferRequest = (
  requestHandler: RequestsHandler,
  tab: number,
  request: TransferKeychainRequest,
  domain: string,
  accounts: LocalAccount[],
  rpc: Rpc,
  account?: LocalAccount,
) => {
  createPopup(async () => {
    if (!accounts?.length || !account?.keys?.active) {
      await sendAnswerError('bgd_auth_transfer_no_active', tab, request);
      return;
    }
    if (request.memo?.startsWith('#') && !account.keys.memo) {
      await sendAnswerError('bgd_auth_transfer_no_memo', tab, request);
      return;
    }
    chrome.runtime.sendMessage({
      command: DialogCommand.SEND_DIALOG_CONFIRM,
      requestHandler,
      data: request,
      tab,
      domain,
      rpc,
      accounts,
    });
  }, requestHandler);
};

export const requestWithConfirmation = (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
  rpc: Rpc,
) => {
  createPopup(async () => {
    chrome.runtime.sendMessage({
      command: DialogCommand.SEND_DIALOG_CONFIRM,
      requestHandler,
      data: request,
      tab,
      domain,
      rpc,
    });
  }, requestHandler);
};

export const requestWithoutConfirmation = async (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
) => {
  await performOperationFromIndex(requestHandler, tab, request);
};

export const keylessKeychainRequest = async (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
) => {
  const keylessAuthData =
    await KeylessKeychainModule.getKeylessRegistrationInfo(
      request,
      domain,
      tab,
    );

  if (
    anonymousRequestTypes.includes(request.type) &&
    (!request.username || request.username.trim() === '')
  ) {
    await requestHandler.setIsKeyless(true);
    await requestHandler.setIsWaitingForConfirmation(!keylessAuthData);
    createPopup(async () => {
      await sendPopupMessage(
        DialogCommand.ANONYMOUS_KEYLESS_OP,
        requestHandler,
        request,
        tab,
        domain,
      );
    }, requestHandler);
    return;
  }

  if (request.type === KeychainRequestTypes.addAccount) {
    createPopup(async () => {
      await sendPopupMessage(
        DialogCommand.ADD_ACCOUNT,
        requestHandler,
        request,
        tab,
        domain,
      );
    }, requestHandler);
    return;
  }

  if (
    request.type === KeychainRequestTypes.swap ||
    request.type === KeychainRequestTypes.encodeWithKeys
  ) {
    createPopup(async () => {
      chrome.runtime.sendMessage({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          message: await chrome.i18n.getMessage(
            'dialog_keyless_unsupported_operation',
          ),
        },
      });
    }, requestHandler);
    return;
  }

  if (!keylessAuthData) {
    await requestHandler.setIsKeyless(true);
    await requestHandler.setIsWaitingForConfirmation(true);
    createPopup(async () => {
      await sendPopupMessage(
        DialogCommand.REGISTER_KEYLESS_KEYCHAIN,
        requestHandler,
        request,
        tab,
        domain,
      );
    }, requestHandler);
    return;
  }

  await performKeylessOperation(requestHandler, tab, request, domain);
};
