import init from '@background/requests/init';
import RPCModule from '@background/rpc.module';
import hive, { Client } from '@hiveio/dhive';
import { LocalAccount } from '@interfaces/local-account.interface';
import { UserPreference } from '@interfaces/preferences.interface';
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
  preferences?: UserPreference[];
  key?: string;
  publicKey?: string;
  windowId?: number;
  hiveClient: Client;

  constructor() {
    this.confirmed = false;
    this.hiveClient = new hive.Client(RPCModule.getActiveRpc().uri, {
      chainId: RPCModule.getActiveRpc().chainId,
    });
  }

  initializeParameters(
    accounts: LocalAccount[],
    rpc: Rpc,
    preferences: UserPreference[],
  ) {
    this.accounts = accounts;
    this.rpc = rpc;
    this.hiveClient = new hive.Client(rpc.uri, { chainId: rpc.chainId });
    this.preferences = preferences;
  }

  reset() {
    this.key = undefined;
    this.publicKey = undefined;
    this.accounts = [];
    this.request = undefined;
    this.request_id = undefined;
    this.tab = undefined;
  }

  setConfirmed(confirmed: boolean) {
    this.confirmed = confirmed;
  }

  setWindowId(windowId?: number) {
    this.windowId = windowId;
  }

  setKeys(key: string, publicKey: string) {
    this.key = key;
    this.publicKey = this.publicKey;
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
