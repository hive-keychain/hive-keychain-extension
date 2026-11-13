import { BgdHiveEngineConfigModule } from '@background/hive/modules/hive-engine-config.module';
import { initHiveRequestHandler } from '@background/hive/requests/init';
import {
  syncSharedDialogWindow,
} from '@background/multichain/dialog-coordinator';
import { removeWindow } from '@background/multichain/dialog-lifecycle';
import { PendingRequestAdmission } from '@background/multichain/pending-request-admission';
import {
  getPendingRequestMessageOptions,
  getPendingRequestSource,
  isPendingRequestSourceMatch,
} from '@background/multichain/pending-request.interface';
import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import { Key } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import {
  PendingRequestLocator,
  PendingRequestSource,
} from '@interfaces/pending-request.interface';
import { Rpc } from '@interfaces/rpc.interface';
import AccountUtils from '@popup/hive/utils/account.utils';
import EncryptUtils from '@popup/hive/utils/encrypt.utils';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import { config } from 'hive-tx';
import Config from 'src/config';
import {
  KeychainKeyTypesLC,
  KeychainRequest,
  KeychainRequestTypes,
  KeychainRequestWrapper,
} from 'src/interfaces/keychain.interface';
import { getHostnameFromMessageSender } from 'src/utils/browser-origin.utils';
import { CommunicationUtils } from 'src/utils/communication.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import { RequestPayloadUtils } from 'src/utils/request-payload.utils';
import { getRequiredWifType } from 'src/utils/requests.utils';
import VaultUtils from 'src/utils/vault.utils';

if (!process.env.IS_FIREFOX && !global.window) {
  //@ts-ignore
  global.window = { crypto };
}

let hiveRequestHandlerMutationQueue: Promise<void> = Promise.resolve();

export type HiveRequestData = {
  tab?: number;
  request?: KeychainRequest;
  request_id?: number;
  confirmed: boolean;
  accounts?: LocalAccount[];
  rpc?: Rpc | null;
  preferences?: NoConfirm;
  key?: Key;
  publicKey?: Key;
  windowId?: number;
  isMultisig?: boolean;
  isWaitingForConfirmation: boolean;
  isKeyless?: boolean;
  domain?: string;
  arrivalOrder?: number;
  source?: PendingRequestSource;
  byteSize?: number;
};

export type HiveRequestLocator = PendingRequestLocator;

const answerRejectedHiveRequest = async (
  tab: number,
  request: KeychainRequest | undefined,
  requestId: number | undefined,
  error: string,
  source?: PendingRequestSource,
  message = error,
) => {
  const response = {
    command: DialogCommand.ANSWER_REQUEST,
    msg: {
      success: false,
      error,
      result: null,
      data: request,
      message,
      request_id: requestId,
    },
  };
  await CommunicationUtils.tabsSendMessage(
    tab,
    response,
    getPendingRequestMessageOptions(source),
  );
};
export class HiveRequestsHandler {
  requestsData: HiveRequestData[];
  hiveEngineConfig: HiveEngineConfig;
  defaultRpcConfig: any;
  windowId: number | undefined;
  accounts: LocalAccount[];

  constructor() {
    this.hiveEngineConfig = Config.hiveEngine;
    this.defaultRpcConfig = config;
    this.requestsData = [];
    this.accounts = [];
  }

  async initFromLocalStorage(
    requestsData: HiveRequestData[],
    accounts: LocalAccount[],
    hiveEngineConfig: HiveEngineConfig,
    defaultRpcConfig: any,
    windowId?: number,
  ) {
    // this.data = data;
    this.requestsData = requestsData;
    this.accounts = accounts;
    this.windowId = windowId;
    this.hiveEngineConfig = hiveEngineConfig;
    this.defaultRpcConfig = defaultRpcConfig;
  }

  async setupHiveEngine() {
    this.hiveEngineConfig = await BgdHiveEngineConfigModule.getActiveConfig();
  }

