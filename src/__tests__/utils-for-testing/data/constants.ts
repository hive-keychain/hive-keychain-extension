import KeychainApi from '@api/keychain';
import AccountUtils from 'src/utils/account.utils';
import ActiveAccountUtils from 'src/utils/active-account.utils';
import CurrencyPricesUtils from 'src/utils/currency-prices.utils';
import { HiveEngineConfigUtils } from 'src/utils/hive-engine-config.utils';
import HiveUtils from 'src/utils/hive.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import MkUtils from 'src/utils/mk.utils';
import ProposalUtils from 'src/utils/proposal.utils';
import ProxyUtils from 'src/utils/proxy.utils';
import RpcUtils from 'src/utils/rpc.utils';
import TokensUtils from 'src/utils/tokens.utils';
import TransactionUtils from 'src/utils/transaction.utils';
//TODO see if this whole module is needed at all
// check which mocks must be deleted, using interfaces as support.
export const toOverWriteFuntions: any = {
  getValueFromLocalStorage: () =>
    (LocalStorageUtils.getValueFromLocalStorage = jest.fn()),
  getCurrentRpc: () => (RpcUtils.getCurrentRpc = jest.fn()),
  getActiveAccountNameFromLocalStorage: () =>
    (ActiveAccountUtils.getActiveAccountNameFromLocalStorage = jest.fn()),
  getRCMana: () => (AccountUtils.getRCMana = jest.fn()),
  getAccount: () => (AccountUtils.getExtendedAccount = jest.fn()),
  getExtendedAccount: () => (AccountUtils.getAccount = jest.fn()),
  checkRpcStatus: () => (RpcUtils.checkRpcStatus = jest.fn()),
  setRpc: () => (HiveUtils.setRpc = jest.fn()),
  hasStoredAccounts: () => (AccountUtils.hasStoredAccounts = jest.fn()),
  getMkFromLocalStorage: () => (MkUtils.getMkFromLocalStorage = jest.fn()),
  getAccountsFromLocalStorage: () =>
    (AccountUtils.getAccountsFromLocalStorage = jest.fn()),
  findUserProxy: () => (ProxyUtils.findUserProxy = jest.fn()),
  getPrices: () => (CurrencyPricesUtils.getPrices = jest.fn()),
  getAccountValue: () => (AccountUtils.getAccountValue = jest.fn()),
  hasReward: () => (ActiveAccountUtils.hasReward = jest.fn()),
  //TODO fix these 2
  getVestingDelegations: () =>
    (HiveUtils.getClient().database.getVestingDelegations = jest.fn()),
  getDelegators: () => (KeychainApi.get = jest.fn()),
  //TIL here
  getAccountTransactions: () =>
    (TransactionUtils.getAccountTransactions = jest.fn()),
  getTokens: () => (HiveEngineConfigUtils.getApi().find = jest.fn()),
  getUserBalance: () => (TokensUtils.getUserBalance = jest.fn()),
  hasVotedForProposal: () => (ProposalUtils.hasVotedForProposal = jest.fn()),
  voteForKeychainProposal: () =>
    (ProposalUtils.voteForKeychainProposal = jest.fn()),
  getVP: () => (HiveUtils.getVP = jest.fn()),
  getVotingDollarsPerAccount: () =>
    (HiveUtils.getVotingDollarsPerAccount = jest.fn()),
};
