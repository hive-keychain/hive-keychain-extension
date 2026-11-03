import AutoStakeTokensModule from '@background/auto-stake-tokens.module';
import { AccountModule } from '@background/hive/modules/account.module';
import AutolockModule from '@background/hive/modules/autolock.module';
import ClaimModule from '@background/hive/modules/claim.module';
import { PaidAccountCreationModule } from '@background/hive/modules/paid-account-creation.module';
import { HivePushNotificationsModule } from '@background/hive/modules/hive-push-notifications.module';
import LocalStorageModule from '@background/hive/modules/local-storage.module';
import { MultisigModule } from '@background/hive/modules/multisig.module';
import RPCModule from '@background/hive/modules/rpc.module';
import SettingsModule from '@background/hive/modules/settings.module';
import { initHiveRequestHandler } from '@background/hive/requests/init';
import { KeylessKeychainModule } from '@background/keyless-keychain.module';
import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { getPendingRequestMessageOptions } from '@background/multichain/pending-request.interface';
import {
  KeychainRequest,
  KeychainRequestWrapper,
} from '@interfaces/keychain.interface';
import { PendingRequestSource } from '@interfaces/pending-request.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import { RuntimeMessageSenderUtils } from 'src/utils/runtime-message-sender.utils';
import VaultUtils from 'src/utils/vault.utils';
import MkModule from './modules/mk.module';
import { resolveAcceptedHiveRequest } from './requests/hive-request-dialog-edits';
import { HiveRequestsHandler } from './requests/hive-request-handler';
import { performHiveOperation } from './requests/operations/perform-operation';

/* istanbul ignore next */
const initializeServiceWorker = async () => {
  Logger.info('Starting Hive service worker');
  await RPCModule.init();
  LocalStorageUtils.removeFromLocalStorage(LocalStorageKeyEnum.__MK);
  Logger.info('Initializing background tasks');
  await LocalStorageModule.checkAndUpdateLocalStorage();
  ClaimModule.start();
  PaidAccountCreationModule.start();
  HivePushNotificationsModule.start();
  AutoStakeTokensModule.start();
  AutolockModule.start();
  AutolockModule.set(
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.AUTOLOCK,
    ),
  );
  MultisigModule.start();
};

