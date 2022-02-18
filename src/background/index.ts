import AccountModule from '@background/account';
import AutolockModule from '@background/autolock.module';
import ClaimModule from '@background/claim.module';
import LocalStorageModule from '@background/local-storage.module';
import RPCModule from '@background/rpc.module';
import SettingsModule from '@background/settings.module';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import { BackgroundMessage } from './background-message.interface';
import MkModule from './mk.module';

(async () => {
  Logger.log('Initializing background tasks');
  await LocalStorageModule.checkAndUpdateLocalStorage();
  ClaimModule.start();
  AutolockModule.start();
  AutolockModule.set(
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.AUTOLOCK,
    ),
  );
})();

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
    // case BackgroundCommand.SEND_REQUEST:
    //   const requestHandler = getRequestHandler();
    //   if (requestHandler) {
    //     requestHandler.closeWindow();
    //   }
    //   initRequestHandler().sendRequest(
    //     sender,
    //     backgroundMessage as KeychainRequestWrapper,
    //   );
    //   break;
    // case BackgroundCommand.UNLOCK_FROM_DIALOG: {
    //   const { mk, domain, data, tab } = backgroundMessage.value;
    //   if (await MkUtils.login(mk)) {
    //     MkModule.saveMk(mk);
    //     ClaimModule.loadClaims();
    //     init(data.msg.data, tab, domain);
    //   } else {
    //     chrome.runtime.sendMessage({
    //       ...data,
    //       command: DialogCommand.WRONG_MK,
    //     });
    //   }
    //   break;
    // }
    // case BackgroundCommand.REGISTER_FROM_DIALOG: {
    //   const { mk, domain, data, tab } = backgroundMessage.value;
    //   MkModule.saveMk(mk);

    //   Logger.log(mk, domain, data, tab);
    //   init(data, tab, domain);

    //   break;
    // }
    // case BackgroundCommand.ACCEPT_TRANSACTION:
    //   const { keep, data, tab, domain } = backgroundMessage.value;
    //   performOperation(data, tab, domain, keep);
    //   break;
    case BackgroundCommand.UPDATE_AUTOLOCK:
      AutolockModule.set(backgroundMessage.value);
      break;
    case BackgroundCommand.SEND_BACK_SETTINGS:
      SettingsModule.sendBackImportedFileContent(
        JSON.parse(backgroundMessage.value),
      );
      break;
  }
};

chrome.runtime.onMessage.addListener(chromeMessageHandler);
