import { hsc } from '@api/hiveEngine';
import KeychainApi from '@api/keychain';
import { Account, ExtendedAccount, VestingDelegation } from '@hiveio/dhive';
import { Manabar } from '@hiveio/dhive/lib/chain/rc';
import { Delegator } from '@interfaces/delegations.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { Token, TokenBalance } from '@interfaces/tokens.interface';
import { Transaction } from '@interfaces/transaction.interface';
import AccountUtils from 'src/utils/account.utils';
import ActiveAccountUtils from 'src/utils/active-account.utils';
import CurrencyPricesUtils from 'src/utils/currency-prices.utils';
import HiveEngineUtils from 'src/utils/hive-engine.utils';
import HiveUtils from 'src/utils/hive.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import MkUtils from 'src/utils/mk.utils';
import PopupUtils from 'src/utils/popup.utils';
import ProposalUtils from 'src/utils/proposal.utils';
import ProxyUtils from 'src/utils/proxy.utils';
import RpcUtils from 'src/utils/rpc.utils';
import TransactionUtils from 'src/utils/transaction.utils';
import fakeData from 'src/__tests__/utils-for-testing/end-to-end-data';
import mocks from 'src/__tests__/utils-for-testing/end-to-end-mocks';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';

export enum MockPreset {
  HOMEDEFAULT = 'home-default',
  ERRORDELEGATIONS = 'error-delegation',
}
//TODO: refactor on each component After finishing E2E tests.
//TODO; to move to a separate file
//  - defaultsPresets
//  - configurable

