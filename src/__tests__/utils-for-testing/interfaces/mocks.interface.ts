import { ExtendedAccount, VestingDelegation } from '@hiveio/dhive';
import { Manabar } from '@hiveio/dhive/lib/chain/rc';
import { Autolock } from '@interfaces/autolock.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { TokenDelegation } from '@interfaces/token-delegation.interface';
import { TokenBalance, TokenMarket } from '@interfaces/tokens.interface';
import { Transaction } from '@interfaces/transaction.interface';
import { OverwriteMock } from 'src/__tests__/utils-for-testing/enums/enums';
import { KeyChainApiGetCustomData } from 'src/__tests__/utils-for-testing/interfaces/implementations';

export interface MocksApp {
  getValueFromLocalStorage?: jest.Mock;
  getCurrentRpc?: Rpc;
  getActiveAccountNameFromLocalStorage?: string;
  getRCMana?: Manabar;
  getAccount?: ExtendedAccount[];
  getExtendedAccount?: ExtendedAccount;
  checkRpcStatus?: boolean;
  hasStoredAccounts?: boolean;
  getMkFromLocalStorage?: string;
  getAccountsFromLocalStorage?: LocalAccount[];
  findUserProxy?: string;
  getVP?: number;
  getVotingDollarsPerAccount?: number;
}
export interface MocksHome {
  getAccountValue?: string | 0;
}
export interface MocksTopBar {
  hasReward?: boolean;
}
export interface MocksPowerUp {
  getVestingDelegations?: VestingDelegation[];
}
export interface MocksWalletHistory {
  getAccountTransactions?: [Transaction[], number];
}
export interface MocksTokens {
  getUserBalance?: TokenBalance[];
  getIncomingDelegations?: TokenDelegation[];
  getOutgoingDelegations?: TokenDelegation[];
  getAllTokens?: any[];
  getTokensMarket?: TokenMarket[];
}
export interface MocksProposal {
  hasVotedForProposal?: boolean;
  voteForKeychainProposal?: boolean;
}
export interface MocksKeyChainApi {
  customData?: KeyChainApiGetCustomData;
}
export interface GetManifest {
  version: string;
  name: string;
}
/**
 * sendMessage, for now is the only mandatory default as jest.fn() = not implemented.
 * Can be changed and customised in the future as required.
 */
export interface MocksChromeRunTime {
  getManifest?: GetManifest;
  sendMessage: jest.Mock;
}
export interface MocksToUse {
  app?: MocksApp;
  home?: MocksHome;
  topBar?: MocksTopBar;
  powerUp?: MocksPowerUp;
  walletHistory?: MocksWalletHistory;
  tokens?: MocksTokens;
  proposal?: MocksProposal;
  chromeRunTime?: MocksChromeRunTime;
  keyChainApiGet?: MocksKeyChainApi;
}

export interface MockVotingProposal {
  voteForProposal?: boolean;
  unvoteForProposal?: boolean;
}
export interface MockProxy {
  findUserProxy?: string | null;
  setAsProxy?: string | boolean | undefined;
  removeProxy?: boolean;
}
export interface CustomDataFromLocalStorage {
  accountHistoryApi?: string[];
  customRpcList?: string[];
  customAutolock?: Autolock;
  customSwitchAuto?: boolean;
  customsRpcs?: Rpc[];
  customAuthorizedOP?: NoConfirm;
  customlastVersionSeen?: string;
}

export interface MocksOverwrite {
  app?: {
    getValueFromLocalStorage?: OverwriteMock;
    getCurrentRpc?: OverwriteMock;
    getActiveAccountNameFromLocalStorage?: OverwriteMock;
    getRCMana?: OverwriteMock;
    getAccounts?: OverwriteMock;
    checkRpcStatus?: OverwriteMock;
    setRpc?: OverwriteMock;
    hasStoredAccounts?: OverwriteMock;
    getMkFromLocalStorage?: OverwriteMock;
    getAccountsFromLocalStorage?: OverwriteMock;
    findUserProxy?: OverwriteMock;
    getVP?: OverwriteMock;
    getVotingDollarsPerAccount?: OverwriteMock;
  };
  home?: {
    getPrices?: OverwriteMock;
    getAccountValue?: OverwriteMock;
  };
  topBar?: {
    hasReward?: OverwriteMock;
  };
  powerUp?: {
    getVestingDelegations?: OverwriteMock;
  };
  delegations?: {
    getDelegators?: OverwriteMock;
  };
  walletHistory?: {
    getAccountTransactions?: OverwriteMock;
  };
  tokens?: {
    getTokens?: OverwriteMock;
    getUserBalance?: OverwriteMock;
  };
  proposal?: {
    hasVotedForProposal?: OverwriteMock;
    voteForKeychainProposal?: OverwriteMock;
  };
}
