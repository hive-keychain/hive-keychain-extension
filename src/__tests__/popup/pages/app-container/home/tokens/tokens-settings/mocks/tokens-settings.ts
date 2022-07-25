import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
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
import { customRenderFixed } from 'src/__tests__/utils-for-testing/setups/render-fragment';

const i18n = {
  get: (key: string, options?: string[] | undefined) =>
    mocksImplementation.i18nGetMessageCustom(key, options),
};

const constants = {
  username: mk.user.one,
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
  snapshotName: {
    withData: '',
    noData: '',
  },
  //   panel: {
  //     rpc: alSelect.tokens.settings.panel.rpc,
  //     accountHistory: alSelect.tokens.settings.panel.accountHistory,
  //   },
};
/**
 * Intended to use App component as default.
 * You must use only inner params to handle different data/initialState.
 * Also it will return the fragment to use the snapshots feature.
 * @link https://jestjs.io/docs/snapshot-testing or https://goo.gl/fbAQLP
 */
const beforeEach = async (toUse?: { noCustomAccountHistoryApi?: boolean }) => {
  let _asFragment: () => DocumentFragment;
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({});

  _asFragment = customRenderFixed({
    initialState: constants.stateAs,
  }).asFragment;

  await assertion.awaitMk(constants.username);
  await clickAwait([alButton.actionBtn.tokens, alIcon.tokens.settings]);
  return _asFragment;
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
  //   clickOnSelect: async (panelAriaLabel: string) => {
  //     await clickAwait([panelAriaLabel]);
  //   },
};

const extraMocks = {
  methodName: () => '',
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};