  async setIsWaitingForConfirmation(
    isWaitingForConfirmation: boolean,
    locator: HiveRequestLocator,
  ) {
    await this.mutateRequestByLocator(locator, (requestData) => {
      requestData.isWaitingForConfirmation = isWaitingForConfirmation;
    });
  }

  isWaitingForConfirmation(locator: HiveRequestLocator) {
    return this.getRequestDataByLocator(locator)?.isWaitingForConfirmation;
  }

  async setIsMultisig(isMultisig: boolean, locator: HiveRequestLocator) {
    await this.mutateRequestByLocator(locator, (requestData) => {
      requestData.isMultisig = isMultisig;
    });
  }

  isMultisig(locator: HiveRequestLocator) {
    return this.getRequestDataByLocator(locator)?.isMultisig;
  }

  async setIsKeyless(isKeyless: boolean, locator: HiveRequestLocator) {
    await this.mutateRequestByLocator(locator, (requestData) => {
      requestData.isKeyless = isKeyless;
    });
  }

  isKeyless(locator: HiveRequestLocator) {
    return this.getRequestDataByLocator(locator)?.isKeyless;
  }

  async initializeParameters(
    accounts: LocalAccount[],
    rpc: Rpc,
    noConfirmPreferences: NoConfirm,
    locator: HiveRequestLocator,
  ) {
    this.accounts = accounts;
    await this.setupHiveEngine();
    await this.mutateRequestByLocator(locator, (requestData) => {
      requestData.accounts = accounts;
      requestData.rpc = rpc;
      requestData.preferences = noConfirmPreferences;
    });

    config.node = rpc.uri;
  }

  closeWindow() {
    if (this.windowId) {
      removeWindow(this.windowId);
      this.windowId = undefined;
    }
  }

  reset(resetWinId: boolean) {
    if (resetWinId) {
      config.node = this.defaultRpcConfig.node;
      HiveRequestsHandler.clearLocalStorage();
    } else {
      void HiveRequestsHandler.withPersistedRequestsData(this, () => []);
    }
  }

  async setConfirmed(confirmed: boolean, locator: HiveRequestLocator) {
    await this.mutateRequestByLocator(locator, (requestData) => {
      requestData.confirmed = confirmed;
    });
  }

  setWindowId(windowId?: number) {
    this.windowId = windowId;
  }

  setKeys(key: string, publicKey: string, locator: HiveRequestLocator) {
    const requestData = this.getRequestDataByLocator(locator);
    if (!requestData) return;
    requestData.key = key;
    requestData.publicKey = publicKey;
  }

