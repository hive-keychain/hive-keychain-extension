import KeychainApi from '@api/keychain';
import { removeWindow } from '@background/requests/dialog-lifecycle';
import init from '@background/requests/init';
import RPCModule from '@background/rpc.module';
import { Client } from '@hiveio/dhive';
import { LocalAccount } from '@interfaces/local-account.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import { Rpc } from '@interfaces/rpc.interface';
import {
  KeychainRequest,
  KeychainRequestWrapper,
} from 'src/interfaces/keychain.interface';
class RequestsHandler {
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
  hiveClient: Client;

  constructor() {
    this.confirmed = false;
    this.hiveClient = new Client('https://api.hive.blog/');
    const rpc = RPCModule.getActiveRpc();
    this.setupRpc(rpc);
  }

  setupRpc(rpc: Rpc) {
    if (rpc.uri === 'DEFAULT') {
      KeychainApi.get('/hive/rpc').then((res) => {
        console.log(res);
        this.hiveClient = new Client(res.data.rpc, {
          chainId: rpc.chainId,
        });
      });
    } else {
      this.hiveClient = new Client(rpc.uri, {
        chainId: rpc.chainId,
      });
    }
  }

  initializeParameters(
    accounts: LocalAccount[],
    rpc: Rpc,
    preferences: NoConfirm,
  ) {
    this.accounts = accounts;
    this.rpc = rpc;
    this.setupRpc(rpc);
    this.preferences = preferences;
  }

  closeWindow() {
    if (this.windowId) {
      removeWindow(this.windowId);
    }
  }

  reset() {
    this.key = undefined;
    this.publicKey = undefined;
    this.accounts = [];
    this.request = undefined;
    this.request_id = undefined;
    this.tab = undefined;
    this.windowId = undefined;
  }

  setConfirmed(confirmed: boolean) {
    this.confirmed = confirmed;
  }

  setWindowId(windowId?: number) {
    this.windowId = windowId;
  }

  setKeys(key: string, publicKey: string) {
    this.key = key;
    this.publicKey = publicKey;
  }

  sendRequest(
    sender: chrome.runtime.MessageSender,
    msg: KeychainRequestWrapper,
  ) {
    this.tab = sender.tab!.id;
    this.request = msg.request;
    this.request_id = msg.request_id;
    init(msg.request, this.tab, msg.domain);
  }

  getHiveClient() {
    return this.hiveClient;
  }
}
let requestHandler: RequestsHandler;

export const initRequestHandler = () => {
  requestHandler = new RequestsHandler();
  return requestHandler;
};

export const getRequestHandler = () => requestHandler;
