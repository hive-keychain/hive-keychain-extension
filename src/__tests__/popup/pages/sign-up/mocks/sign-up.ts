import { ReactElement } from 'react';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { EventType } from 'src/__tests__/utils-for-testing/enums/enums';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import {
  actAdvanceTime,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

const constants = {
  stateAs: { ...initialStates.iniStateAs.emptyState } as RootState,
};

const beforeEach = async (component: ReactElement) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({
    app: {
      hasStoredAccounts: false,
      getActiveAccountNameFromLocalStorage: mk.empty,
      getAccountsFromLocalStorage: [],
      getMkFromLocalStorage: mk.empty,
    },
  });
  renders.wInitialState(component, constants.stateAs);
  await assertion.awaitFind(alComponent.signUp);
};

const methods = {
  message: (key: string) => mocksImplementation.i18nGetMessageCustom(key),
  typeNEnter: async (password: string, confirmation: string) => {
    await clickTypeAwait([
      { ariaLabel: alInput.password, event: EventType.TYPE, text: password },
      {
        ariaLabel: alComponent.inputConfirmation,
        event: EventType.TYPE,
        text: confirmation,
      },
    ]);
  },
  typeNClick: async (password: string, confirmation: string) => {
    await clickTypeAwait([
      { ariaLabel: alInput.password, event: EventType.TYPE, text: password },
      {
        ariaLabel: alComponent.inputConfirmation,
        event: EventType.TYPE,
        text: confirmation,
      },
      { ariaLabel: alButton.signUp, event: EventType.CLICK },
    ]);
  },
};

export default {
  // beforeEach,
  // methods,
};
