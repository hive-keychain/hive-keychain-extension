import { initEvmRequestHandler } from '@background/evm/requests/init';
import {
  getNextDialogRequestOrder,
  syncSharedDialogWindow,
} from '@background/multichain/dialog-coordinator';
import { removeWindow } from '@background/multichain/dialog-lifecycle';
import {
  EvmDappInfo,
  EvmRequest,
  KeychainEvmRequestWrapper,
} from '@interfaces/evm-provider.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import VaultUtils from 'src/utils/vault.utils';

if (!process.env.IS_FIREFOX) {
  //@ts-ignore
  global.window = { crypto };
}

export type EvmRequestData = {
  tab?: number;
  request?: EvmRequest;
  request_id?: number;
  dappInfo?: EvmDappInfo;
  arrivalOrder?: number;
};
export class EvmRequestHandler {
  requestsData: EvmRequestData[];
  accounts: EvmAccount[];
  windowId: number | undefined;
  constructor() {
    this.requestsData = [];
    this.accounts = [];
    this.windowId = undefined;
  }

  async initFromLocalStorage(
    requestsData: EvmRequestData[],
    // accounts: EvmAccount[],
    windowId?: number,
  ) {
    this.requestsData = requestsData;
    // this.accounts = accounts;
    this.windowId = windowId;
  }

  closeWindow() {
    if (this.windowId) {
      removeWindow(this.windowId);
      this.windowId = undefined;
    }
  }

  reset(resetWinId: boolean) {
    if (resetWinId) {
      EvmRequestHandler.removeFromLocalStorage();
    } else {
      this.requestsData = [];
      this.accounts = [];

      this.saveInLocalStorage();
    }
  }

  setWindowId(windowId?: number) {
    this.windowId = windowId;
  }

  setKeys(key: string, publicKey: string) {}

  async sendRequest(
    sender: chrome.runtime.MessageSender,
    msg: KeychainEvmRequestWrapper,
  ) {
    const arrivalOrder = await getNextDialogRequestOrder();
    this.requestsData.push({
      tab: sender.tab!.id,
      request: msg.request,
      request_id: msg.request_id,
      dappInfo: msg.dappInfo,
      arrivalOrder,
    });
    await this.saveInLocalStorage();

    await initEvmRequestHandler(msg.request, sender.tab!.id, msg.dappInfo, this);

    // AnalyticsModule.sendData(msg.request.type, msg.domain);
  }

  getRequestData(requestId: number) {
    return this.requestsData.find(
      (request) => request.request_id === requestId,
    );
  }

  getRequest(requestId: number) {
    const requestData = this.getRequestData(requestId);
    return requestData?.request;
  }

  setRequest(requestId: number, request: EvmRequest) {
    for (const requestData of this.requestsData) {
      if (requestData.request_id === requestId) {
        requestData.request = request;
        break;
      }
    }
    this.saveInLocalStorage();
  }

  async removeRequestById(
    requestId: number,
    tab: number,
    shouldSyncDialog = true,
  ) {
    this.requestsData = this.requestsData.filter(
      (requestData: EvmRequestData) => {
        if (requestData.request_id === requestId && requestData.tab === tab) {
          return false;
        }
        return true;
      },
    );

    await this.saveInLocalStorage();
    if (shouldSyncDialog) {
      await syncSharedDialogWindow();
    }
  }

  // Local storage methods

  static async getFromLocalStorage() {
    const windowId = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.DIALOG_WINDOW_ID,
    );
    const requestHandlersParams =
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.__EVM_REQUEST_HANDLER,
      );

    const handler = new EvmRequestHandler();
    handler.windowId = windowId;
    if (requestHandlersParams) {
      await handler.initFromLocalStorage(
        requestHandlersParams.requestsData,
        // requestHandlersParams.accounts,
        windowId,
      );
    }
    const mk = await VaultUtils.getValueFromVault(VaultKey.__MK);
    if (mk)
      handler.accounts =
        await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);
    return handler;
  }

  async saveInLocalStorage() {
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.__EVM_REQUEST_HANDLER,
      {
        requestsData: this.requestsData,
      },
    );
  }

  static async removeFromLocalStorage() {
    await LocalStorageUtils.removeFromLocalStorage(
      LocalStorageKeyEnum.__EVM_REQUEST_HANDLER,
    );
  }
}
