import { Transaction, Transfer } from '@interfaces/transaction.interface';
import { ReactElement } from 'react';
import TransactionUtils from 'src/utils/transaction.utils';
import implementationsWalletHistory from 'src/__tests__/popup/pages/app-container/home/wallet-history/mocks/implementations';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import walletHistory from 'src/__tests__/utils-for-testing/data/history/transactions/wallet-history';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import { MocksToUse } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';
interface KeyValue {
  [key: string]: number;
}
const { getValueFilterfromLS, updateFilterToUse } =
  implementationsWalletHistory;
const filters = [
  'transfer',
  'claim_reward_balance',
  'delegate_vesting_shares',
  'claim_account',
  'savings',
  'power_up_down',
  'convert',
];
const prefix = alDiv.wallet.history.filterSelector.preFix;

const filterOpType = filters.map((filter) => prefix + filter);

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
    transferExpanded: walletHistory.allTypes.filter(
      (trans) => trans.type === 'transfer',
    )[0] as Transfer,
    transfer: {
      toolTip: '2022/05/20 , 04:11:33 pm',
    },
  },
  results: {
    lengths: {
      transfer: 1,
      claim_reward_balance: 1,
      delegate_vesting_shares: 1,
      claim_account: 1,
      savings: 3,
      power_up_down: 2,
      convert: 4,
    } as KeyValue,
    in: {
      transfer: 1,
      claim_reward_balance: 1,
      claim_account: 1,
      savings: 3,
      power_up_down: 2,
      convert: 4,
    } as KeyValue,
    out: {
      transfer: 0,
      claim_reward_balance: 1,
      claim_account: 1,
      savings: 3,
      power_up_down: 2,
      convert: 4,
    } as KeyValue,
  },
};

const beforeEach = async (
  component: ReactElement,
  toUse?: {
    emptyTransactions?: boolean;
    reImplementFilter?: string;
  },
) => {
  let remock: MocksToUse = {};
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  remock = {
    walletHistory: {
      getAccountTransactions: [constants.transactions.allTypes, 1000],
    },
  };
  //TODO ask cedric???
  if (toUse?.emptyTransactions) {
    remock = { walletHistory: { getAccountTransactions: [[], 0] } };
    extraMocks.getLastTransaction(0);
  } else {
    extraMocks.getLastTransaction(-1);
  }
  if (toUse?.reImplementFilter) {
    updateFilterToUse(toUse.reImplementFilter);
    remock = {
      ...remock,
      app: {
        getValueFromLocalStorage: jest
          .fn()
          .mockImplementation(getValueFilterfromLS),
      },
    };
  }
  mockPreset.setOrDefault(remock);
  // extraMocks.getLastTransaction(-1);
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
  filters,
  prefix,
};