/* istanbul ignore next */
const chromeMessageHandler = async (
  backgroundMessage: BackgroundMessage,
  sender: chrome.runtime.MessageSender,
  sendResp: (response?: any) => void,
) => {
  if (
    backgroundMessage.command !== BackgroundCommand.SEND_REQUEST &&
    !RuntimeMessageSenderUtils.isInternalExtensionSender(sender)
  ) {
    return;
  }

  switch (backgroundMessage.command) {
    case BackgroundCommand.IMPORT_ACCOUNTS:
      AccountModule.sendBackImportedAccounts(backgroundMessage.value);
      break;
    case BackgroundCommand.SAVE_RPC:
      RPCModule.setActiveRpc(backgroundMessage.value);
      break;
    case BackgroundCommand.SEND_REQUEST:
      let requestHandler = await HiveRequestsHandler.getFromLocalStorage();
      if (!requestHandler) {
        requestHandler = new HiveRequestsHandler();
      }
      await requestHandler.sendRequest(
        sender,
        backgroundMessage as KeychainRequestWrapper,
      );
      break;
    case BackgroundCommand.UNLOCK_FROM_DIALOG: {
      const { mk, domain, data, tab } = backgroundMessage.value;

      if (data.command === DialogCommand.UNLOCK) {
        const login = await MkModule.login(mk);
        if (login) {
          MkModule.saveMk(mk);

          const requestHandler =
            await HiveRequestsHandler.getFromLocalStorage();
          for (const requestData of requestHandler.requestsData) {
            if (
              requestData.tab == null ||
              !requestData.request ||
              !requestData.domain
            ) {
              continue;
            }
            initHiveRequestHandler(
              requestData.request,
              requestData.tab,
              requestData.domain,
              requestHandler,
              requestData.source,
            );
          }
        } else {
          CommunicationUtils.runtimeSendMessage({
            msg: { ...data.msg, wrongMk: true },
            command: DialogCommand.UNLOCK,
          });
        }
      }

      break;
    }
    case BackgroundCommand.REGISTER_FROM_DIALOG: {
      const { mk, domain, data, tab, requestSource } =
        backgroundMessage.value;
      MkModule.saveMk(mk);
      initHiveRequestHandler(
        data,
        tab,
        domain,
        await HiveRequestsHandler.getFromLocalStorage(),
        requestSource,
      );
      break;
    }
    case BackgroundCommand.ACCEPT_TRANSACTION: {
      const { keep, options } = backgroundMessage.value;
      const requestHandler = await HiveRequestsHandler.getFromLocalStorage();
      const resolved = resolveAcceptedHiveRequest(
        requestHandler,
        backgroundMessage.value,
      );
      if (!resolved) {
        Logger.warn('Cannot perform Hive operation: pending request not found');
        break;
      }
      performHiveOperation(
        requestHandler,
        resolved.request,
        resolved.tab,
        resolved.domain,
        keep,
        'dialog',
        options,
        resolved.source,
      );
      break;
    }
    case BackgroundCommand.REJECT_TRANSACTION: {
      const messageValue = backgroundMessage.value;
      const { request_id, tab, domain, requestSource } = messageValue;
      const origin = requestSource?.origin ?? domain;
      if (request_id == null || tab == null || !origin) {
        Logger.warn('Cannot reject Hive operation: missing request locator');
        break;
      }
      const requestHandler = await HiveRequestsHandler.getFromLocalStorage();
      await CommunicationUtils.tabsSendMessage(
        messageValue.tab!,
        {
          command: DialogCommand.ANSWER_REQUEST,
          msg: messageValue,
        },
        getPendingRequestMessageOptions(requestSource),
      );
      await requestHandler.removeRequestByLocator({
        requestId: request_id,
        tab,
        origin,
        frameId: requestSource?.frameId,
        documentId: requestSource?.documentId,
      });
      break;
    }
    case BackgroundCommand.UPDATE_AUTOLOCK:
      AutolockModule.set(backgroundMessage.value);
      break;
    case BackgroundCommand.SEND_BACK_SETTINGS:
      SettingsModule.sendBackImportedFileContent(
        JSON.parse(backgroundMessage.value),
      );
      break;
    case BackgroundCommand.KEYLESS_KEYCHAIN: {
      const requestHandler = await HiveRequestsHandler.getFromLocalStorage();
      const resolved = resolveAcceptedHiveRequest(
        requestHandler,
        backgroundMessage.value,
        true,
      );
      if (!resolved) {
        Logger.warn('Cannot perform keyless Hive operation: pending request not found');
        break;
      }
      KeylessKeychainModule.handleOperation(
        requestHandler,
        resolved.request,
        resolved.domain,
        resolved.tab,
        resolved.source,
      );
      break;
    }
    case BackgroundCommand.KEYLESS_KEYCHAIN_REGISTER: {
      const requestHandler = await HiveRequestsHandler.getFromLocalStorage();
      const resolved = resolveAcceptedHiveRequest(
        requestHandler,
        backgroundMessage.value,
        true,
      );
      if (!resolved) {
        Logger.warn(
          'Cannot register keyless Hive operation: pending request not found',
        );
        break;
      }
      KeylessKeychainModule.register(
        requestHandler,
        resolved.request,
        resolved.domain,
        resolved.tab,
        resolved.source,
      );
      break;
    }
    case BackgroundCommand.PING:
      Logger.log('ping');
      break;
  }
  return true;
};

// When a chrome window is removed, check if there are no window left open
chrome.windows.onRemoved.addListener(() => {
  chrome.windows.getAll(async (windows) => {
    if (windows.length === 0) {
      if (await chrome.offscreen.hasDocument()) {
        VaultUtils.removeFromVault(VaultKey.__MK);
      }
    }
  });
});
export const performOperationFromIndex = async (
  requestHandler: HiveRequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain?: string,
  source?: PendingRequestSource,
) => {
  await performHiveOperation(
    requestHandler,
    request,
    tab!,
    domain ?? request.domain,
    true,
    'silent',
    undefined,
    source,
  );
};

export const HiveServiceWorker = {
  initializeServiceWorker,
};

export const performKeylessOperation = async (
  requestHandler: HiveRequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
  source: PendingRequestSource,
) => {
  KeylessKeychainModule.handleOperation(
    requestHandler,
    request,
    domain,
    tab,
    source,
  );
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (RuntimeMessageSenderUtils.isVaultRuntimeMessage(message)) {
    return false;
  }
  return chromeMessageHandler(message, sender, sendResponse);
});
