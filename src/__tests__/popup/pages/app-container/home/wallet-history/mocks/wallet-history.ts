import { ReactElement } from 'react';
import TransactionUtils from 'src/utils/transaction.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
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

const constants = {
  username: mk.user.one,
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
};

const beforeEach = async (
  component: ReactElement,
  toUse?: {
    emptyTransactions?: boolean;
    todo?: boolean;
  },
) => {
  let remock: MocksToUse = {};
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  if (toUse?.emptyTransactions) {
    remock = { walletHistory: { getAccountTransactions: [[], -1] } };
    extraMocks.getLastTransaction(0);
  }
  mockPreset.setOrDefault(remock);
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
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};
