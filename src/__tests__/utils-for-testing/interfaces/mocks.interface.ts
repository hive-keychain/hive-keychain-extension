import { ExtendedAccount, VestingDelegation } from '@hiveio/dhive';
import { Manabar } from '@hiveio/dhive/lib/chain/rc';
import { Delegator } from '@interfaces/delegations.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { Token, TokenBalance } from '@interfaces/tokens.interface';
import { Transaction } from '@interfaces/transaction.interface';
import { OverwriteMock } from 'src/__tests__/utils-for-testing/enums/enums';

export interface MocksApp {
  getValueFromLocalStorage?: jest.Mock;
  getCurrentRpc?: Rpc;
  getActiveAccountNameFromLocalStorage?: string;
  getRCMana?: Manabar;
  getAccounts?: ExtendedAccount[];
  checkRpcStatus?: boolean;
  setRpc?: Rpc;
  hasStoredAccounts?: boolean;
  getMkFromLocalStorage?: string;
  getAccountsFromLocalStorage?: LocalAccount[];
  findUserProxy?: string;
  getVP?: number;
  getVotingDollarsPerAccount?: number;
}

export interface MocksHome {
  getPrices?: { data: {} };
  getAccountValue?: string | 0;
}

export interface MocksTopBar {
  hasReward?: boolean;
}

export interface MocksPowerUp {
  getVestingDelegations?: VestingDelegation[];
}

export interface MocksDelegations {
  getDelegators?: { data: Delegator[] };
}

export interface MocksWalletHistory {
  getAccountTransactions?: [Transaction[], number];
}

export interface MocksTokens {
  getTokens?: Token[];
  getUserBalance?: TokenBalance[];
}
export interface MocksProposal {
  hasVotedForProposal?: boolean;
  voteForKeychainProposal?: boolean;
}

export interface MocksToUse {
  app?: MocksApp;
  home?: MocksHome;
  topBar?: MocksTopBar;
  powerUp?: MocksPowerUp;
  delegations?: MocksDelegations;
  walletHistory?: MocksWalletHistory;
  tokens?: MocksTokens;
  proposal?: MocksProposal;
}

export interface MockVotingProposal {
  voteForProposal?: boolean;
  unvoteForProposal?: boolean;
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
