import AccountModule from '@background/account';
import AutolockModule from '@background/autolock.module';
import ClaimModule from '@background/claim.module';
import KeychainifyModule from '@background/keychainify.module';
import { initRequestHandler } from '@background/requests';
import init from '@background/requests/init';
import RPCModule from '@background/rpc.module';
import SettingsModule from '@background/settings.module';
import { KeychainRequestWrapper } from '@interfaces/keychain.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import MkUtils from 'src/utils/mk.utils';
import { BackgroundMessage } from './background-message.interface';
import MkModule from './mk.module';

const initBackgroundTasks = async () => {
  console.log('init background tasks');
  await ClaimModule.loadClaims();
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
      initRequestHandler().sendRequest(
        sender,
        backgroundMessage as KeychainRequestWrapper,
      );
      break;
    case BackgroundCommand.UNLOCK_FROM_DIALOG:
      const { mk, domain, data, tab } = backgroundMessage.value;
      console.log('unlocked:', backgroundMessage.value);
      if (await MkUtils.login(mk)) {
        MkModule.saveMk(mk);
        init(data, tab, domain);
      } else {
        chrome.runtime.sendMessage({
          command: DialogCommand.WRONG_MK,
        });
      }
      break;
    case BackgroundCommand.ACCEPT_TRANSACTION:
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
