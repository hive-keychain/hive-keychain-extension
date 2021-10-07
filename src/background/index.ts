import AccountModule from '@background/account';
import ClaimModule from '@background/claim.module';
import KeychainifyModule from '@background/keychainify.module';
import RequestsModule from '@background/requests';
import RPCModule from '@background/rpc.module';
import { KeychainRequestWrapper } from '@interfaces/keychain.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { BackgroundMessage } from './background-message.interface';
import MkModule from './mk.module';

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
    case BackgroundCommand.SAVE_RPC:
      RPCModule.setActiveRpc(backgroundMessage.value);
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
    case BackgroundCommand.SAVE_ENABLE_KEYCHAINIFY:
      KeychainifyModule.saveKeychainify(backgroundMessage.value);
      break;
    case BackgroundCommand.UPDATE_CLAIMS:
      ClaimModule.updateClaims(backgroundMessage.value);
      break;
  }
};

chrome.runtime.onMessage.addListener(chromeMessageHandler);
