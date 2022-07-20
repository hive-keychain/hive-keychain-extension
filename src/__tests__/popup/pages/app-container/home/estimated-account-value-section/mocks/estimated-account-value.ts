import { ReactElement } from 'react';
import alToolTip from 'src/__tests__/utils-for-testing/aria-labels/al-toolTip';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mocksDefault from 'src/__tests__/utils-for-testing/defaults/mocks';
import { overWriteMocks } from 'src/__tests__/utils-for-testing/defaults/overwrite';
import {
  EventType,
  OverwriteMock,
} from 'src/__tests__/utils-for-testing/enums/enums';
import manipulateStrings from 'src/__tests__/utils-for-testing/helpers/manipulate-strings';
import mocks from 'src/__tests__/utils-for-testing/helpers/mocks';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

const i18n = {
  get: (key: string) => mocksImplementation.i18nGetMessageCustom(key),
};

const removeExtraSpacesOnText = (key: string, toRemove: string) => {
  const original = i18n.get(key);
  const newOne = manipulateStrings.replace(original, toRemove, '');
  return manipulateStrings.removeExtraSpaces(newOne);
};

const constants = {
  label: 'Estimated Account Value',
  amountString: `$ ${mocksDefault.defaultAccountValue} USD`,
  amountNotReceived: '...',
  estimationText: removeExtraSpacesOnText(
    'popup_html_estimation_info_text',
    '<br><br>',
  ),
};

const beforeEach = async (
  component: ReactElement,
  overwriteAccountValue: boolean,
) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({});
  if (overwriteAccountValue) {
    overWriteMocks({
      home: { getAccountValue: OverwriteMock.SET_AS_NOT_IMPLEMENTED },
    });
  }
  renders.wInitialState(component, initialStates.iniStateAs.defaultExistent);
  await assertion.awaitMk(mk.user.one);
};

const methods = {
  actOnSection: async (event: EventType) => {
    await clickTypeAwait([
      {
        ariaLabel: alToolTip.custom.estimatedValueSection,
        event: event,
      },
    ]);
  },
  after: afterEach(() => {
    afterTests.clean();
  }),
};

mocks.helper();

export default {
  beforeEach,
  methods,
  constants,
};
