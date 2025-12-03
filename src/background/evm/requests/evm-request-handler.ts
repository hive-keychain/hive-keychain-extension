import { initEvmRequestHandler } from '@background/evm/requests/init';
import { removeWindow } from '@background/multichain/dialog-lifecycle';
import {
  EvmRequest,
  KeychainEvmRequestWrapper,
} from '@interfaces/evm-provider.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import MkUtils from '@popup/hive/utils/mk.utils';
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

  async initFromLocalStorage(data: RequestData, accounts: EvmAccount[]) {
    this.data = data;
    this.accounts = accounts;
  }

  closeWindow() {
    if (this.data.windowId) {
      removeWindow(this.data.windowId);
    }
  }

  reset(resetWinId: boolean) {
    if (resetWinId) {
      EvmRequestHandler.removeFromLocalStorage(this.data.request_id!);
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
    initEvmRequestHandler(msg.request, this.data.tab, msg.dappInfo, this);

    // AnalyticsModule.sendData(msg.request.type, msg.domain);
  }

  static async getFromLocalStorage(requestId: number) {
    const requestHandlersParams =
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.__EVM_REQUEST_HANDLER,
      );

    let params;
    if (requestHandlersParams && requestHandlersParams[requestId]) {
      params = requestHandlersParams[requestId];
    }

    const handler = new EvmRequestHandler();
    if (params) {
      await handler.initFromLocalStorage(params, []);
    }
    const mk = await MkUtils.getMkFromLocalStorage();
    if (mk)
      handler.accounts = await EvmWalletUtils.rebuildAccountsFromLocalStorage(
        mk,
      );
    return handler;
  }

  static async getFromLocalStorageByWindowId(windowId: number) {
    const requestHandlersParams =
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.__EVM_REQUEST_HANDLER,
      );
    if (requestHandlersParams) {
      for (const requestId in requestHandlersParams) {
        if (requestHandlersParams[requestId].windowId === windowId) {
          const handler = new EvmRequestHandler();
          await handler.initFromLocalStorage(
            requestHandlersParams[requestId],
            [],
          );
          return handler;
        }
      }
    } else {
      return null;
    }
  }

  async saveInLocalStorage() {
    let requestHandlersParams =
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.__EVM_REQUEST_HANDLER,
      );
    if (!requestHandlersParams) {
      requestHandlersParams = {};
    }
    requestHandlersParams[this.data.request_id!] = this.data;

    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.__EVM_REQUEST_HANDLER,
      requestHandlersParams,
    );
  }

  static async removeFromLocalStorage(requestId: number) {
    let requestHandlersParams =
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.__EVM_REQUEST_HANDLER,
      );
    if (requestHandlersParams) {
      delete requestHandlersParams[requestId];
    }
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.__EVM_REQUEST_HANDLER,
      requestHandlersParams,
    );
  }
}
