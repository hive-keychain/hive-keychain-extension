import init from '@background/requests/init';
import { LocalAccount } from '@interfaces/local-account.interface';
import { UserPreference } from '@interfaces/preferences.interface';
import { Rpc } from '@interfaces/rpc.interface';
import {
  KeychainRequest,
  KeychainRequestWrapper,
} from 'src/interfaces/keychain.interface';

type RequestModule = {
  tab?: number;
  request?: KeychainRequest;
  request_id?: number;
  confirmed: boolean;
  accounts: LocalAccount[];
  rpc: Rpc | null;
  preferences?: UserPreference[]; //TODO: Change any
  sendRequest: (
    sender: chrome.runtime.MessageSender,
    msg: KeychainRequestWrapper,
  ) => void;
  initializeParams: (
    accounts: LocalAccount[],
    rpc: Rpc,
    preferences: UserPreference[],
  ) => void;
};

const RequestsModule: RequestModule = {
  tab: undefined,
  request: undefined,
  request_id: undefined,
  confirmed: false,
  accounts: [],
  rpc: null,
  preferences: undefined,

  initializeParams: function (
    accounts: LocalAccount[],
    rpc: Rpc,
    preferences: UserPreference[],
  ) {
    console.log(this);
    this.accounts = accounts;
    this.rpc = rpc;
    this.preferences = preferences;
    console.log(this);
  },

  sendRequest: function (
    sender: chrome.runtime.MessageSender,
    msg: KeychainRequestWrapper,
  ) {
    this.tab = sender.tab!.id;
    console.log(msg);
    this.request = msg.request;
    this.request_id = msg.request_id;
    init(msg.request, this.tab, msg.domain);
  },
};

export default RequestsModule;
