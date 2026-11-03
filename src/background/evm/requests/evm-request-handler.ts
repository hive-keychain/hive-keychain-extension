import { EvmUnrestrictedMethods } from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequestAccountUtils } from '@background/evm/requests/evm-request-account.utils';
import { initEvmRequestHandler } from '@background/evm/requests/init';
import { syncSharedDialogWindow } from '@background/multichain/dialog-coordinator';
import { removeWindow } from '@background/multichain/dialog-lifecycle';
import { PendingRequestAdmission } from '@background/multichain/pending-request-admission';
import {
  getPendingRequestLocator,
  getPendingRequestMessageOptions,
  getPendingRequestSource,
  isPendingRequestSourceMatch,
} from '@background/multichain/pending-request.interface';
import {
  EvmDappInfo,
  EvmRequest,
  KeychainEvmRequestWrapper,
  ProviderRpcErrorList,
} from '@interfaces/evm-provider.interface';
import {
  PendingRequestLocator,
  PendingRequestSource,
} from '@interfaces/pending-request.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import { getHostnameFromMessageSender } from 'src/utils/browser-origin.utils';
import { CommunicationUtils } from 'src/utils/communication.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import { RequestPayloadUtils } from 'src/utils/request-payload.utils';
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

export type EvmRequestLocator = PendingRequestLocator;

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
    const source = getPendingRequestSource(sender);
    if (!source) {
      return;
    }
    const canonicalOrigin = source.origin;
    const canonicalDomain = getHostnameFromMessageSender(sender) ?? '';
    const canonicalDappInfo: EvmDappInfo = {
      ...msg.dappInfo,
      origin: canonicalOrigin,
      domain: canonicalDomain,
      protocol: new URL(canonicalOrigin).protocol,
      requestSource: source,
    };
    const payloadSize = RequestPayloadUtils.getRequestPayloadSize({
      ...msg,
      dappInfo: canonicalDappInfo,
    });

    if (!payloadSize.isValid) {
      await this.sendAdmissionError(
        source,
        msg.request.request_id,
        ProviderRpcErrorList.requestLimitExceeded,
      );
      return;
    }

    if (
      EvmRequestAccountUtils.requiresAccountAuthorization(msg.request) &&
      !(await EvmRequestAccountUtils.isRequestedAccountAuthorizedForOrigin(
        msg.request,
        canonicalOrigin,
      ))
    ) {
      await this.sendAdmissionError(
        source,
        msg.request.request_id,
        ProviderRpcErrorList.unauthorized,
      );
      return;
    }

    let admissionResult;
    try {
      admissionResult = await PendingRequestAdmission.admit(
        {
          chain: 'evm',
          requestId: msg.request_id,
          method: msg.request.method,
          source,
          byteSize: payloadSize.byteSize,
        },
        async (arrivalOrder) => {
          await EvmRequestHandler.withPersistedRequestsData(
            this,
            (requestsData) => [
              ...requestsData,
              {
                tab: source.tab,
                request: msg.request,
                request_id: msg.request_id,
                dappInfo: canonicalDappInfo,
                arrivalOrder,
              },
            ],
          );
        },
      );
    } catch (error) {
      Logger.warn(
        `Unable to persist EVM request for ${source.origin} (${msg.request.method}, ${payloadSize.byteSize} bytes)`,
      );
      await this.sendAdmissionError(
        source,
        msg.request.request_id,
        ProviderRpcErrorList.requestLimitExceeded,
      );
      return;
    }

    if (!admissionResult.accepted) {
      await this.sendAdmissionError(
        source,
        msg.request.request_id,
        admissionResult.reason === 'request_pending'
          ? ProviderRpcErrorList.requestAlreadyPending
          : ProviderRpcErrorList.requestLimitExceeded,
      );
      return;
    }

    await initEvmRequestHandler(
      msg.request,
      source.tab,
      canonicalDappInfo,
      this,
    );
  }

  private async sendAdmissionError(
    source: PendingRequestSource,
    requestId: number,
    error: { code: number; message: string },
  ) {
    await CommunicationUtils.tabsSendMessage(
      source.tab,
      {
        command: BackgroundCommand.SEND_EVM_ERROR,
        value: { requestId, error },
      },
      getPendingRequestMessageOptions(source),
    );
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

  getRequestLocator(requestData: EvmRequestData): EvmRequestLocator | null {
    if (
      requestData.request_id === undefined ||
      requestData.tab === undefined ||
      !requestData.dappInfo?.origin
    ) {
      return null;
    }

    return requestData.dappInfo.requestSource
      ? getPendingRequestLocator(
          requestData.request_id,
          requestData.dappInfo.requestSource,
        )
      : {
          requestId: requestData.request_id,
          tab: requestData.tab,
          frameId: 0,
          origin: requestData.dappInfo.origin,
        };
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
    await this.removeRequests(
      (requestData) =>
        requestData.request_id === requestId && requestData.tab === tab,
    );
    if (shouldSyncDialog) {
      await syncSharedDialogWindow();
    }
  }

  async removeRequestByLocator(
    locator: EvmRequestLocator,
    shouldSyncDialog = true,
  ) {
    await this.removeRequests((requestData) =>
      EvmRequestHandler.isRequestLocatorMatch(requestData, locator),
    );
    if (shouldSyncDialog) {
      await syncSharedDialogWindow();
    }
  }

  async removePendingAccountRequestsForOrigin(
    origin: string,
  ): Promise<EvmRequestData[]> {
    const removedRequests: EvmRequestData[] = [];

    await this.removeRequests((requestData) => {
      const shouldRemove =
        requestData.dappInfo?.origin === origin &&
        !!requestData.request &&
        EvmRequestAccountUtils.requiresAccountAuthorization(
          requestData.request,
        );
      if (shouldRemove) {
        removedRequests.push(requestData);
      }
      return shouldRemove;
    });

    return removedRequests;
  }

  async removeRequestsForTab(tab: number) {
    return this.removeRequests((requestData) => requestData.tab === tab);
  }

  async removeRequestsForNavigation(
    tab: number,
    frameId: number,
    documentId?: string,
  ) {
    return this.removeRequests((requestData) => {
      if (requestData.tab !== tab) return false;
      const source = requestData.dappInfo?.requestSource;
      if (!source) return frameId === 0;
      return (
        source.frameId === frameId &&
        (!documentId || source.documentId !== documentId)
      );
    });
  }

  async rehydrateNonInteractiveRequests() {
    const pendingRequests = [...this.requestsData];

    for (const requestData of pendingRequests) {
      const { request, tab, dappInfo } = requestData;
      if (
        !request ||
        tab == null ||
        !dappInfo ||
        !EvmUnrestrictedMethods.includes(request.method)
      ) {
        continue;
      }

      const locator = this.getRequestLocator(requestData);
      if (!locator || !this.getRequestDataByLocator(locator)) continue;

      if (!dappInfo.requestSource) {
        await this.removeRequestByLocator(locator, false);
        continue;
      }

      await initEvmRequestHandler(request, tab, dappInfo, this);
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
    await EvmRequestHandler.withPersistedRequestsData(
      this,
      (persistedRequestsData) => persistedRequestsData,
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
      const requestsData =
        requestHandlersParams?.requestsData ?? handler.requestsData;
      const nextRequestsData = await mutate(requestsData);

      await LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.__EVM_REQUEST_HANDLER,
        { requestsData: nextRequestsData },
      );
      handler.requestsData = nextRequestsData;
    });
  }

  private async removeRequests(
    matches: (requestData: EvmRequestData) => boolean,
  ) {
    let removedCount = 0;
    await EvmRequestHandler.withPersistedRequestsData(this, (requestsData) =>
      requestsData.filter((requestData) => {
        if (!matches(requestData)) return true;
        removedCount += 1;
        return false;
      }),
    );
    return removedCount;
  }

  private static enqueueStorageMutation<T>(mutation: () => Promise<T>) {
    const runMutation = evmRequestHandlerMutationQueue.then(mutation, mutation);
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
    if (
      requestData.request_id === locator.requestId &&
      requestData.tab === locator.tab &&
      requestData.dappInfo?.origin === locator.origin
    ) {
      const source = requestData.dappInfo?.requestSource;
      if (!source) {
        return locator.frameId === undefined || locator.frameId === 0;
      }
      if (locator.frameId === undefined) return true;
      return isPendingRequestSourceMatch(source, {
        tab: locator.tab,
        frameId: locator.frameId,
        documentId: locator.documentId,
        origin: locator.origin,
      });
    }
    return false;
  }
}
