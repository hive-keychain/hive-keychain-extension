import { ReactElement } from 'react';
import MkUtils from 'src/utils/mk.utils';
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
import { clickTypeAwait } from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

const constants = {
  errorMessage: mocksImplementation.i18nGetMessageCustom('wrong_password'),
  stateAs: {
    ...initialStates.iniStateAs.defaultExistent,
    mk: '',
  } as RootState,
};

const beforeEach = async (component: ReactElement) => {
  jest.useFakeTimers('legacy');
  mockPreset.setOrDefault({ app: { getMkFromLocalStorage: mk.empty } });
  renders.wInitialState(component, constants.stateAs);
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
  login: (loginValue: boolean) =>
    (MkUtils.login = jest.fn().mockResolvedValue(loginValue)),
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};
