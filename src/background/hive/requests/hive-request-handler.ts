import { BgdHiveEngineConfigModule } from '@background/hive/modules/hive-engine-config.module';
import { initHiveRequestHandler } from '@background/hive/requests/init';
import { removeWindow } from '@background/multichain/dialog-lifecycle';
import { RequestHandlerUtils } from '@background/utils/request-handler.utils';
import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import { Key } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { config } from 'hive-tx';
import Config from 'src/config';
import {
  KeychainKeyTypesLC,
  KeychainRequest,
  KeychainRequestWrapper,
} from 'src/interfaces/keychain.interface';
import LocalStorageUtils from 'src/utils/localStorage.utils';

if (!process.env.IS_FIREFOX && !global.window) {
  //@ts-ignore
  global.window = { crypto };
}

type RequestData = {
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
};
export class HiveRequestsHandler {
  requestsData: RequestData[];
  // data: RequestData;
  hiveEngineConfig: HiveEngineConfig;
  defaultRpcConfig: any;
  windowId: number | undefined;
  accounts: LocalAccount[];

  constructor() {
    // this.data = { confirmed: false, isWaitingForConfirmation: false };
    this.hiveEngineConfig = Config.hiveEngine;
    this.defaultRpcConfig = config;
    this.requestsData = [];
    this.accounts = [];
  }

  async initFromLocalStorage(
    requestsData: RequestData[],
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
    requestId: number,
  ) {
    // this.data.isWaitingForConfirmation = isWaitingForConfirmation;
    for (const requestData of this.requestsData) {
      if (requestData.request_id === requestId) {
        requestData.isWaitingForConfirmation = isWaitingForConfirmation;
        break;
      }
    }
    this.saveInLocalStorage();
  }

  isWaitingForConfirmation(requestId: number) {
    const request = this.requestsData.find(
      (request) => request.request_id === requestId,
    );
    return request?.isWaitingForConfirmation;
  }

  async setIsMultisig(isMultisig: boolean, requestId: number) {
    for (const requestData of this.requestsData) {
      if (requestData.request_id === requestId) {
        requestData.isMultisig = isMultisig;
        break;
      }
    }
    this.saveInLocalStorage();
  }

  isMultisig(requestId: number) {
    const request = this.requestsData.find(
      (request) => request.request_id === requestId,
    );
    return request?.isMultisig;
  }

  async setIsKeyless(isKeyless: boolean, requestId: number) {
    for (const requestData of this.requestsData) {
      if (requestData.request_id === requestId) {
        requestData.isKeyless = isKeyless;
        break;
      }
    }
    this.saveInLocalStorage();
  }

  isKeyless(requestId: number) {
    const request = this.requestsData.find(
      (request) => request.request_id === requestId,
    );
    return request?.isKeyless;
  }

  async initializeParameters(
    accounts: LocalAccount[],
    rpc: Rpc,
    noConfirmPreferences: NoConfirm,
    requestId: number,
  ) {
    this.accounts = accounts;
    for (const requestData of this.requestsData) {
      if (requestData.request_id === requestId) {
        requestData.accounts = accounts;
        requestData.rpc = rpc;
        await this.setupHiveEngine();
        requestData.preferences = noConfirmPreferences;
        break;
      }
    }

    config.node = rpc.uri;
    this.saveInLocalStorage();
  }

  closeWindow() {
    if (this.windowId) {
      removeWindow(this.windowId);
      RequestHandlerUtils.removeWindowId();
    }
  }

  reset(resetWinId: boolean) {
    if (resetWinId) {
      config.node = this.defaultRpcConfig.node;
      HiveRequestsHandler.clearLocalStorage();
    } else {
      this.requestsData = [];
      this.saveInLocalStorage();
    }
  }

  setConfirmed(confirmed: boolean, requestId: number) {
    for (const requestData of this.requestsData) {
      if (requestData.request_id === requestId) {
        requestData.confirmed = confirmed;
        break;
      }
    }
    this.saveInLocalStorage();
  }

  setWindowId(windowId?: number) {
    this.windowId = windowId;
  }

  setKeys(key: string, publicKey: string, requestId: number) {
    for (const requestData of this.requestsData) {
      if (requestData.request_id === requestId) {
        requestData.key = key;
        requestData.publicKey = publicKey;
        break;
      }
    }
    this.saveInLocalStorage();
  }

  sendRequest(
    sender: chrome.runtime.MessageSender,
    msg: KeychainRequestWrapper,
  ) {
    const requestData: RequestData = {
      tab: sender.tab!.id,
      request: msg.request,
      request_id: msg.request_id,
      confirmed: false,
      isWaitingForConfirmation: false,
      domain: msg.domain,
    };
    if (msg.request.rpc) {
      requestData.rpc = { uri: msg.request.rpc, testnet: false };
    }
    this.requestsData.push(requestData);

    initHiveRequestHandler(msg.request, sender.tab!.id, msg.domain, this);
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

  getRequestData(requestId: number) {
    return this.requestsData.find(
      (request) => request.request_id === requestId,
    );
  }

  getRequest(requestId: number) {
    const requestData = this.getRequestData(requestId);
    return requestData?.request;
  }

  setRequest(requestId: number, request: KeychainRequest) {
    for (const requestData of this.requestsData) {
      if (requestData.request_id === requestId) {
        requestData.request = request;
        break;
      }
    }
    this.saveInLocalStorage();
  }

  async removeRequestById(requestId: number, tabId: number) {
    this.requestsData = this.requestsData.filter((requestData: RequestData) => {
      if (requestData.request_id === requestId && requestData.tab! === tabId) {
        return false;
      }
      return true;
    });

    if ((await RequestHandlerUtils.countPendingRestrictedRequest()) === 0) {
      if (this.windowId) chrome.windows.remove(this.windowId);
    }

    await this.saveInLocalStorage();
  }

  static async getFromLocalStorage() {
    const windowId = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.DIALOG_WINDOW_ID,
    );
    const params = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.__REQUEST_HANDLER,
    );
    const handler = new HiveRequestsHandler();
    if (params) {
      await handler.initFromLocalStorage(
        params.requestsData,
        params.accounts,
        params.hiveEngineConfig,
        params.defaultRpcConfig,
        windowId,
      );
    }
    return handler;
  }

  async saveInLocalStorage() {
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.__REQUEST_HANDLER,
      {
        requestsData: this.requestsData,
        accounts: this.accounts,
        hiveEngineConfig: this.hiveEngineConfig,
        defaultRpcConfig: this.defaultRpcConfig,
      },
    );
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.DIALOG_WINDOW_ID,
      this.windowId,
    );
  }

  static async clearLocalStorage() {
    await LocalStorageUtils.removeFromLocalStorage(
      LocalStorageKeyEnum.__REQUEST_HANDLER,
    );
  }
}
