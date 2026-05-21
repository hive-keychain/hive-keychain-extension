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
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import {
  getHostnameFromMessageSender,
  getOriginFromMessageSender,
} from 'src/utils/browser-origin.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import VaultUtils from 'src/utils/vault.utils';

if (!process.env.IS_FIREFOX) {
  //@ts-ignore
  global.window = { crypto };
}

let evmRequestHandlerMutationQueue: Promise<void> = Promise.resolve();

export type EvmRequestData = {
  tab?: number;
  request?: EvmRequest;
  request_id?: number;
  dappInfo?: EvmDappInfo;
  arrivalOrder?: number;
  dialogCommand?: DialogCommand;
  dialogData?: Record<string, unknown>;
};

export type EvmRequestLocator = {
  requestId: number;
  tab: number;
  origin: string;
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

  async reset(resetWinId: boolean) {
    if (resetWinId) {
      await EvmRequestHandler.removeFromLocalStorage();
    } else {
      this.accounts = [];

      await EvmRequestHandler.withPersistedRequestsData(this, () => []);
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
    const canonicalOrigin =
      getOriginFromMessageSender(sender) ?? msg.dappInfo.origin;
    const canonicalDomain =
      getHostnameFromMessageSender(sender) ?? msg.dappInfo.domain ?? '';
    await EvmRequestHandler.withPersistedRequestsData(
      this,
      async (requestsData) => {
        const arrivalOrder = await getNextDialogRequestOrder();
        return [
          ...requestsData,
          {
            tab: sender.tab!.id,
            request: msg.request,
            request_id: msg.request_id,
            dappInfo: {
              ...msg.dappInfo,
              origin: canonicalOrigin,
              domain: canonicalDomain,
            },
            arrivalOrder,
          },
        ];
      },
    );

    await initEvmRequestHandler(
      msg.request,
      sender.tab!.id,
      {
        ...msg.dappInfo,
        origin: canonicalOrigin,
        domain: canonicalDomain,
      },
      this,
    );

    // AnalyticsModule.sendData(msg.request.type, msg.domain);
  }

  getRequestData(requestId: number) {
    return this.requestsData.find(
      (request) => request.request_id === requestId,
    );
  }

  getRequestDataByLocator(locator: EvmRequestLocator) {
    return this.requestsData.find((requestData) =>
      EvmRequestHandler.isRequestLocatorMatch(requestData, locator),
    );
  }

  getRequest(requestId: number) {
    const requestData = this.getRequestData(requestId);
    return requestData?.request;
  }

  async setRequest(requestId: number, request: EvmRequest) {
    await EvmRequestHandler.withPersistedRequestsData(this, (requestsData) =>
      requestsData.map((requestData) =>
        requestData.request_id === requestId
          ? { ...requestData, request }
          : requestData,
      ),
    );
  }

  async setRequestDialog(
    requestId: number,
    tab: number,
    dialogCommand?: DialogCommand,
    dialogData?: Record<string, unknown>,
  ) {
    await EvmRequestHandler.withPersistedRequestsData(this, (requestsData) =>
      requestsData.map((requestData) =>
        requestData.request_id === requestId && requestData.tab === tab
          ? { ...requestData, dialogCommand, dialogData }
          : requestData,
      ),
    );
  }

  async setRequestDialogByLocator(
    locator: EvmRequestLocator,
    dialogCommand?: DialogCommand,
    dialogData?: Record<string, unknown>,
  ) {
    await EvmRequestHandler.withPersistedRequestsData(this, (requestsData) =>
      requestsData.map((requestData) =>
        EvmRequestHandler.isRequestLocatorMatch(requestData, locator)
          ? { ...requestData, dialogCommand, dialogData }
          : requestData,
      ),
    );
  }

  async removeRequestById(
    requestId: number,
    tab: number,
    shouldSyncDialog = true,
  ) {
    await EvmRequestHandler.withPersistedRequestsData(this, (requestsData) =>
      requestsData.filter(
        (requestData: EvmRequestData) =>
          requestData.request_id !== requestId || requestData.tab !== tab,
      ),
    );
    if (shouldSyncDialog) {
      await syncSharedDialogWindow();
    }
  }

  async removeRequestByLocator(
    locator: EvmRequestLocator,
    shouldSyncDialog = true,
  ) {
    await EvmRequestHandler.withPersistedRequestsData(this, (requestsData) =>
      requestsData.filter(
        (requestData: EvmRequestData) =>
          !EvmRequestHandler.isRequestLocatorMatch(requestData, locator),
      ),
    );
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
    await EvmRequestHandler.enqueueStorageMutation(async () => {
      await LocalStorageUtils.removeFromLocalStorage(
        LocalStorageKeyEnum.__EVM_REQUEST_HANDLER,
      );
    });
  }

  private static async withPersistedRequestsData(
    handler: EvmRequestHandler,
    mutate: (
      requestsData: EvmRequestData[],
    ) => EvmRequestData[] | Promise<EvmRequestData[]>,
  ) {
    await EvmRequestHandler.enqueueStorageMutation(async () => {
      const requestHandlersParams =
        await LocalStorageUtils.getValueFromLocalStorage(
          LocalStorageKeyEnum.__EVM_REQUEST_HANDLER,
        );
      const requestsData = requestHandlersParams?.requestsData ?? [];
      const nextRequestsData = await mutate(requestsData);

      handler.requestsData = nextRequestsData;
      await handler.saveInLocalStorage();
    });
  }

  private static enqueueStorageMutation<T>(mutation: () => Promise<T>) {
    const runMutation = evmRequestHandlerMutationQueue.then(
      mutation,
      mutation,
    );
    evmRequestHandlerMutationQueue = runMutation.then(
      () => undefined,
      () => undefined,
    );
    return runMutation;
  }

  private static isRequestLocatorMatch(
    requestData: EvmRequestData,
    locator: EvmRequestLocator,
  ) {
    return (
      requestData.request_id === locator.requestId &&
      requestData.tab === locator.tab &&
      requestData.dappInfo?.origin === locator.origin
    );
  }
}
