import { hsc } from '@api/hiveEngine';
import KeychainApi from '@api/keychain';
import { LocalAccount } from '@interfaces/local-account.interface';
import AccountUtils from 'src/utils/account.utils';
import ActiveAccountUtils from 'src/utils/active-account.utils';
import CurrencyPricesUtils from 'src/utils/currency-prices.utils';
import HiveEngineUtils from 'src/utils/hive-engine.utils';
import HiveUtils from 'src/utils/hive.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import MkUtils from 'src/utils/mk.utils';
import ProposalUtils from 'src/utils/proposal.utils';
import ProxyUtils from 'src/utils/proxy.utils';
import RpcUtils from 'src/utils/rpc.utils';
import TransactionUtils from 'src/utils/transaction.utils';
import withFixedValues from 'src/__tests__/utils-for-testing/defaults/fixed';
import mocksDefault from 'src/__tests__/utils-for-testing/defaults/mocks';
import initialMocks from 'src/__tests__/utils-for-testing/defaults/noImplentationNeeded';
import fakeData from 'src/__tests__/utils-for-testing/end-to-end-data';
import mocks from 'src/__tests__/utils-for-testing/end-to-end-mocks';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import { MocksToUse } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';

export enum MockPreset {
  HOMEDEFAULT = 'home-default',
  ERRORDELEGATIONS = 'error-delegation',
}

const setOrDefault = (toUse: MocksToUse) => {
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
  const {
    _app,
    _home,
    _walletHistory,
    _delegations,
    _powerUp,
    _proposal,
    _tokens,
    _topBar,
  } = mocksDefault._defaults;
  LocalStorageUtils.getValueFromLocalStorage = jest
    .fn()
    .mockImplementation(
      (app && app.getValueFromLocalStorage) ?? _app.getValueFromLocalStorage,
    );
  RpcUtils.getCurrentRpc = jest
    .fn()
    .mockResolvedValue((app && app.getCurrentRpc) ?? _app.getCurrentRpc);
  ActiveAccountUtils.getActiveAccountNameFromLocalStorage = jest
    .fn()
    .mockResolvedValue(
      (app && app.getActiveAccountNameFromLocalStorage) ??
        _app.getActiveAccountNameFromLocalStorage,
    );
  HiveUtils.getClient().rc.getRCMana = jest
    .fn()
    .mockResolvedValue((app && app.getRCMana) ?? _app.getRCMana);
  HiveUtils.getClient().database.getAccounts = jest
    .fn()
    .mockResolvedValue((app && app.getAccounts) ?? _app.getAccounts);
  RpcUtils.checkRpcStatus = jest
    .fn()
    .mockResolvedValue((app && app.checkRpcStatus) ?? _app.checkRpcStatus);
  HiveUtils.setRpc = jest
    .fn()
    .mockResolvedValue((app && app.setRpc) ?? _app.setRpc);
  AccountUtils.hasStoredAccounts = jest
    .fn()
    .mockResolvedValue(
      (app && app.hasStoredAccounts) ?? _app.hasStoredAccounts,
    );
  MkUtils.getMkFromLocalStorage = jest
    .fn()
    .mockResolvedValue(
      (app && app.getMkFromLocalStorage) ?? _app.getMkFromLocalStorage,
    );
  AccountUtils.getAccountsFromLocalStorage = jest
    .fn()
    .mockResolvedValue(
      (app && app.getAccountsFromLocalStorage) ??
        _app.getAccountsFromLocalStorage,
    );
  ProxyUtils.findUserProxy = jest
    .fn()
    .mockResolvedValue((app && app.findUserProxy) ?? _app.findUserProxy);

  CurrencyPricesUtils.getPrices = jest
    .fn()
    .mockResolvedValue((home && home.getPrices) ?? _home.getPrices);
  AccountUtils.getAccountValue = jest
    .fn()
    .mockReturnValue((home && home.getAccountValue) ?? _home.getAccountValue);
  ActiveAccountUtils.hasReward = jest
    .fn()
    .mockReturnValue((topBar && topBar.hasReward) ?? _topBar.hasReward);
  HiveUtils.getClient().database.getVestingDelegations = jest
    .fn()
    .mockResolvedValue(
      (powerUp && powerUp.getVestingDelegations) ??
        _powerUp.getVestingDelegations,
    );
  KeychainApi.get = jest
    .fn()
    .mockResolvedValue(
      (delegations && delegations.getDelegators) ?? _delegations.getDelegators,
    );
  TransactionUtils.getAccountTransactions = jest
    .fn()
    .mockResolvedValue(
      (walletHistory && walletHistory.getAccountTransactions) ??
        _walletHistory.getAccountTransactions,
    );
  hsc.find = jest
    .fn()
    .mockResolvedValue((tokens && tokens.getTokens) ?? _tokens.getTokens);
  HiveEngineUtils.getUserBalance = jest
    .fn()
    .mockResolvedValue(
      (tokens && tokens.getUserBalance) ?? _tokens.getUserBalance,
    );
  ProposalUtils.hasVotedForProposal = jest
    .fn()
    .mockResolvedValue(
      (proposal && proposal.hasVotedForProposal) ??
        _proposal.hasVotedForProposal,
    );
  ProposalUtils.voteForKeychainProposal = jest
    .fn()
    .mockResolvedValue(
      (proposal && proposal.voteForKeychainProposal) ??
        _proposal.voteForKeychainProposal,
    );
  initialMocks.noImplentationNeeded();
  withFixedValues();
};

const load = (preset: MockPreset, mk: string, accounts: LocalAccount[]) => {
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
};

export default mockPreset;
