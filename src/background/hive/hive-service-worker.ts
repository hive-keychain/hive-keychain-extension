import { AccountModule } from '@background/hive/modules/account.module';
import AutolockModule from '@background/hive/modules/autolock.module';
import ClaimModule from '@background/hive/modules/claim.module';
import LocalStorageModule from '@background/hive/modules/local-storage.module';
import { MultisigModule } from '@background/hive/modules/multisig.module';
import RPCModule from '@background/hive/modules/rpc.module';
import SettingsModule from '@background/hive/modules/settings.module';
import { BackgroundMessage } from '@background/multichain/background-message.interface';
import getMessage from '@background/utils/i18n.utils';
import {
  KeychainRequest,
  KeychainRequestWrapper,
} from '@interfaces/keychain.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import MkModule from './modules/mk.module';
import { HiveRequestsHandler } from './requests/hive-request-handler';
import init from './requests/init';
import { performHiveOperation } from './requests/operations';

const initializeServiceWorker = async () => {
  Logger.info('Starting Hive service worker');
  await RPCModule.init();
  LocalStorageUtils.removeFromLocalStorage(LocalStorageKeyEnum.__MK);
  Logger.info('Initializing background tasks');
  await LocalStorageModule.checkAndUpdateLocalStorage();
  ClaimModule.start();
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
  Logger.log('Background message', backgroundMessage);
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
      console.log('hive background', backgroundMessage);
      const { mk, domain, data, tab } = backgroundMessage.value;

      if (data.command === DialogCommand.UNLOCK) {
        const login = await MkModule.login(mk);
        if (login) {
          MkModule.saveMk(mk);
          init(
            data.msg.data,
            tab,
            domain,
            await HiveRequestsHandler.getFromLocalStorage(),
          );
        } else {
          chrome.runtime.sendMessage({
            ...data,
            command: DialogCommand.WRONG_MK,
          });
        }
      }

      break;
    }
    case BackgroundCommand.REGISTER_FROM_DIALOG: {
      const { mk, domain, data, tab } = backgroundMessage.value;
      MkModule.saveMk(mk);
      init(data, tab, domain, await HiveRequestsHandler.getFromLocalStorage());
      break;
    }
    case BackgroundCommand.ACCEPT_TRANSACTION:
      const { keep, data, tab, domain } = backgroundMessage.value;
      performHiveOperation(
        await HiveRequestsHandler.getFromLocalStorage(),
        data,
        tab,
        domain,
        keep,
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
    case BackgroundCommand.PING:
      Logger.log('ping');
      break;
  }
};

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

chrome.runtime.onMessage.addListener(chromeMessageHandler);