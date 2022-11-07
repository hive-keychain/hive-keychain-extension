import { screen } from '@testing-library/react';
import { ReactElement } from 'react';
import HiveUtils from 'src/utils/hive.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alDropdown from 'src/__tests__/utils-for-testing/aria-labels/al-dropdown';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import {
  EventType,
  QueryDOM,
} from 'src/__tests__/utils-for-testing/enums/enums';
import mocks from 'src/__tests__/utils-for-testing/helpers/mocks';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { ClickOrType } from 'src/__tests__/utils-for-testing/interfaces/events';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import {
  actAdvanceTime,
  clickAwait,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

const beforeEach = async (component: ReactElement) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  // actRunAllTimers();
  mockPreset.setOrDefault({});
  renders.wInitialState(component, initialStates.iniStateAs.defaultExistent);
  expect(await screen.findByText(mk.user.one)).toBeDefined();
};

const methods = {
  clickAwaitDrop: async (ariaLabel: string) =>
    await clickAwait([ariaLabel, alDropdown.span.convert]),
  typeNClick: async (amount: string, confirm: boolean) => {
    let events: ClickOrType[] = [
      { ariaLabel: alInput.amount, event: EventType.TYPE, text: amount },
      { ariaLabel: alButton.submit, event: EventType.CLICK },
    ];
    if (confirm) {
      events.push({
        ariaLabel: alButton.dialog.confirm,
        event: EventType.CLICK,
      });
    }
    await clickTypeAwait(events);
  },
  tobeInTheDoc: (keyMessage: string) => {
    assertion.getByText([
      {
        arialabelOrText: methods.message(keyMessage),
        query: QueryDOM.BYTEXT,
      },
    ]);
  },
  message: (key: string) => mocksImplementation.i18nGetMessageCustom(key),
};

const extraMocks = (convertOperation: boolean) => {
  HiveUtils.convertOperation = jest.fn().mockResolvedValue(convertOperation);
};

mocks.helper();

export default {
  beforeEach,
  methods,
  extraMocks,
};
