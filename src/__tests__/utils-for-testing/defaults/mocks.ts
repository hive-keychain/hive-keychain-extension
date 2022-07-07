import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import currencies from 'src/__tests__/utils-for-testing/data/currencies';
import delegations from 'src/__tests__/utils-for-testing/data/delegations';
import historyCurrency from 'src/__tests__/utils-for-testing/data/history/transactions/history.currency';
import manabar from 'src/__tests__/utils-for-testing/data/manabar';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import rpc from 'src/__tests__/utils-for-testing/data/rpc';
import tokensList from 'src/__tests__/utils-for-testing/data/tokens/tokens-list';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import {
  MocksApp,
  MocksDelegations,
  MocksHome,
  MocksPowerUp,
  MocksProposal,
  MocksTokens,
  MocksTopBar,
  MocksWalletHistory,
} from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';

const defaultAccountValue = '100000';

const _defaults = {
  _app: {
    getValueFromLocalStorage: jest
      .fn()
      .mockImplementation(mocksImplementation.getValuefromLS),
    getCurrentRpc: rpc.fake,
    getActiveAccountNameFromLocalStorage: mk.user.one,
    getRCMana: manabar,
    getAccounts: accounts.asArray.extended,
    checkRpcStatus: true,
    setRpc: rpc.fake,
    hasStoredAccounts: true,
    getMkFromLocalStorage: mk.user.one,
    getAccountsFromLocalStorage: accounts.twoAccounts,
    findUserProxy: '',
    getVP: 1,
    getVotingDollarsPerAccount: 1,
  } as MocksApp,
  _home: {
    getPrices: currencies.prices,
    getAccountValue: defaultAccountValue,
  } as MocksHome,
  _topBar: {
    hasReward: true,
  } as MocksTopBar,
  _powerUp: {
    getVestingDelegations: delegations.delegatees,
  } as MocksPowerUp,
  _delegations: {
    getDelegators: {
      data: delegations.delegators,
    },
  } as MocksDelegations,
  _walletHistory: {
    getAccountTransactions: [historyCurrency.transfers, 1000],
  } as MocksWalletHistory,
  _tokens: {
    getTokens: tokensList.alltokens,
    getUserBalance: tokensUser.balances,
  } as MocksTokens,
  _proposal: {
    hasVotedForProposal: true,
    voteForKeychainProposal: true,
  } as MocksProposal,
};

const mocksDefault = {
  _defaults,
  defaultAccountValue,
};

export default mocksDefault;