  async sendRequest(
    sender: chrome.runtime.MessageSender,
    msg: KeychainRequestWrapper,
  ) {
    const tab = sender.tab?.id;
    const source = getPendingRequestSource(sender);
    const origin = source?.origin;
    const domain = getHostnameFromMessageSender(sender);
    if (tab == null || !origin || !domain || !source) {
      if (tab != null) {
        await answerRejectedHiveRequest(
          tab,
          msg.request,
          msg.request_id,
          'invalid_sender',
          source ?? undefined,
        );
      }
      return;
    }
    const rejectRequest = (error: string, message: string) =>
      answerRejectedHiveRequest(
        tab,
        msg.request,
        msg.request_id,
        error,
        source,
        message,
      );
    if (
      !msg.request ||
      !RequestPayloadUtils.isValidRequestId(msg.request_id) ||
      msg.request.request_id !== msg.request_id ||
      !Object.values(KeychainRequestTypes).includes(msg.request.type)
    ) {
      await rejectRequest('incomplete', 'Invalid request.');
      return;
    }

    const payloadSize = RequestPayloadUtils.getRequestPayloadSize(
      {
        ...msg,
        domain,
      },
      RequestPayloadUtils.getMaxRequestBytes('hive', msg.request.type),
    );
    if (payloadSize.byteSize === null) {
      await rejectRequest('incomplete', 'Invalid request.');
      return;
    }
    if (!payloadSize.isValid) {
      await rejectRequest('request_limit', 'Request size limit exceeded.');
      return;
    }

    let admissionResult;
    try {
      admissionResult = await PendingRequestAdmission.admit(
        {
          chain: 'hive',
          requestId: msg.request_id,
          method: msg.request.type,
          source,
          byteSize: payloadSize.byteSize,
        },
        async (arrivalOrder) => {
          const requestData: HiveRequestData = {
            tab,
            request: msg.request,
            request_id: msg.request_id,
            confirmed: false,
            isWaitingForConfirmation: false,
            domain,
            source,
            arrivalOrder,
            byteSize: payloadSize.byteSize ?? undefined,
          };
          if (msg.request.rpc) {
            requestData.rpc = { uri: msg.request.rpc, testnet: false };
          }
          await HiveRequestsHandler.withPersistedRequestsData(
            this,
            (requestsData) => [...requestsData, requestData],
          );
        },
      );
    } catch {
      Logger.warn(
        `Unable to persist Hive request for ${origin} (${msg.request.type}, ${payloadSize.byteSize} bytes)`,
      );
      await rejectRequest('request_limit', 'Request limit exceeded.');
      return;
    }

    if (!admissionResult.accepted) {
      await rejectRequest(
        admissionResult.reason,
        admissionResult.reason === 'request_pending'
          ? 'Request already pending.'
          : 'Request limit exceeded.',
      );
      return;
    }

    await initHiveRequestHandler(
      msg.request,
      tab,
      domain,
      this,
      source,
    );
  }

  getUserKeyPair(username: string, keyType: KeychainKeyTypesLC) {
    const pubKey: string = `${keyType}Pubkey`;
    return [
      this.accounts?.find((e) => e.name === username)?.keys[keyType],
      //@ts-ignore
      this.accounts?.find((e) => e.name === username)?.keys[pubKey!],
    ];
  }

  getUserPrivateKey(username: string, keyType: KeychainKeyTypesLC) {
    return this.accounts?.find((e) => e.name === username)?.keys[keyType];
  }

  /** Id-only lookup kept for the single-slot test handler. Pending Hive requests use getRequestDataByLocator. */
  getRequestData(requestId: number) {
    return this.requestsData.find(
      (request) => request.request_id === requestId,
    );
  }

  getRequestDataByLocator(locator: HiveRequestLocator) {
    return this.requestsData.find((requestData) =>
      HiveRequestsHandler.isRequestLocatorMatch(requestData, locator),
    );
  }

  getRequestLocator(requestData: HiveRequestData): HiveRequestLocator | null {
    if (
      requestData.request_id == null ||
      requestData.tab == null ||
      !requestData.domain
    ) {
      return null;
    }
    return requestData.source
      ? { requestId: requestData.request_id, ...requestData.source }
      : {
          requestId: requestData.request_id,
          tab: requestData.tab,
          origin: requestData.domain,
          frameId: 0,
        };
  }

  /** Id-only lookup kept for the single-slot test handler. */
  getRequest(requestId: number) {
    const requestData = this.getRequestData(requestId);
    return requestData?.request;
  }

  async setRequest(locator: HiveRequestLocator, request: KeychainRequest) {
    await this.mutateRequestByLocator(locator, (requestData) => {
      requestData.request = request;
    });
  }

  async removeRequestById(
    requestId: number,
    tabId: number,
    shouldSyncDialog = true,
  ) {
    await this.removeRequests(
      (requestData) =>
        requestData.request_id === requestId && requestData.tab === tabId,
    );
    if (shouldSyncDialog) {
      await syncSharedDialogWindow();
    }
  }

