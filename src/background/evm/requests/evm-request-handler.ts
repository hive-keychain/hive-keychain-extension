import { initEvmRequestHandler } from '@background/evm/requests/init';
import { removeWindow } from '@background/multichain/dialog-lifecycle';
import {
  EvmRequest,
  KeychainEvmRequestWrapper,
} from '@interfaces/evm-provider.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

if (!process.env.IS_FIREFOX) {
  //@ts-ignore
  global.window = { crypto };
}

type RequestData = {
  tab?: number;
  request?: EvmRequest;
  request_id?: number;
  confirmed: boolean;
  windowId?: number;
};
export class EvmRequestHandler {
  data: RequestData;
  accounts: EvmAccount[];
  constructor() {
    this.data = { confirmed: false };
    this.accounts = [];
  }

  async initFromLocalStorage(data: RequestData) {
    this.data = data;
  }

  closeWindow() {
    if (this.data.windowId) {
      removeWindow(this.data.windowId);
    }
  }

  reset(resetWinId: boolean) {
    if (resetWinId) {
      EvmRequestHandler.clearLocalStorage();
    } else {
      this.data = {
        confirmed: this.data.confirmed,
        windowId: this.data.windowId,
      };
      this.saveInLocalStorage();
    }
  }

  setConfirmed(confirmed: boolean) {
    this.data.confirmed = confirmed;
  }

  setWindowId(windowId?: number) {
    this.data.windowId = windowId;
  }

  setKeys(key: string, publicKey: string) {}

  sendRequest(
    sender: chrome.runtime.MessageSender,
    msg: KeychainEvmRequestWrapper,
  ) {
    this.data.tab = sender.tab!.id;
    this.data.request = msg.request;
    this.data.request_id = msg.request_id;
    initEvmRequestHandler(msg.request, this.data.tab, msg.domain, this);

    // AnalyticsModule.sendData(msg.request.type, msg.domain);
  }

  static async getFromLocalStorage() {
    const params = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.__EVM_REQUEST_HANDLER,
    );
    const handler = new EvmRequestHandler();
    if (params) {
      await handler.initFromLocalStorage(params);
    }
    return handler;
  }

  async saveInLocalStorage() {
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.__EVM_REQUEST_HANDLER,
      this.data,
    );
  }

  static async clearLocalStorage() {
    await LocalStorageUtils.removeFromLocalStorage(
      LocalStorageKeyEnum.__EVM_REQUEST_HANDLER,
    );
  }
}
