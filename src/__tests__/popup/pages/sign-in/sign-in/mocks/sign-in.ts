import { act } from '@testing-library/react';
import { ReactElement } from 'react';
import MkUtils from 'src/utils/mk.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { EventType } from 'src/__tests__/utils-for-testing/enums/enums';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { initialStateWAccountsWActiveAccountStore } from 'src/__tests__/utils-for-testing/initial-states';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import { clickTypeAwait } from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

const constants = {
  errorMessage: mocksImplementation.i18nGetMessageCustom('wrong_password'),
};

const beforeEach = async (component: ReactElement) => {
  jest.useFakeTimers('legacy');
  act(() => {
    jest.advanceTimersByTime(4300);
  });
  mockPreset.setOrDefault({ app: { getMkFromLocalStorage: mk.empty } });
  renders.wInitialState(component, initialStateWAccountsWActiveAccountStore);
  await assertion.awaitFind(alComponent.signIn);
};

const methods = {
  typeNEnter: async (text: string) => {
    await clickTypeAwait([
      {
        ariaLabel: alInput.password,
        event: EventType.TYPE,
        text: text,
      },
    ]);
  },
  typeNClick: async (text: string) => {
    await clickTypeAwait([
      {
        ariaLabel: alInput.password,
        event: EventType.TYPE,
        text: text,
      },
      { ariaLabel: alButton.login, event: EventType.CLICK },
    ]);
  },
};

const extraMocks = {
  login: (loginValue: boolean) => jest.fn().mockResolvedValue(loginValue),
  getMkFromLocalStorage: () =>
    (MkUtils.getMkFromLocalStorage = jest.fn().mockResolvedValue(mk.user.one)),
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};