//TODO write it hints
// will have only assignments of values
// will have predefined mocks for non necessary functions.
//TODO move all implementations to its own file:
//    -> subfolder: implementations/implementations.ts
interface TestsToUse {
  app?: {
    getValueFromLocalStorage?: jest.Mock;
    getCurrentRpc?: Rpc;
    getActiveAccountNameFromLocalStorage?: string;
    getRCMana?: Manabar;
    getAccounts?: Account[];
    checkRpcStatus?: boolean;
    setRpc?: Rpc;
    hasStoredAccounts?: boolean;
    getMkFromLocalStorage?: string;
    getAccountsFromLocalStorage?: Account[];
  };
  home?: {
    getPrices?: { data: {} };
    getAccountValue?: string | 0;
  };
  topBar?: {
    hasReward?: boolean;
  };
  powerUp?: {
    getVestingDelegations?: VestingDelegation[];
  };
  delegations?: {
    getDelegators?: { data: Delegator[] };
  };
  walletHistory?: {
    getAccountTransactions?: [Transaction[], number];
  };
  tokens?: {
    getTokens?: Token[];
    getUserBalance?: TokenBalance[];
  };
  proposal?: {
    hasVotedForProposal?: boolean;
    voteForKeychainProposal?: boolean;
  };
}
const _defaults = {
  _app: {
    getValueFromLocalStorage: jest
      .fn()
      .mockImplementation(mocks.getValuefromLS), //default implementation
    getCurrentRpc: fakeData.rpc.privex,
    getActiveAccountNameFromLocalStorage: fakeData.mk.userData1,
    getRCMana: fakeData.manabar.manabarMin,
    getAccounts: fakeData.accounts.extendedAccountFull,
    checkRpcStatus: true,
    setRpc: fakeData.rpc.privex,
    hasStoredAccounts: true,
    getMkFromLocalStorage: fakeData.mk.userData1,
    getAccountsFromLocalStorage: fakeData.accounts.twoAccounts,
    findUserProxy: '',
  },
  _home: {
    getPrices: fakeData.prices,
    getAccountValue: '100000',
  },
  _topBar: {
    hasReward: true,
  },
  _powerUp: {
    getVestingDelegations: fakeData.delegations.delegatees,
  },
  _delegations: {
    getDelegators: {
      data: fakeData.delegations.delegators,
    },
  },
  _walletHistory: {
    getAccountTransactions: [
      fakeData.history.account.transactions.transfers,
      1000,
    ],
  },
  _tokens: {
    getTokens: fakeData.tokens.alltokens,
    getUserBalance: fakeData.tokens.user.balances,
  },
  _proposal: {
    hasVotedForProposal: true,
    voteForKeychainProposal: true,
  },
};
const setOrDefault = (toUse: {
  app?: {
    getValueFromLocalStorage?: jest.Mock;
    getCurrentRpc?: Rpc;
    getActiveAccountNameFromLocalStorage?: string;
    getRCMana?: Manabar;
    getAccounts?: ExtendedAccount[];
    checkRpcStatus?: boolean;
    setRpc?: Rpc;
    hasStoredAccounts?: boolean;
    getMkFromLocalStorage?: string;
    getAccountsFromLocalStorage?: Account[];
    findUserProxy?: string | null;
  };
  home?: {
    getPrices?: { data: {} };
    getAccountValue?: string | 0;
  };
  topBar?: {
    hasReward?: boolean;
  };
  powerUp?: {
    getVestingDelegations?: VestingDelegation[];
  };
  delegations?: {
    getDelegators?: { data: Delegator[] };
  };
  walletHistory?: {
    getAccountTransactions?: [Transaction[], number];
  };
  tokens?: {
    getTokens?: Token[];
    getUserBalance?: TokenBalance[];
  };
  proposal?: {
    hasVotedForProposal?: boolean;
    voteForKeychainProposal?: boolean;
  };
}) => {
  const {
    app,
    home,
    topBar,
    powerUp,
    delegations,
    walletHistory,
    tokens,
    proposal,
  } = toUse;
  //default values
  const {
    _app,
    _home,
    _walletHistory,
    _delegations,
    _powerUp,
    _proposal,
    _tokens,
    _topBar,
  } = _defaults;

  //if (app) {
  LocalStorageUtils.getValueFromLocalStorage = jest
    .fn()
    .mockImplementation(
      (app && app.getValueFromLocalStorage) ?? _app.getValueFromLocalStorage,
    );
  // if (app.getValueFromLocalStorage) {
  //   LocalStorageUtils.getValueFromLocalStorage = jest
  //     .fn()
  //     .mockImplementation(app.getValueFromLocalStorage);
  // }
  RpcUtils.getCurrentRpc = jest
    .fn()
    .mockResolvedValue((app && app.getCurrentRpc) ?? _app.getCurrentRpc);
  // if (app.getCurrentRpc) {
  //   RpcUtils.getCurrentRpc = jest.fn().mockResolvedValue(app.getCurrentRpc);
  // }
  ActiveAccountUtils.getActiveAccountNameFromLocalStorage = jest
    .fn()
    .mockResolvedValue(
      (app && app.getActiveAccountNameFromLocalStorage) ??
        _app.getActiveAccountNameFromLocalStorage,
    );
  // if (app.getActiveAccountNameFromLocalStorage) {
  //   ActiveAccountUtils.getActiveAccountNameFromLocalStorage = jest
  //     .fn()
  //     .mockResolvedValue(app.getActiveAccountNameFromLocalStorage);
  // }
  HiveUtils.getClient().rc.getRCMana = jest
    .fn()
    .mockResolvedValue((app && app.getRCMana) ?? _app.getRCMana);
  // if (app.getRCMana) {
  //   HiveUtils.getClient().rc.getRCMana = jest
  //     .fn()
  //     .mockResolvedValue(app.getRCMana);
  // }
  HiveUtils.getClient().database.getAccounts = jest
    .fn()
    .mockResolvedValue((app && app.getAccounts) ?? _app.getAccounts);
  // if (app.getAccounts) {
  //   HiveUtils.getClient().database.getAccounts = jest
  //     .fn()
  //     .mockResolvedValue(app.getAccounts);
  // }
  RpcUtils.checkRpcStatus = jest
    .fn()
    .mockResolvedValue((app && app.checkRpcStatus) ?? _app.checkRpcStatus);
  // if (app.checkRpcStatus) {
  //   RpcUtils.checkRpcStatus = jest.fn().mockResolvedValue(app.checkRpcStatus);
  // }
  HiveUtils.setRpc = jest
    .fn()
    .mockResolvedValue((app && app.setRpc) ?? _app.setRpc);
  // if (app.setRpc) {
  //   HiveUtils.setRpc = jest.fn().mockResolvedValue(app.setRpc);
  // }
  AccountUtils.hasStoredAccounts = jest
    .fn()
    .mockResolvedValue(
      (app && app.hasStoredAccounts) ?? _app.hasStoredAccounts,
    );
  // if (app.hasStoredAccounts) {
  //   AccountUtils.hasStoredAccounts = jest
  //     .fn()
  //     .mockResolvedValue(app.hasStoredAccounts);
  // }
  MkUtils.getMkFromLocalStorage = jest
    .fn()
    .mockResolvedValue(
      (app && app.getMkFromLocalStorage) ?? _app.getMkFromLocalStorage,
    );
  // if (app.getMkFromLocalStorage) {
  //   MkUtils.getMkFromLocalStorage = jest
  //     .fn()
  //     .mockResolvedValue(app.getMkFromLocalStorage);
  // }
  AccountUtils.getAccountsFromLocalStorage = jest
    .fn()
    .mockResolvedValue(
      (app && app.getAccountsFromLocalStorage) ??
        _app.getAccountsFromLocalStorage,
    );
  // if (app.getAccountsFromLocalStorage) {
  //   AccountUtils.getAccountsFromLocalStorage = jest
  //     .fn()
  //     .mockResolvedValue(app.getAccountsFromLocalStorage);
  // }
  ProxyUtils.findUserProxy = jest
    .fn()
    .mockResolvedValue((app && app.findUserProxy) ?? _app.findUserProxy);

  //fixed responses as they won't need changes.
  HiveUtils.getClient().database.getDynamicGlobalProperties = jest
    .fn()
    .mockResolvedValue(utilsT.dynamicPropertiesObj);
  HiveUtils.getClient().database.getCurrentMedianHistoryPrice = jest
    .fn()
    .mockResolvedValue(utilsT.fakeCurrentMedianHistoryPrice);
  HiveUtils.getClient().database.call = jest
    .fn()
    .mockResolvedValue(utilsT.fakePostRewardFundResponse);
  chrome.i18n.getMessage = jest
    .fn()
    .mockImplementation(mocks.i18nGetMessageCustom);
  //END fixed responses as they won't need changes.

  //no implementations
  chrome.runtime.sendMessage = jest.fn(); //no impl
  PopupUtils.fixPopupOnMacOs = jest.fn(); //no impl
  chrome.tabs.create = jest.fn(); //no impl
  LocalStorageUtils.saveValueInLocalStorage = jest.fn(); //no impl
  chrome.storage.local.clear = jest.fn(); //no impl
  LocalStorageUtils.removeFromLocalStorage = jest.fn(); //no impl
  //END no implementations
  //}

  //if (home) {
  CurrencyPricesUtils.getPrices = jest
    .fn()
    .mockResolvedValue((home && home.getPrices) ?? _home.getPrices);
  // if (home.getPrices) {
  //   CurrencyPricesUtils.getPrices = jest
  //     .fn()
  //     .mockResolvedValue(home.getPrices);
  // }
  AccountUtils.getAccountValue = jest
    .fn()
    .mockReturnValue((home && home.getAccountValue) ?? _home.getAccountValue);
  // if (home.getAccountValue) {
  //   AccountUtils.getAccountValue = jest
  //     .fn()
  //     .mockReturnValue(home.getAccountValue);
  // }
  //}

  //if (topBar) {
  ActiveAccountUtils.hasReward = jest
    .fn()
    .mockReturnValue((topBar && topBar.hasReward) ?? _topBar.hasReward);
  //}

  //if (powerUp) {
  HiveUtils.getClient().database.getVestingDelegations = jest
    .fn()
    .mockResolvedValue(
      (powerUp && powerUp.getVestingDelegations) ??
        _powerUp.getVestingDelegations,
    );
  //}

  //if (delegations) {
  KeychainApi.get = jest
    .fn()
    .mockResolvedValue(
      (delegations && delegations.getDelegators) ?? _delegations.getDelegators,
    );
  //}
  //walletHistory:
  //if (walletHistory) {
  TransactionUtils.getAccountTransactions = jest
    .fn()
    .mockResolvedValue(
      (walletHistory && walletHistory.getAccountTransactions) ??
        _walletHistory.getAccountTransactions,
    );
  //}
  //tokens:
  //if (tokens) {
  //if (tokens.getTokens) {
  hsc.find = jest
    .fn()
    .mockResolvedValue((tokens && tokens.getTokens) ?? _tokens.getTokens);
  //}
  //if (tokens.getUserBalance) {
  HiveEngineUtils.getUserBalance = jest
    .fn()
    .mockResolvedValue(
      (tokens && tokens.getUserBalance) ?? _tokens.getUserBalance,
    );
  //}
  //}
  //proposal
  //if (proposal) {
  //if (proposal.hasVotedForProposal) {
  ProposalUtils.hasVotedForProposal = jest
    .fn()
    .mockResolvedValue(
      (proposal && proposal.hasVotedForProposal) ??
        _proposal.hasVotedForProposal,
    );
  //}
  //if (proposal.voteForKeychainProposal) {
  ProposalUtils.voteForKeychainProposal = jest
    .fn()
    .mockResolvedValue(
      (proposal && proposal.voteForKeychainProposal) ??
        _proposal.voteForKeychainProposal,
    );
  //}
  //}
  // if (Object.keys(toUse).length === 0) {
  //   console.log('Loaded all by default!');
  // } else {
  //   console.log('Loaded: ', toUse);
  // }
};

