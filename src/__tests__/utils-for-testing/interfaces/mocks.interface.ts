import { ExtendedAccount, VestingDelegation } from '@hiveio/dhive';
import { RC } from '@interfaces/active-account.interface';
import { Autolock } from '@interfaces/autolock.interface';
import { Conversion } from '@interfaces/conversion.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import { RcDelegation } from '@interfaces/rc-delegation.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { TokenDelegation } from '@interfaces/token-delegation.interface';
import {
  TokenBalance,
  TokenMarket,
  TokenTransaction,
} from '@interfaces/tokens.interface';
import { Transaction } from '@interfaces/transaction.interface';
import { WalletHistoryFilter } from '@popup/pages/app-container/home/wallet-history/wallet-history.component';
import { OverwriteMock } from 'src/__tests__/utils-for-testing/enums/enums';
import { KeyChainApiGetCustomData } from 'src/__tests__/utils-for-testing/interfaces/implementations';

export interface MocksApp {
  getValueFromLocalStorage?: jest.Mock;
  getCurrentRpc?: Rpc;
  getActiveAccountNameFromLocalStorage?: string;
  getRCMana?: RC;
  getAccount?: ExtendedAccount[];
  getExtendedAccount?: ExtendedAccount;
  getExtendedAccounts?: ExtendedAccount[];
  checkRpcStatus?: boolean;
  hasStoredAccounts?: boolean;
  getMkFromLocalStorage?: string;
  getAccountsFromLocalStorage?: LocalAccount[];
  findUserProxy?: string;
  getVP?: number;
  getVotingDollarsPerAccount?: number;
  getAccountPrice?: number;
}
export interface MocksHome {
  getAccountValue?: string | 0;
}
export interface MocksTopBar {
  hasReward?: boolean;
}
export interface MocksPowerUp {
  getVestingDelegations?: VestingDelegation[];
  getPendingOutgoingUndelegation?: [];
  getAllOutgoingDelegations?: RcDelegation[];
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
  getTokenHistory?: TokenTransaction[];
}
export interface MocksProposal {
  hasVotedForProposal?: boolean;
  voteForKeychainProposal?: boolean;
  isRequestingProposalVotes?: boolean;
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

export interface MocksGoogleAnalytics {
  initializeGoogleAnalytics?: string;
}

export interface MocksSurvey {
  byPassing: boolean;
}

export interface MocksConvertionRequests {
  getConversionRequests: Conversion[];
}

export interface MocksGovernance {
  bypass: boolean;
  accountsToRemind: string[];
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
  keyChainApiGet?: KeyChainApiGetCustomData;
  googleAnalytics?: MocksGoogleAnalytics;
  survey?: MocksSurvey;
  convertions?: MocksConvertionRequests;
  governance?: MocksGovernance;
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
/**
 * Some needed as string, to being able to stringify & parse.
 */
export interface CustomDataFromLocalStorage {
  accountHistoryApi?: string[];
  customRpcList?: string[] | string;
  customAutolock?: Autolock | string;
  customSwitchAuto?: boolean;
  customsRpcs?: Rpc[];
  customAuthorizedOP?: NoConfirm | string;
  customlastVersionSeen?: string;
  customStorageVersion?: string | number;
  customCurrentRpc?: Rpc;
  customMK?: string;
  customAccounts?: string;
  customWalletHistoryFilters?: WalletHistoryFilter;
  customHideSuggestionProxy?: { [key: string]: boolean };
  customFavoriteUsers?: { [key: string]: string[] };
  customHiddenTokenList?: string[];
  customKeychainifyEnabled?: boolean;
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
