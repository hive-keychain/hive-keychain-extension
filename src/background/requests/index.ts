import { BgdHiveEngineConfigModule } from '@background/hive-engine-config.module';
import { removeWindow } from '@background/requests/dialog-lifecycle';
import init from '@background/requests/init';
import { Client } from '@hiveio/dhive';
import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import Config from 'src/config';
import {
  KeychainKeyTypesLC,
  KeychainRequest,
  KeychainRequestWrapper,
} from 'src/interfaces/keychain.interface';
import LocalStorageUtils from 'src/utils/localStorage.utils';

if (!process.env.IS_FIREFOX) {
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
  key?: string;
  publicKey?: string;
  windowId?: number;
};
export class RequestsHandler {
  data: RequestData;
  hiveClient: Client;
  hiveEngineConfig: HiveEngineConfig;

  constructor() {
    this.data = { confirmed: false };
    this.hiveClient = new Client(Config.rpc.DEFAULT.uri);
    this.hiveEngineConfig = Config.hiveEngine;
  }

  async initFromLocalStorage(data: RequestData) {
    this.data = data;
    if (data.rpc) {
      await this.setupRpc(data.rpc);
    }
  }

  async setupRpc(rpc: Rpc) {
    // TODO check here
    this.hiveClient = new Client('https://api.hive.blog');
  }

  async setupHiveEngine() {
    this.hiveEngineConfig = await BgdHiveEngineConfigModule.getActiveConfig();
  }

  async initializeParameters(
    accounts: LocalAccount[],
    rpc: Rpc,
    preferences: NoConfirm,
  ) {
    this.data.accounts = accounts;
    this.data.rpc = rpc;
    await this.setupRpc(rpc);
    await this.setupHiveEngine();
    this.data.preferences = preferences;
  }

  closeWindow() {
    if (this.data.windowId) {
      removeWindow(this.data.windowId);
    }
  }

  reset(resetWinId: boolean) {
    if (resetWinId) {
      RequestsHandler.clearLocalStorage();
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

  setKeys(key: string, publicKey: string) {
    this.data.key = key;
    this.data.publicKey = publicKey;
  }

  sendRequest(
    sender: chrome.runtime.MessageSender,
    msg: KeychainRequestWrapper,
  ) {
    this.data.tab = sender.tab!.id;
    this.data.request = msg.request;
    this.data.request_id = msg.request_id;
    init(msg.request, this.data.tab, msg.domain, this);
  }

  getHiveClient() {
    return this.hiveClient;
  }

  getUserKey(username: string, keyType: KeychainKeyTypesLC) {
    const pubKey: string = `${keyType}Pubkey`;
    return [
      this.data.accounts?.find((e) => e.name === username)?.keys[keyType],
      //@ts-ignore
      this.data.accounts?.find((e) => e.name === username)?.keys[pubKey!],
    ];
  }

  static async getFromLocalStorage() {
    const params = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.__REQUEST_HANDLER,
    );
    const handler = new RequestsHandler();
    if (params) {
      await handler.initFromLocalStorage(params);
    }
    return handler;
  }

  async saveInLocalStorage() {
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.__REQUEST_HANDLER,
      this.data,
    );
  }

  static async clearLocalStorage() {
    await LocalStorageUtils.removeFromLocalStorage(
      LocalStorageKeyEnum.__REQUEST_HANDLER,
    );
  }
}
