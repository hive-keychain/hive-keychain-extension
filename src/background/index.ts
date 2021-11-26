import AccountModule from '@background/account';
import AutolockModule from '@background/autolock.module';
import ClaimModule from '@background/claim.module';
import KeychainifyModule from '@background/keychainify.module';
import { getRequestHandler, initRequestHandler } from '@background/requests';
import init from '@background/requests/init';
import { performOperation } from '@background/requests/operations';
import RPCModule from '@background/rpc.module';
import SettingsModule from '@background/settings.module';
import { KeychainRequestWrapper } from '@interfaces/keychain.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import MkUtils from 'src/utils/mk.utils';
import { BackgroundMessage } from './background-message.interface';
import MkModule from './mk.module';

const initBackgroundTasks = async () => {
  console.log('init background tasks');
  await ClaimModule.loadClaims();
  await RPCModule.setActiveRpc(
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.CURRENT_RPC,
    ),
  );
};

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
      ClaimModule.loadClaims();
      break;
    case BackgroundCommand.IMPORT_ACCOUNTS:
      AccountModule.sendBackImportedAccounts(backgroundMessage.value);
      break;
    case BackgroundCommand.SAVE_RPC:
      RPCModule.setActiveRpc(backgroundMessage.value);
      break;
    case BackgroundCommand.SEND_REQUEST:
      //TODO : add check for avoiding double transaction
      console.log(backgroundMessage);
      const requestHandler = getRequestHandler();
      if (requestHandler) {
        requestHandler.closeWindow();
      }
      initRequestHandler().sendRequest(
        sender,
        backgroundMessage as KeychainRequestWrapper,
      );
      break;
    case BackgroundCommand.UNLOCK_FROM_DIALOG: {
      const { mk, domain, data, tab } = backgroundMessage.value;
      if (await MkUtils.login(mk)) {
        MkModule.saveMk(mk);
        init(data, tab, domain);
      } else {
        chrome.runtime.sendMessage({
          command: DialogCommand.WRONG_MK,
        });
      }

      break;
    }
    case BackgroundCommand.REGISTER_FROM_DIALOG: {
      Logger.log('Registrating from dialog');
      const { mk, domain, data, tab } = backgroundMessage.value;
      MkModule.saveMk(mk);

      Logger.log(mk, domain, data, tab);
      init(data, tab, domain);

      break;
    }
    case BackgroundCommand.ACCEPT_TRANSACTION:
      const { keep, data, tab } = backgroundMessage.value;
      performOperation(data, tab, keep);
      break;
    case BackgroundCommand.SAVE_ENABLE_KEYCHAINIFY:
      KeychainifyModule.saveKeychainify(backgroundMessage.value);
      break;
    case BackgroundCommand.UPDATE_CLAIMS:
      ClaimModule.updateClaims(backgroundMessage.value);
      break;
    case BackgroundCommand.UPDATE_AUTOLOCK:
      AutolockModule.startAutolock(backgroundMessage.value);
      break;
    case BackgroundCommand.SEND_BACK_SETTINGS:
      SettingsModule.sendBackImportedFileContent(
        JSON.parse(backgroundMessage.value),
      );
      break;
  }
};

chrome.runtime.onMessage.addListener(chromeMessageHandler);
initBackgroundTasks();
