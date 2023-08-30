import AccountModule from '@background/account';
import AutolockModule from '@background/autolock.module';
import ClaimModule from '@background/claim.module';
import LocalStorageModule from '@background/local-storage.module';
import init from '@background/requests/init';
import { performOperation } from '@background/requests/operations';
import { RequestsHandler } from '@background/requests/request-handler';
import RPCModule from '@background/rpc.module';
import SettingsModule from '@background/settings.module';
import getMessage from '@background/utils/i18n.utils';
import {
  KeychainRequest,
  KeychainRequestWrapper,
} from '@interfaces/keychain.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { sendIncompleteDataResponse } from 'src/content-scripts/web-interface/response.logic';
import { KeychainRequestsUtils } from 'src/utils/keychain-requests.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import { PluginsUtils } from 'src/utils/plugins.utils';
import { BackgroundMessage } from './background-message.interface';
import MkModule from './mk.module';

/* istanbul ignore next */
(async () => {
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
})();
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
      processRequest(backgroundMessage as KeychainRequestWrapper, sender);
      break;
    case BackgroundCommand.UNLOCK_FROM_DIALOG: {
      const { mk, domain, data, tab } = backgroundMessage.value;
      const login = await MkModule.login(mk);
      if (login) {
        MkModule.saveMk(mk);
        init(
          data.msg.data,
          tab,
          domain,
          await RequestsHandler.getFromLocalStorage(),
        );
      } else {
        chrome.runtime.sendMessage({
          ...data,
          command: DialogCommand.WRONG_MK,
        });
      }
      break;
    }
    case BackgroundCommand.REGISTER_FROM_DIALOG: {
      const { mk, domain, data, tab } = backgroundMessage.value;
      MkModule.saveMk(mk);
      init(data, tab, domain, await RequestsHandler.getFromLocalStorage());
      break;
    }
    case BackgroundCommand.ACCEPT_TRANSACTION:
      const { keep, data, tab, domain } = backgroundMessage.value;
      performOperation(
        await RequestsHandler.getFromLocalStorage(),
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

const processRequest = async (
  backgroundMessage: KeychainRequestWrapper,
  sender: any,
) => {
  const requestHandler = await RequestsHandler.getFromLocalStorage();
  if (requestHandler) {
    requestHandler.closeWindow();
  }
  new RequestsHandler().sendRequest(sender, backgroundMessage);
};

const externalMessagesHandler = (
  externalMessage: any,
  sender: chrome.runtime.MessageSender,
) => {
  if (PluginsUtils.isPluginWhitelisted(sender.id!)) {
    const { error, value } = KeychainRequestsUtils.validateRequest(
      externalMessage as KeychainRequest,
    );
    if (!error) {
      processRequest(
        {
          command: 'sendRequest',
          domain: sender.id,
          request: value,
          request_id: value.request_id,
        } as KeychainRequestWrapper,
        sender,
      );
    } else {
      sendIncompleteDataResponse(value!, error, sender.id);
    }
  } else {
    sendIncompleteDataResponse(
      externalMessage!,
      'Your extension has not been whitelisted! Please contact us on Discord!',
      sender.id,
    );
  }
};

export const performOperationFromIndex = async (
  requestHandler: RequestsHandler,
  tab: number,
  request: KeychainRequest,
  domain: string,
) => {
  performOperation(requestHandler, request, tab!, domain, false);
};

chrome.runtime.onMessage.addListener(chromeMessageHandler);

chrome.runtime.onMessageExternal.addListener(externalMessagesHandler);
