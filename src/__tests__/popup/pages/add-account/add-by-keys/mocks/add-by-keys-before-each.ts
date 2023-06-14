import { LocalAccount } from '@interfaces/local-account.interface';
import { ReactElement } from 'react';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import { actAdvanceTime } from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';
//TODO delete file after refactoring add-account sections
const beforeEach = async (
  component: ReactElement,
  accounts: LocalAccount[],
  hasStoredAccounts: boolean,
) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({
    app: { hasStoredAccounts: hasStoredAccounts },
  });
  renders.wInitialState(component, {
    ...initialStates.iniState,
    accounts: accounts,
  });
};

export default { beforeEach };