  async removeRequestByLocator(
    locator: HiveRequestLocator,
    shouldSyncDialog = true,
  ) {
    await this.removeRequests((requestData) =>
      HiveRequestsHandler.isRequestLocatorMatch(requestData, locator),
    );
    if (shouldSyncDialog) {
      await syncSharedDialogWindow();
    }
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
      if (!requestData.source) return frameId === 0;
      return (
        requestData.source.frameId === frameId &&
        (!documentId || requestData.source.documentId !== documentId)
      );
    });
  }

  async reprocessPendingRequests() {
    const pendingRequestsSnapshot = [...this.requestsData];

    for (const requestData of pendingRequestsSnapshot) {
      if (
        requestData.confirmed ||
        requestData.tab === undefined ||
        !requestData.request ||
        !requestData.domain
      ) {
        continue;
      }

      const locator = this.getRequestLocator(requestData);
      const isStillPending =
        locator &&
        this.requestsData.some((currentRequestData) =>
          HiveRequestsHandler.isRequestLocatorMatch(
            currentRequestData,
            locator,
          ),
        );

      if (!isStillPending) {
        continue;
      }

      await initHiveRequestHandler(
        requestData.request,
        requestData.tab,
        requestData.domain,
        this,
        requestData.source,
      );
    }

    await syncSharedDialogWindow({ hiveRequestHandler: this });
  }

  static async getFromLocalStorage() {
    const windowId = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.DIALOG_WINDOW_ID,
    );
    const params = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.__REQUEST_HANDLER,
    );

    const accounts = await AccountUtils.getAccountsFromLocalStorage(
      await VaultUtils.getValueFromVault(VaultKey.__MK),
    );

    const handler = new HiveRequestsHandler();
    handler.windowId = windowId;
    if (params && accounts) {
      const requestsData = params.requestsData;
      for (const rd of requestsData) {
        if (rd.request && rd.request.type === KeychainRequestTypes.addAccount) {
          const mk = await VaultUtils.getValueFromVault(VaultKey.__MK);
          const encryptedKeys = (rd.request as any).encryptedKeys;
          if (mk && encryptedKeys) {
            rd.request = {
              ...rd.request,
              keys: await EncryptUtils.decryptToJson(encryptedKeys, mk),
            };
          }
        }
      }

      await handler.initFromLocalStorage(
        requestsData,
        accounts,
        params.hiveEngineConfig,
        params.defaultRpcConfig,
        windowId,
      );
      for (const requestData of params.requestsData) {
        const username = requestData.request.username;
        const selectedAccount = accounts.find((acc) => acc.name === username);
        if (selectedAccount) {
          let typeWif = getRequiredWifType(requestData.request);
          const publicKey: Key = selectedAccount.keys[`${typeWif}Pubkey`]!;
          const key = selectedAccount.keys[typeWif];

          const locator = handler.getRequestLocator(requestData);
          if (locator) handler.setKeys(key!, publicKey!, locator);
        }
      }
    }
    return handler;
  }

  async saveInLocalStorage() {
    await HiveRequestsHandler.withPersistedRequestsData(
      this,
      (persistedRequestsData) => persistedRequestsData,
    );
  }

  private async saveRequestsDataInLocalStorage(
    requestsData: HiveRequestData[],
  ) {
    const requestsDataToSave: Partial<HiveRequestData>[] = [];

    for (const rd of requestsData) {
      const requestData: HiveRequestData = {
        tab: rd.tab,
        request: rd.request,
        request_id: rd.request_id,
        confirmed: rd.confirmed,
        rpc: rd.rpc,
        preferences: rd.preferences,
        windowId: rd.windowId,
        isMultisig: rd.isMultisig,
        isWaitingForConfirmation: rd.isWaitingForConfirmation,
        isKeyless: rd.isKeyless,
        domain: rd.domain,
        arrivalOrder: rd.arrivalOrder,
        source: rd.source,
      };
      if (rd.request?.type === KeychainRequestTypes.addAccount) {
        const mk = await VaultUtils.getValueFromVault(VaultKey.__MK);
        requestData.request = {
          request_id: rd.request_id,
          type: rd.request.type,
          username: rd.request.username,
          encryptedKeys: await EncryptUtils.encryptJson(
            { keys: rd.request.keys },
            mk!,
          ),
        } as any;
      }
      requestsDataToSave.push(requestData);
    }

    const dataToSave = {
      hiveEngineConfig: this.hiveEngineConfig,
      defaultRpcConfig: this.defaultRpcConfig,
      windowId: this.windowId,
      requestsData: requestsDataToSave,
    };

    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.__REQUEST_HANDLER,
      dataToSave,
    );
  }

  private async mutateRequestByLocator(
    locator: HiveRequestLocator,
    mutate: (requestData: HiveRequestData) => void,
  ) {
    await HiveRequestsHandler.withPersistedRequestsData(
      this,
      (requestsData) =>
        requestsData.map((requestData) => {
          if (!HiveRequestsHandler.isRequestLocatorMatch(requestData, locator)) {
            return requestData;
          }
          const nextRequestData = { ...requestData };
          mutate(nextRequestData);
          return nextRequestData;
        }),
    );
  }

  private async removeRequests(
    matches: (requestData: HiveRequestData) => boolean,
  ) {
    let removedCount = 0;
    await HiveRequestsHandler.withPersistedRequestsData(this, (requestsData) =>
      requestsData.filter((requestData) => {
        if (!matches(requestData)) return true;
        removedCount += 1;
        return false;
      }),
    );
    return removedCount;
  }

  private static async withPersistedRequestsData(
    handler: HiveRequestsHandler,
    mutate: (
      requestsData: HiveRequestData[],
    ) => HiveRequestData[] | Promise<HiveRequestData[]>,
  ) {
    await HiveRequestsHandler.enqueueStorageMutation(async () => {
      const params = await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.__REQUEST_HANDLER,
      );
      const persistedRequestsData: HiveRequestData[] =
        params?.requestsData ?? handler.requestsData;
      const requestsData = persistedRequestsData.map((requestData) => {
        const currentRequestData = handler.requestsData.find((current) =>
          HiveRequestsHandler.isSameRequestData(current, requestData),
        );
        return currentRequestData
          ? {
              ...currentRequestData,
              ...requestData,
              accounts: currentRequestData.accounts,
              key: currentRequestData.key,
              publicKey: currentRequestData.publicKey,
            }
          : requestData;
      });
      const nextRequestsData = await mutate(requestsData);
      await handler.saveRequestsDataInLocalStorage(nextRequestsData);
      handler.requestsData = nextRequestsData;
    });
  }

  private static enqueueStorageMutation<T>(mutation: () => Promise<T>) {
    const runMutation = hiveRequestHandlerMutationQueue.then(
      mutation,
      mutation,
    );
    hiveRequestHandlerMutationQueue = runMutation.then(
      () => undefined,
      () => undefined,
    );
    return runMutation;
  }

  private static isRequestLocatorMatch(
    requestData: HiveRequestData,
    locator: HiveRequestLocator,
  ) {
    if (
      requestData.request_id !== locator.requestId ||
      requestData.tab !== locator.tab ||
      (requestData.source?.origin ?? requestData.domain) !== locator.origin
    ) {
      return false;
    }
    if (!requestData.source) {
      return locator.frameId === undefined || locator.frameId === 0;
    }
    if (locator.frameId === undefined) return true;
    return isPendingRequestSourceMatch(requestData.source, {
      tab: locator.tab,
      frameId: locator.frameId,
      documentId: locator.documentId,
      origin: locator.origin,
    });
  }

  private static isSameRequestData(
    left: HiveRequestData,
    right: HiveRequestData,
  ) {
    if (
      left.request_id !== right.request_id ||
      left.tab !== right.tab ||
      (left.source?.origin ?? left.domain) !==
        (right.source?.origin ?? right.domain)
    ) {
      return false;
    }
    if (!left.source || !right.source) return true;
    return isPendingRequestSourceMatch(left.source, right.source);
  }

  static async clearLocalStorage() {
    await HiveRequestsHandler.enqueueStorageMutation(async () => {
      await LocalStorageUtils.removeFromLocalStorage(
        LocalStorageKeyEnum.__REQUEST_HANDLER,
      );
    });
  }
}
