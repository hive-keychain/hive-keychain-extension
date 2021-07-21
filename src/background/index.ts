import AccountModule from 'src/background/logic/account.module';
import RequestsModule from 'src/background/logic/requests.logic';
import { KeychainRequestWrapper } from 'src/interfaces/keychain.interface';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import { BackgroundMessage } from './background-message.interface';
import MkModule from './logic/mk.logic';

const chromeMessageHandler = (
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
    case BackgroundCommand.SEND_REQUEST:
      RequestsModule.sendRequest(
        sender,
        backgroundMessage as KeychainRequestWrapper,
      );
      break;
    case BackgroundCommand.UNLOCK_FROM_DIALOG:
      break;
    case BackgroundCommand.ACCEPT_TRANSACTION:
      break;
  }
};

chrome.runtime.onMessage.addListener(chromeMessageHandler);
