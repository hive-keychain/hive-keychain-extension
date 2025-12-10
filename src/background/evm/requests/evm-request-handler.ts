import { initEvmRequestHandler } from '@background/evm/requests/init';
import { removeWindow } from '@background/multichain/dialog-lifecycle';
import {
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

type RequestData = {
  tab?: number;
  request?: EvmRequest;
  request_id?: number;
};
export class EvmRequestHandler {
  requestsData: RequestData[];
  accounts: EvmAccount[];
  windowId: number | undefined;
  constructor() {
    this.requestsData = [];
    this.accounts = [];
    this.windowId = undefined;
  }

  async initFromLocalStorage(
    requestsData: RequestData[],
    accounts: EvmAccount[],
    windowId?: number,
  ) {
    this.requestsData = requestsData;
    this.accounts = accounts;
    this.windowId = windowId;
  }

  closeWindow() {
    console.log('closeWindow in EvmRequestHandler', this.windowId);
    if (this.windowId) {
      console.log(this.windowId, 'windowId in closeWindow');
      removeWindow(this.windowId);
    }
  }

  reset(resetWinId: boolean) {
    if (resetWinId) {
      this.removeFromLocalStorage();
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

  sendRequest(
    sender: chrome.runtime.MessageSender,
    msg: KeychainEvmRequestWrapper,
  ) {
    this.requestsData.push({
      tab: sender.tab!.id,
      request: msg.request,
      request_id: msg.request_id,
    });
    this.saveInLocalStorage();

    initEvmRequestHandler(msg.request, sender.tab!.id, msg.dappInfo, this);

    // AnalyticsModule.sendData(msg.request.type, msg.domain);
  }

  async removeRequestById(requestId: number) {
    console.log(requestId, 'requestId in removeRequestById');

    console.log(
      this.requestsData,
      'requestsData before filter in removeRequestById',
    );

    this.requestsData = this.requestsData.filter(
      (request: RequestData) => request.request_id !== requestId,
    );

    console.log(this.requestsData, 'requestsData in removeRequestById');
    await this.saveInLocalStorage();

    console.log(
      this.requestsData.length,
      'requestsData.length in removeRequestById',
    );

    if (this.requestsData.length === 0) {
      this.closeWindow();
    }
  }

  // Local storage methods

  static async getFromLocalStorage() {
    const requestHandlersParams =
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.__EVM_REQUEST_HANDLER,
      );

    const handler = new EvmRequestHandler();
    if (requestHandlersParams) {
      await handler.initFromLocalStorage(
        requestHandlersParams.requestsData,
        requestHandlersParams.accounts,
        requestHandlersParams.windowId,
      );
    }
    const mk = await VaultUtils.getValueFromVault(VaultKey.__MK);
    if (mk)
      handler.accounts = await EvmWalletUtils.rebuildAccountsFromLocalStorage(
        mk,
      );
    return handler;
  }

  async saveInLocalStorage() {
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.__EVM_REQUEST_HANDLER,
      {
        requestsData: this.requestsData,
        windowId: this.windowId,
        accounts: this.accounts,
      },
    );
  }

  async removeFromLocalStorage() {
    await LocalStorageUtils.removeFromLocalStorage(
      LocalStorageKeyEnum.__EVM_REQUEST_HANDLER,
    );
  }
}
