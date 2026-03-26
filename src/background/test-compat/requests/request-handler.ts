import Config from 'src/config';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import VaultUtils from 'src/utils/vault.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import { config as hiveTxConfig } from 'hive-tx';
import { KeychainKeyTypesLC, KeychainRequestWrapper } from '@interfaces/keychain.interface';
import * as DialogLifeCycle from './dialog-lifecycle';
import init from './init';

type LegacyHandlerData = {
  tab?: number;
  request?: any;
  request_id?: number;
  confirmed: boolean;
  accounts?: any[];
  rpc?: any;
  preferences?: any;
  key?: string;
  publicKey?: string;
  windowId?: number;
  isMultisig?: boolean;
  isWaitingForConfirmation: boolean;
  isKeyless?: boolean;
  domain?: string;
};

const getDefaultData = (): LegacyHandlerData => ({
  confirmed: false,
  isWaitingForConfirmation: false,
  windowId: undefined,
});

export class RequestsHandler {
  data: LegacyHandlerData;
  hiveEngineConfig = Config.hiveEngine;
  defaultRpcConfig = hiveTxConfig;
  accounts: any[] = [];

  constructor() {
    this.data = getDefaultData();
  }

  async initFromLocalStorage(data: LegacyHandlerData) {
    this.data = { ...getDefaultData(), ...data };
    this.accounts = this.data.accounts || [];
  }

  async initializeParameters(
    accounts: any[],
    rpc: any,
    noConfirmPreferences: any,
    requestId = this.data.request_id,
  ) {
    this.accounts = accounts;
    this.data.accounts = accounts;
    this.data.rpc = rpc;
    this.data.preferences = noConfirmPreferences;
    this.data.request_id = requestId;
  }

  reset(resetWinId: boolean) {
    if (resetWinId) {
      this.data = getDefaultData();
      void RequestsHandler.clearLocalStorage();
      return;
    }

    this.data = {
      ...getDefaultData(),
      windowId: this.data.windowId,
    };
    void this.saveInLocalStorage();
  }

  closeWindow() {
    if (this.data.windowId !== undefined) {
      DialogLifeCycle.removeWindow(this.data.windowId);
    }
  }

  setConfirmed(confirmed: boolean, requestId = this.data.request_id) {
    this.data.confirmed = confirmed;
    this.data.request_id = requestId;
    void this.saveInLocalStorage();
  }

  setWindowId(windowId?: number) {
    this.data.windowId = windowId;
  }

  setKeys(key: string, publicKey: string, requestId = this.data.request_id) {
    this.data.key = key;
    this.data.publicKey = publicKey;
    this.data.request_id = requestId;
  }

  getUserKeyPair(username: string, keyType: KeychainKeyTypesLC) {
    const accountList = this.data.accounts || this.accounts;
    const pubKey = `${keyType}Pubkey`;
    const account = accountList?.find((entry) => entry.name === username);
    return [account?.keys[keyType], account?.keys[pubKey]];
  }

  getUserPrivateKey(username: string, keyType: KeychainKeyTypesLC) {
    if (this.data.key) {
      return this.data.key;
    }
    const accountList = this.data.accounts || this.accounts;
    return accountList?.find((entry) => entry.name === username)?.keys[keyType];
  }

  getRequestData(requestId: number) {
    if (!this.data.request_id || this.data.request_id === requestId) {
      return this.data;
    }
    return undefined;
  }

  getRequest(requestId: number) {
    return this.getRequestData(requestId)?.request;
  }

  setRequest(requestId: number, request: any) {
    if (!this.data.request_id || this.data.request_id === requestId) {
      this.data.request = request;
      this.data.request_id = requestId;
    }
  }

  async setIsWaitingForConfirmation(
    isWaitingForConfirmation: boolean,
    requestId = this.data.request_id,
  ) {
    this.data.isWaitingForConfirmation = isWaitingForConfirmation;
    this.data.request_id = requestId;
    await this.saveInLocalStorage();
  }

  async setIsKeyless(isKeyless: boolean, requestId = this.data.request_id) {
    this.data.isKeyless = isKeyless;
    this.data.request_id = requestId;
    await this.saveInLocalStorage();
  }

  async removeRequestById(requestId: number, _tabId?: number) {
    if (!this.data.request_id || this.data.request_id === requestId) {
      this.data = {
        ...getDefaultData(),
        windowId: this.data.windowId,
      };
    }
    await this.saveInLocalStorage();
  }

  async saveInLocalStorage() {
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.__REQUEST_HANDLER,
      {
        data: this.data,
        hiveEngineConfig: this.hiveEngineConfig,
        defaultRpcConfig: this.defaultRpcConfig,
      },
    );
  }

  sendRequest(
    sender: chrome.runtime.MessageSender,
    msg: KeychainRequestWrapper,
  ) {
    this.data.tab = sender.tab?.id;
    this.data.request = msg.request;
    this.data.request_id = msg.request.request_id;
    this.data.domain = msg.domain;
    if (msg.request.rpc) {
      this.data.rpc = { uri: msg.request.rpc, testnet: false };
    }

    void init(msg.request, this.data.tab, msg.domain, this);
  }

  static async getFromLocalStorage() {
    const params = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.__REQUEST_HANDLER,
    );
    const mk = await VaultUtils.getValueFromVault(VaultKey.__MK);
    const accounts = (await AccountUtils.getAccountsFromLocalStorage(mk)) || [];
    const handler = new RequestsHandler();
    await handler.initFromLocalStorage(params?.data || {});
    handler.accounts = accounts;
    if (!handler.data.accounts) {
      handler.data.accounts = accounts;
    }
    return handler;
  }

  static async clearLocalStorage() {
    await LocalStorageUtils.removeFromLocalStorage(
      LocalStorageKeyEnum.__REQUEST_HANDLER,
    );
  }
}
