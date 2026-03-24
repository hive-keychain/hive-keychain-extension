import { BgdHiveEngineConfigModule } from '@background/hive-engine-config.module';
import { removeWindow } from '@background/requests/dialog-lifecycle';
import init from '@background/requests/init';
import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import { Key } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import { Rpc } from '@interfaces/rpc.interface';
import AccountUtils from '@popup/hive/utils/account.utils';
import EncryptUtils from '@popup/hive/utils/encrypt.utils';
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
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { getRequiredWifType } from 'src/utils/requests.utils';
import VaultUtils from 'src/utils/vault.utils';

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
};
export class RequestsHandler {
  data: RequestData;
  hiveEngineConfig: HiveEngineConfig;
  defaultRpcConfig: any;

  constructor() {
    this.data = { confirmed: false, isWaitingForConfirmation: false };
    this.hiveEngineConfig = Config.hiveEngine;
    this.defaultRpcConfig = config;
  }

  async initFromLocalStorage(
    data: RequestData,
    accounts: LocalAccount[],
    hiveEngineConfig: HiveEngineConfig,
    defaultRpcConfig: any,
  ) {
    this.data = data;
    this.data.accounts = accounts;
    this.hiveEngineConfig = hiveEngineConfig;
    this.defaultRpcConfig = defaultRpcConfig;
  }

  async setupHiveEngine() {
    this.hiveEngineConfig = await BgdHiveEngineConfigModule.getActiveConfig();
  }

  async setIsWaitingForConfirmation(isWaitingForConfirmation: boolean) {
    this.data.isWaitingForConfirmation = isWaitingForConfirmation;
    this.saveInLocalStorage();
  }

  async setIsMultisig(isMultisig: boolean) {
    this.data.isMultisig = isMultisig;
  }

  async setIsKeyless(isKeyless: boolean) {
    this.data.isKeyless = isKeyless;
  }

  async initializeParameters(
    accounts: LocalAccount[],
    rpc: Rpc,
    preferences: NoConfirm,
  ) {
    this.data.accounts = accounts;
    this.data.rpc = rpc;
    await this.setupHiveEngine();
    this.data.preferences = preferences;

    config.node = rpc.uri;
  }

  closeWindow() {
    if (this.data.windowId) {
      removeWindow(this.data.windowId);
    }
  }

  reset(resetWinId: boolean) {
    if (resetWinId) {
      config.node = this.defaultRpcConfig.node;
      RequestsHandler.clearLocalStorage();
    } else {
      this.data = {
        confirmed: this.data.confirmed,
        windowId: this.data.windowId,
        isWaitingForConfirmation: false,
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
    if (msg.request.rpc)
      this.data.rpc = { uri: msg.request.rpc, testnet: false };
    init(msg.request, this.data.tab, msg.domain, this);
  }

  getUserKeyPair(username: string, keyType: KeychainKeyTypesLC) {
    const pubKey: string = `${keyType}Pubkey`;
    return [
      this.data.accounts?.find((e) => e.name === username)?.keys[keyType],
      //@ts-ignore
      this.data.accounts?.find((e) => e.name === username)?.keys[pubKey!],
    ];
  }

  getUserPrivateKey(username: string, keyType: KeychainKeyTypesLC) {
    return this.data.accounts?.find((e) => e.name === username)?.keys[keyType];
  }

  static async getFromLocalStorage() {
    const params = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.__REQUEST_HANDLER,
    );

    const accounts = await AccountUtils.getAccountsFromLocalStorage(
      await VaultUtils.getValueFromVault(VaultKey.__MK),
    );

    const handler = new RequestsHandler();
    if (accounts && params) {
      if (
        params.data.request &&
        params.data.request.type === KeychainRequestTypes.addAccount
      ) {
        const mk = await VaultUtils.getValueFromVault(VaultKey.__MK);
        params.data.request = {
          ...params.data.request,
          keys: await EncryptUtils.decryptToJson(
            params.data.request.encryptedKeys,
            mk!,
          ),
        };
      }
      await handler.initFromLocalStorage(
        params.data,
        accounts,
        params.hiveEngineConfig,
        params.defaultRpcConfig,
      );

      const username = params.data?.request?.username;
      if (username) {
        const selectedAccount = accounts.find((acc) => acc.name === username);
        if (selectedAccount) {
          let typeWif = getRequiredWifType(params.data.request);
          const publicKey: Key = selectedAccount.keys[`${typeWif}Pubkey`]!;
          const key = selectedAccount.keys[typeWif];

          handler.setKeys(key!, publicKey!);
        }
      }
    }
    return handler;
  }

  async saveInLocalStorage() {
    const dataToSave = {
      hiveEngineConfig: this.hiveEngineConfig,
      defaultRpcConfig: this.defaultRpcConfig,
      data: {
        tab: this.data.tab,
        request: this.data.request,
        request_id: this.data.request_id,
        confirmed: this.data.confirmed,
        rpc: this.data.rpc,
        preferences: this.data.preferences,
        windowId: this.data.windowId,
        isMultisig: this.data.isMultisig,
        isWaitingForConfirmation: this.data.isWaitingForConfirmation,
        isKeyless: this.data.isKeyless,
      } as RequestData,
    };

    if (
      dataToSave.data.request &&
      this.data.request?.type === KeychainRequestTypes.addAccount
    ) {
      const mk = await VaultUtils.getValueFromVault(VaultKey.__MK);
      dataToSave.data.request = {
        request_id: this.data.request_id,
        type: this.data.request.type,
        username: this.data.request.username,
        encryptedKeys: await EncryptUtils.encryptJson(
          { keys: this.data.request.keys },
          mk!,
        ),
      } as any;
    }
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.__REQUEST_HANDLER,
      dataToSave,
    );
  }

  static async clearLocalStorage() {
    await LocalStorageUtils.removeFromLocalStorage(
      LocalStorageKeyEnum.__REQUEST_HANDLER,
    );
  }
}