//TODO move to its own file.
//this function will just set the specified functions = jest.fn() so no implementation
//intended to cause needed errors.
//TODO see if is possible to refactor this as iteraing over the upcomming tpOverWrite
//instead of a lot of conditionals.
export enum OverwriteMock {
  SET_AS_NOT_IMPLEMENTED = 'set_as_non_implemented',
}
const overWrite = (toOverWrite: {
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
}) => {
  const {
    app,
    home,
    topBar,
    powerUp,
    delegations,
    walletHistory,
    tokens,
    proposal,
  } = toOverWrite;

  if (
    app?.getAccountsFromLocalStorage === OverwriteMock.SET_AS_NOT_IMPLEMENTED
  ) {
    LocalStorageUtils.getValueFromLocalStorage = jest.fn();
  }
  if (app?.getCurrentRpc === OverwriteMock.SET_AS_NOT_IMPLEMENTED) {
    RpcUtils.getCurrentRpc = jest.fn();
  }
  if (
    app?.getActiveAccountNameFromLocalStorage ===
    OverwriteMock.SET_AS_NOT_IMPLEMENTED
  ) {
    ActiveAccountUtils.getActiveAccountNameFromLocalStorage = jest.fn();
  }
  if (app?.getRCMana === OverwriteMock.SET_AS_NOT_IMPLEMENTED) {
    HiveUtils.getClient().rc.getRCMana = jest.fn();
  }
  if (app?.getAccounts === OverwriteMock.SET_AS_NOT_IMPLEMENTED) {
    HiveUtils.getClient().database.getAccounts = jest.fn();
  }
  if (app?.checkRpcStatus === OverwriteMock.SET_AS_NOT_IMPLEMENTED) {
    RpcUtils.checkRpcStatus = jest.fn();
  }
  if (app?.setRpc === OverwriteMock.SET_AS_NOT_IMPLEMENTED) {
    HiveUtils.setRpc = jest.fn();
  }
  if (app?.hasStoredAccounts === OverwriteMock.SET_AS_NOT_IMPLEMENTED) {
    AccountUtils.hasStoredAccounts = jest.fn();
  }
  if (app?.getMkFromLocalStorage === OverwriteMock.SET_AS_NOT_IMPLEMENTED) {
    MkUtils.getMkFromLocalStorage = jest.fn();
  }
  if (
    app?.getAccountsFromLocalStorage === OverwriteMock.SET_AS_NOT_IMPLEMENTED
  ) {
    AccountUtils.getAccountsFromLocalStorage = jest.fn();
  }
  if (app?.findUserProxy === OverwriteMock.SET_AS_NOT_IMPLEMENTED) {
    ProxyUtils.findUserProxy = jest.fn();
  }
  if (home?.getPrices === OverwriteMock.SET_AS_NOT_IMPLEMENTED) {
    CurrencyPricesUtils.getPrices = jest.fn();
  }
  if (home?.getAccountValue === OverwriteMock.SET_AS_NOT_IMPLEMENTED) {
    AccountUtils.getAccountValue = jest.fn();
  }
  if (topBar?.hasReward === OverwriteMock.SET_AS_NOT_IMPLEMENTED) {
    ActiveAccountUtils.hasReward = jest.fn();
  }
  if (powerUp?.getVestingDelegations === OverwriteMock.SET_AS_NOT_IMPLEMENTED) {
    HiveUtils.getClient().database.getVestingDelegations = jest.fn();
  }
  if (delegations?.getDelegators === OverwriteMock.SET_AS_NOT_IMPLEMENTED) {
    KeychainApi.get = jest.fn();
  }
  if (
    walletHistory?.getAccountTransactions ===
    OverwriteMock.SET_AS_NOT_IMPLEMENTED
  ) {
    TransactionUtils.getAccountTransactions = jest.fn();
  }
  if (tokens?.getTokens === OverwriteMock.SET_AS_NOT_IMPLEMENTED) {
    hsc.find = jest.fn();
  }
  if (tokens?.getUserBalance === OverwriteMock.SET_AS_NOT_IMPLEMENTED) {
    HiveEngineUtils.getUserBalance = jest.fn();
  }
  if (proposal?.hasVotedForProposal === OverwriteMock.SET_AS_NOT_IMPLEMENTED) {
    ProposalUtils.hasVotedForProposal = jest.fn();
  }
  if (
    proposal?.voteForKeychainProposal === OverwriteMock.SET_AS_NOT_IMPLEMENTED
  ) {
    ProposalUtils.voteForKeychainProposal = jest.fn();
  }
};

