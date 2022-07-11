import { Transaction } from '@interfaces/transaction.interface';
import { ReactElement } from 'react';
import TransactionUtils from 'src/utils/transaction.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import walletHistory from 'src/__tests__/utils-for-testing/data/history/transactions/wallet-history';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

const prefix = alDiv.wallet.history.filterSelector.preFix;

const filterOpType = [
  'transfer',
  'claim_reward_balance',
  'delegate_vesting_shares',
  'claim_account',
  'savings',
  'power_up_down',
  'convert',
].map((filter) => prefix + filter);

const constants = {
  username: mk.user.one,
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
  transactions: {
    length: walletHistory.allTypes.length,
    allTypes: walletHistory.allTypes as Transaction[],
  },
  filter: {
    ariaLabelsToFind: [
      alInput.filter.walletHistory,
      alDiv.wallet.history.clearFilters,
      alDiv.wallet.history.byIn,
      alDiv.wallet.history.byOut,
      ...filterOpType,
    ],
  },
  typeValue: {
    empty: '',
    random: 'random',
    uniqueValue: '6.666',
  },
};

const beforeEach = async (
  component: ReactElement,
  toUse?: {
    emptyTransactions?: boolean;
    todo?: boolean;
  },
) => {
  //let remock: MocksToUse = {};
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({
    walletHistory: {
      getAccountTransactions: [constants.transactions.allTypes, 1000],
    },
  });
  extraMocks.getLastTransaction(-1);
  if (toUse?.emptyTransactions) {
    //remock = { walletHistory: { getAccountTransactions: [[], -1] } };
    extraMocks.getAccountTransactions();
    extraMocks.getLastTransaction(1000);
  }
  //mockPreset.setOrDefault(remock);
  renders.wInitialState(component, constants.stateAs);
  await assertion.awaitMk(constants.username);
  await clickAwait([alButton.actionBtn.history]);
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
};

const extraMocks = {
  getLastTransaction: (lastTransaction: number) =>
    (TransactionUtils.getLastTransaction = jest
      .fn()
      .mockResolvedValue(lastTransaction)),
  getAccountTransactions: () => {
    TransactionUtils.getAccountTransactions = jest
      .fn()
      .mockResolvedValue([[], 1000]);
  },
  scrollToNotImpl: () => {
    Element.prototype.scrollTo = jest.fn();
  },
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
  filterOpType,
};
