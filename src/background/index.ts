import AccountModule from 'src/background/logic/account.module';
import RPCModule from 'src/background/logic/rpc.module';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import { BackgroundMessage } from './background-message.interface';
import MkModule from './logic/mk.module';

const chromeMessageHandler = (
  backgroundMessage: BackgroundMessage,
  sender: any,
  sendResp: any,
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
  }
};

chrome.runtime.onMessage.addListener(chromeMessageHandler);
