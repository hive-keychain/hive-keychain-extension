import AutoStakeTokensModule from '@background/auto-stake-tokens.module';
import { AccountModule } from '@background/hive/modules/account.module';
import AutolockModule from '@background/hive/modules/autolock.module';
import ClaimModule from '@background/hive/modules/claim.module';
import LocalStorageModule from '@background/hive/modules/local-storage.module';
import { MultisigModule } from '@background/hive/modules/multisig.module';
import RPCModule from '@background/hive/modules/rpc.module';
import SettingsModule from '@background/hive/modules/settings.module';
import { initHiveRequestHandler } from '@background/hive/requests/init';
import { KeylessKeychainModule } from '@background/keyless-keychain.module';
import { BackgroundMessage } from '@background/multichain/background-message.interface';
import getMessage from '@background/utils/i18n.utils';
import {
  KeychainRequest,
  KeychainRequestWrapper,
} from '@interfaces/keychain.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import MkModule from './modules/mk.module';
import { HiveRequestsHandler } from './requests/hive-request-handler';
import { performHiveOperation } from './requests/operations/perform-operation';

import { VaultKey } from '@reference-data/vault-message-key.enum';
import VaultUtils from 'src/utils/vault.utils';

/* istanbul ignore next */
const initializeServiceWorker = async () => {
  Logger.info('Starting Hive service worker');
  await RPCModule.init();
  LocalStorageUtils.removeFromLocalStorage(LocalStorageKeyEnum.__MK);
  Logger.info('Initializing background tasks');
  await LocalStorageModule.checkAndUpdateLocalStorage();
  ClaimModule.start();
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
//@ts-ignore
chrome.i18n.getMessage = getMessage;
/* istanbul ignore next */
const chromeMessageHandler = async (
  backgroundMessage: BackgroundMessage,
  sender: chrome.runtime.MessageSender,
  sendResp: (response?: any) => void,
) => {
  switch (backgroundMessage.command) {
    case BackgroundCommand.GET_MK:
      MkModule.sendBackMk();
      break;
    case BackgroundCommand.SAVE_MK:
      MkModule.saveMk(backgroundMessage.value);
      break;
    case BackgroundCommand.IMPORT_ACCOUNTS:
      AccountModule.sendBackImportedAccounts(backgroundMessage.value);
      break;
    case BackgroundCommand.SAVE_RPC:
      RPCModule.setActiveRpc(backgroundMessage.value);
      break;
    case BackgroundCommand.SEND_REQUEST:
      const requestHandler = await HiveRequestsHandler.getFromLocalStorage();
      if (requestHandler) {
        requestHandler.closeWindow();
      }
      new HiveRequestsHandler().sendRequest(
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
          initHiveRequestHandler(
            data.msg.data,
            tab,
            domain,
            await HiveRequestsHandler.getFromLocalStorage(),
          );
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
      const { mk, domain, data, tab } = backgroundMessage.value;
      MkModule.saveMk(mk);
      initHiveRequestHandler(
        data,
        tab,
        domain,
        await HiveRequestsHandler.getFromLocalStorage(),
      );
      break;
    }
    case BackgroundCommand.ACCEPT_TRANSACTION:
      const { keep, data, tab, domain, options } = backgroundMessage.value;
      performHiveOperation(
        await HiveRequestsHandler.getFromLocalStorage(),
        data,
        tab,
        domain,
        keep,
        options,
      );
      break;
    case BackgroundCommand.UPDATE_AUTOLOCK:
      AutolockModule.set(backgroundMessage.value);
      break;
    case BackgroundCommand.SEND_BACK_SETTINGS:
      SettingsModule.sendBackImportedFileContent(
        JSON.parse(backgroundMessage.value),
      );
      break;
    case BackgroundCommand.KEYLESS_KEYCHAIN:
      KeylessKeychainModule.handleOperation(
        backgroundMessage.value.requestHandler,
        backgroundMessage.value.data,
        backgroundMessage.value.domain,
        backgroundMessage.value.tab,
      );
      break;
    case BackgroundCommand.KEYLESS_KEYCHAIN_REGISTER:
      KeylessKeychainModule.register(
        backgroundMessage.value.requestHandler,
        backgroundMessage.value.data,
        backgroundMessage.value.domain,
        backgroundMessage.value.tab,
      );
      break;
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
) => {
  performHiveOperation(requestHandler, request, tab!, request.domain, false);
};

export const HiveServiceWorker = {
  initializeServiceWorker,
};

export const performKeylessOperation = async (
  requestHandler: HiveRequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
) => {
  KeylessKeychainModule.handleOperation(requestHandler, request, domain, tab);
};

chrome.runtime.onMessage.addListener(chromeMessageHandler);
