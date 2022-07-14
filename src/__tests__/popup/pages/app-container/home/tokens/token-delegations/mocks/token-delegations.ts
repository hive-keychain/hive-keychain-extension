import { ReactElement } from 'react';
import HiveEngineUtils from 'src/utils/hive-engine.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
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
  message: {
    cooldown: mocksImplementation.i18nGetMessageCustom(
      'popup_html_token_undelegation_cooldown_disclaimer',
      ['LEO', '40'],
    ),
    header: {
      incoming: mocksImplementation.i18nGetMessageCustom(
        'popup_html_total_incoming',
      ),
      outgoing: mocksImplementation.i18nGetMessageCustom(
        'popup_html_total_outgoing',
      ),
    },
  },
};

const beforeEach = async (component: ReactElement) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({});
  extraMocks.getIncomingDelegations();
  extraMocks.getOutgoingDelegations();
  renders.wInitialState(component, constants.stateAs);
  await assertion.awaitMk(constants.username);
  await clickAwait([alButton.actionBtn.tokens]);
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
};

const extraMocks = {
  getIncomingDelegations: () =>
    (HiveEngineUtils.getIncomingDelegations = jest
      .fn()
      .mockResolvedValue(tokensUser.incomingDelegations)),
  getOutgoingDelegations: () =>
    (HiveEngineUtils.getOutgoingDelegations = jest
      .fn()
      .mockResolvedValue(tokensUser.incomingDelegations)),
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};
