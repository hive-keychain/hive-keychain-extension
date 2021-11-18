import init from '@background/requests/init';
import { LocalAccount } from '@interfaces/local-account.interface';
import { UserPreference } from '@interfaces/preferences.interface';
import { Rpc } from '@interfaces/rpc.interface';
import {
  KeychainRequest,
  KeychainRequestWrapper,
} from 'src/interfaces/keychain.interface';

// type RequestModule = {
//   tab?: number;
//   request?: KeychainRequest;
//   request_id?: number;
//   confirmed: boolean;
//   accounts: LocalAccount[];
//   rpc: Rpc | null;
//   preferences?: UserPreference[];
//   key?: string;
//   publicKey?: string;
//   windowId?: number;
//   setWindowId: (windowId?: number) => void;
//   setConfirmed: (confirmed: boolean) => void;
//   sendRequest: (
//     sender: chrome.runtime.MessageSender,
//     msg: KeychainRequestWrapper,
//   ) => void;
//   initializeParams: (
//     accounts: LocalAccount[],
//     rpc: Rpc,
//     preferences: UserPreference[],
//   ) => void;
//   setKeys: (key: string, publicKey: string) => void;
//   reset: () => void;
// };

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

  constructor() {
    this.confirmed = false;
  }

  initializeParameters(
    accounts: LocalAccount[],
    rpc: Rpc,
    preferences: UserPreference[],
  ) {
    this.accounts = accounts;
    this.rpc = rpc;
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
}
let requestHandler: RequestsHandler;

export const initRequestHandler = () => {
  requestHandler = new RequestsHandler();
  return requestHandler;
};

export const getRequestHandler = () => requestHandler;
