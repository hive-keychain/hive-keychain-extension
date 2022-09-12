import { Transaction, Transfer } from '@interfaces/transaction.interface';
import { ReactElement } from 'react';
import TransactionUtils from 'src/utils/transaction.utils';
import implementationsWalletHistory from 'src/__tests__/popup/pages/app-container/home/wallet-history/mocks/implementations';
import results from 'src/__tests__/popup/pages/app-container/home/wallet-history/mocks/results';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import walletHistory from 'src/__tests__/utils-for-testing/data/history/transactions/wallet-history';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { EventType } from 'src/__tests__/utils-for-testing/enums/enums';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import {
  MocksToUse,
  MocksWalletHistory,
} from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  clickAwait,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';
interface ToUse {
  emptyTransactions?: boolean;
  reImplementFilter?: string;
  noTransfersOnData?: boolean;
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
  },
  transfer: {
    allDataNoTransfer: walletHistory.allTypes.filter(
      (trans) => trans.type !== 'transfer',
    ),
    data: walletHistory.allTypes.filter(
      (trans) => trans.type === 'transfer',
    )[0] as Transfer,
    toolTip: '2022/05/20 , 04:11:33 pm',
  },
  results: results.filtersLengths,
  error: {
    emptyList: mocksImplementation.i18nGetMessageCustom(
      'popup_html_transaction_list_is_empty',
    ),
    tryClearFilter: mocksImplementation.i18nGetMessageCustom(
      'popup_html_transaction_list_is_empty_try_clear_filter',
    ),
  },
};

const beforeEach = async (component: ReactElement, toUse?: ToUse) => {
  let walletHistory: MocksWalletHistory = {
    getAccountTransactions: [constants.transactions.allTypes, 1000],
  };
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  if (toUse?.noTransfersOnData) {
    walletHistory = {
      getAccountTransactions: [constants.transfer.allDataNoTransfer, 1000],
    };
  }
  if (toUse?.emptyTransactions) {
    walletHistory = { getAccountTransactions: [[], 1] };
    extraMocks.getLastTransaction(-1);
  } else {
    extraMocks.getLastTransaction(-1);
  }
  let remock: MocksToUse = { walletHistory: walletHistory };
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
  extraMocks.scrollToNotImpl();
  renders.wInitialState(component, constants.stateAs);
  await assertion.awaitMk(constants.username);
  await clickAwait([alButton.actionBtn.history]);
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
  typeInput: async (ariaLabel: string, text: string) => {
    await clickTypeAwait([
      {
        ariaLabel: ariaLabel,
        event: EventType.TYPE,
        text: text,
      },
    ]);
  },
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
