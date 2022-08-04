import { Icons } from '@popup/icons.enum';
import { ReactElement } from 'react';
import AccountUtils from 'src/utils/account.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
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

const ariaLabelPage = [
  alComponent.account.subMenu.addAccount.router,
  alComponent.account.subMenu.manageAccount,
];

const constants = {
  username: mk.user.one,
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
};

const beforeEach = async (component: ReactElement) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({});
  renders.wInitialState(component, constants.stateAs);
  await assertion.awaitMk(constants.username);
  await clickAwait([alButton.menu, alButton.menuPreFix + Icons.ACCOUNTS]);
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
};

const extraMocks = {
  spyDownloadAccount: jest.spyOn(AccountUtils, 'downloadAccounts'),
  createObjectURL: () => (window.URL.createObjectURL = jest.fn()),
  aClick: (HTMLAnchorElement.prototype.click = jest.fn()),
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
  ariaLabelPage,
};