const load = (
  preset: MockPreset,
  mk: string,
  accounts: LocalAccount[],
  //reMock: ToUse | null,
) => {
  const defaultPresets = {
    app: mocks.mocksApp({
      fixPopupOnMacOs: jest.fn(),
      getValueFromLocalStorage: jest
        .fn()
        .mockImplementation(mocks.getValuefromLS),
      getCurrentRpc: fakeData.rpc.fake,
      activeAccountUsername: mk,
      getRCMana: fakeData.manabar.manabarMin,
      getAccounts: fakeData.accounts.extendedAccountFull,
      rpcStatus: true,
      setRpc: jest.fn(),
      chromeSendMessage: jest.fn(),
      hasStoredAccounts: true,
      mkLocal: mk,
      getAccountsFromLocalStorage: accounts,
      hasVotedForProposal: true,
      voteForKeychainProposal: jest.fn(),
      chromeTabsCreate: jest.fn(),
      i18nGetMessage: jest.fn().mockImplementation(mocks.i18nGetMessage),
      saveValueInLocalStorage: jest.fn(),
      clearLocalStorage: jest.fn(),
      removeFromLocalStorage: jest.fn(),
    }),
    home: mocks.mocksHome({
      getPrices: fakeData.prices,
      getAccountValue: '100000',
    }),
    topBar: mocks.mocksTopBar({
      hasReward: false,
    }),
    powerUp: mocks.mocksPowerUp({
      getVestingDelegations: jest
        .fn()
        .mockResolvedValue(utilsT.fakeGetDelegateesResponse),
    }),
    delegations: mocks.mocksDelegations({
      getDelegators: jest.fn().mockResolvedValue({
        data: utilsT.fakeGetDelegatorsResponse,
      }),
    }),
    walletHistory: mocks.mocksWalletHistory({
      getAccountTransactions: jest
        .fn()
        .mockResolvedValue(utilsT.expectedDataGetAccountHistory),
    }),
    tokens: mocks.mocksTokens({
      getAllTokens: jest.fn().mockResolvedValue(utilsT.fakeTokensResponse),
      getUserBalance: jest
        .fn()
        .mockResolvedValue(utilsT.fakeGetUserBalanceResponse),
    }),
  };
  let presetObj = {
    preset: defaultPresets,
    description: 'This preset will load all needed to load home page',
  };
  switch (preset) {
    case MockPreset.ERRORDELEGATIONS:
      presetObj = {
        preset: {
          ...defaultPresets,
          powerUp: mocks.mocksPowerUp({
            getVestingDelegations: jest.fn(),
          }),
          delegations: mocks.mocksDelegations({
            getDelegators: jest.fn(),
          }),
        },
        description: 'This presets load home but no delegations response',
      };
      break;
    case MockPreset.HOMEDEFAULT:
      break;
  }
  return presetObj;
};

const mockPreset = {
  load,
  setOrDefault,
  overWrite,
};

export default mockPreset;
