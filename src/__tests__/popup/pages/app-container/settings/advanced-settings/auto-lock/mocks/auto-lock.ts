import { Autolock } from '@interfaces/autolock.interface';
import { Icons } from '@popup/icons.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import dataMocks from 'src/__tests__/utils-for-testing/data/data-mocks';
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
  message: {
    saved: i18n.get('popup_html_save_successful'),
  },
};
/**
 * Intended to use App component as default.
 * You must use only inner params to handle different data/initialState.
 * Also it will return the fragment to use the snapshots feature.
 * @link https://jestjs.io/docs/snapshot-testing or https://goo.gl/fbAQLP
 */
const beforeEach = async (customAutolock?: Autolock) => {
  let _asFragment: () => DocumentFragment;
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  if (customAutolock) {
    dataMocks.customDataFromLocalStorage = { customAutolock: customAutolock };
  }
  mockPreset.setOrDefault({});
  _asFragment = customRenderFixed({
    initialState: constants.stateAs,
  }).asFragment;
  await assertion.awaitMk(constants.username);
  return _asFragment;
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
  gotoAutoLock: async () => {
    await clickAwait([
      alButton.menu,
      alButton.menuPreFix + Icons.SETTINGS,
      alButton.menuPreFix + Icons.AUTO_LOCK,
    ]);
  },
  spy: {
    saveValueInLocalStorage: () =>
      jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage'),
  },
};

const extraMocks = {
  methodName: () => {},
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};
