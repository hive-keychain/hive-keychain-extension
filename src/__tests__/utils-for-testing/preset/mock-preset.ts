import { hsc } from '@api/hiveEngine';
import KeychainApi from '@api/keychain';
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

export default { setOrDefault };
