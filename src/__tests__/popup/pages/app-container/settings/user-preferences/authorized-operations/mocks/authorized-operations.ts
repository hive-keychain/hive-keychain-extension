import { Icons } from '@popup/icons.enum';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import dataMocks from 'src/__tests__/utils-for-testing/data/data-mocks';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { CustomDataFromLocalStorage } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';
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
  data: {
    authorizedOP: {
      'keychain.tests': {
        'splinterlands.com': {
          signTx: true,
          post: true,
        },
        'leofinance.com': {
          signTx: true,
          post: true,
        },
      },
    },
  },
  message: {
    info: i18n.get('popup_html_pref_info'),
    noWhitelisted: i18n.get('popup_html_no_pref'),
  },
};

const beforeEach = async (toUse?: CustomDataFromLocalStorage) => {
  let _asFragment: () => DocumentFragment;
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  if (toUse) {
    dataMocks.customDataFromLocalStorage = toUse;
  }
  mockPreset.setOrDefault({});
  _asFragment = customRenderFixed({
    initialState: constants.stateAs,
  }).asFragment;
  await assertion.awaitMk(constants.username);
  await clickAwait([
    alButton.menu,
    alButton.menuPreFix + Icons.PREFERENCES,
    alButton.menuPreFix + Icons.AUTHORIZED_OPERATIONS,
  ]);
  return _asFragment;
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
};

export default {
  beforeEach,
  methods,
  constants,
};
