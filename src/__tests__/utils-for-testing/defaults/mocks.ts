import fakeData from 'src/__tests__/utils-for-testing/end-to-end-data';
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

const _defaults = {
  _app: {
    getValueFromLocalStorage: jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom),
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
  } as MocksApp,
  _home: {
    getPrices: fakeData.prices,
    getAccountValue: '100000',
  } as MocksHome,
  _topBar: {
    hasReward: true,
  } as MocksTopBar,
  _powerUp: {
    getVestingDelegations: fakeData.delegations.delegatees,
  } as MocksPowerUp,
  _delegations: {
    getDelegators: {
      data: fakeData.delegations.delegators,
    },
  } as MocksDelegations,
  _walletHistory: {
    getAccountTransactions: [
      fakeData.history.account.transactions.transfers,
      1000,
    ],
  } as MocksWalletHistory,
  _tokens: {
    getTokens: fakeData.tokens.alltokens,
    getUserBalance: fakeData.tokens.user.balances,
  } as MocksTokens,
  _proposal: {
    hasVotedForProposal: true,
    voteForKeychainProposal: true,
  } as MocksProposal,
};

const mocksDefault = {
  _defaults,
};

export default mocksDefault;
