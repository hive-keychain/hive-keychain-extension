import { Icons } from '@popup/icons.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
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
    intro: i18n.get('popup_html_keychainify_text'),
  },
};

const beforeEach = async () => {
  let _asFragment: () => DocumentFragment;
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({});
  _asFragment = customRenderFixed({
    initialState: constants.stateAs,
  }).asFragment;
  await assertion.awaitMk(constants.username);
  await clickAwait([
    alButton.menu,
    alButton.menuPreFix + Icons.SETTINGS,
    alButton.menuPreFix + Icons.LINK,
  ]);
  return _asFragment;
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
};

const extraMocks = {
  spy: () => jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage'),
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};
