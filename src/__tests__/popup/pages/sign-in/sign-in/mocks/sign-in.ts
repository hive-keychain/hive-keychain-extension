import { act } from '@testing-library/react';
import { ReactElement } from 'react';
import MkUtils from 'src/utils/mk.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { EventType } from 'src/__tests__/utils-for-testing/enums/enums';
import mocks from 'src/__tests__/utils-for-testing/helpers/mocks';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { initialStateWAccountsWActiveAccountStore } from 'src/__tests__/utils-for-testing/initial-states';
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
};

const methods = {
  typeNEnter: async () => {
    await clickTypeAwait([
      {
        ariaLabel: alInput.password,
        event: EventType.TYPE,
        text: 'incorrect_password{enter}',
      },
    ]);
  },
  typeNClick: async () => {
    await clickTypeAwait([
      {
        ariaLabel: alInput.password,
        event: EventType.TYPE,
        text: 'incorrect_password',
      },
      { ariaLabel: alButton.login, event: EventType.CLICK },
    ]);
  },
};

const extraMocks = (loginValue: boolean) => {
  MkUtils.login = jest.fn().mockResolvedValueOnce(loginValue);
};

mocks.helper();

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};
