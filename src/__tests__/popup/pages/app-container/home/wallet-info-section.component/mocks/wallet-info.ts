import { screen } from '@testing-library/react';
import { ReactElement } from 'react';
import walletInfoImplementations from 'src/__tests__/popup/pages/app-container/home/wallet-info-section.component/mocks/implementations';
import walletInfoConstants from 'src/__tests__/popup/pages/app-container/home/wallet-info-section.component/mocks/wallet-info-constants';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import { MocksToUse } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import { actAdvanceTime } from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

const constants = walletInfoConstants.constants;

const beforeEach = async (
  component: ReactElement,
  toUse?: { zeroBalances?: boolean; reImplement18n?: boolean },
) => {
  let remock: MocksToUse = {};
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  if (toUse?.zeroBalances) {
    remock = {
      app: {
        getExtendedAccount: {
          ...constants.extendedAccount,
          ...constants.zeroBalances,
        },
        getAccounts: [
          { ...constants.extendedAccount, ...constants.zeroBalances },
        ],
      },
    };
  }
  mockPreset.setOrDefault(remock);
  if (toUse?.reImplement18n) {
    chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(walletInfoImplementations.i18nGetMessageCustom);
  }
  renders.wInitialState(component, constants.stateAs);
  await assertion.awaitMk(constants.username);
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
  assertManyBy: (texts: string[]) => {
    texts.forEach((text) => {
      assertion.getByText([{ arialabelOrText: text, query: QueryDOM.BYTEXT }]);
    });
  },
  assertManyByLabel: (arialabels: string[]) => {
    arialabels.forEach((ariaLabel) => {
      assertion.getByText([
        { arialabelOrText: ariaLabel, query: QueryDOM.BYLABEL },
      ]);
    });
  },
  assertRepetead: (texts: string[], repetitions: number) => {
    texts.forEach((text) => {
      expect(screen.getAllByText(text).length).toBe(repetitions);
    });
  },
};

const extraMocks = () => {};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};
