import { ReactElement } from 'react';
import { HiveEngineConfigUtils } from 'src/utils/hive-engine-config.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import tokenHistory from 'src/__tests__/utils-for-testing/data/history/transactions/tokens/token-history';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';

let _asFragment: DocumentFragment;

const i18n = {
  get: (key: string, options?: string[] | undefined) =>
    mocksImplementation.i18nGetMessageCustom(key, options),
};

const constants = {
  username: mk.user.one,
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
};

const beforeEach = async (
  component: ReactElement,
  noTokenHistoryData: boolean = false,
) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({});
  extraMocks.getAccountHistoryApi(noTokenHistoryData);
  //renders.wInitialState(component, constants.stateAs);
  const { asFragment } = customRender(component, {
    initialState: constants.stateAs,
  });
  _asFragment = asFragment();
  await assertion.awaitMk(constants.username);
  await clickAwait([
    alButton.actionBtn.tokens,
    alIcon.tokens.prefix.history + 'LEO',
  ]);
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
};

const extraMocks = {
  getAccountHistoryApi: (noData: boolean) =>
    (HiveEngineConfigUtils.getAccountHistoryApi().get = jest
      .fn()
      .mockResolvedValueOnce({ data: noData ? [] : tokenHistory.leoToken })
      .mockResolvedValueOnce({ data: [] })),
};

/**
 * Conveniently to add data to be checked on home page, as text or aria labels.
 */
const userInformation = () => {};

export default {
  beforeEach,
  userInformation,
  methods,
  constants,
  extraMocks,
};
