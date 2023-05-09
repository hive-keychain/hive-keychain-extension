import { Icons } from '@popup/icons.enum';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { MocksToUse } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import { customRenderFixed } from 'src/__tests__/utils-for-testing/setups/render-fragment';
import Config from 'src/config';
import AutomatedTasksUtils from 'src/utils/automatedTasks.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const i18n = {
  get: (key: string, options?: string[] | undefined) =>
    mocksImplementation.i18nGetMessageCustom(key, options),
};

const constants = {
  username: mk.user.one,
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
  data: {
    getClaims: {
      claimAccounts: {
        'keychain.tests': true,
      },
      claimRewards: {
        'keychain.tests': true,
      },
      claimSavings: {
        'keychain.tests': true,
      },
    },
  },
  message: {
    intro: i18n.get('popup_html_automated_intro'),
    autoclaimInfo: i18n.get('popup_html_enable_autoclaim_accounts_info', [
      Config.claims.freeAccount.MIN_RC_PCT + '',
    ]),
  },
};

const beforeEach = async (toUse?: {
  passData?: boolean;
  maxManaGreater?: boolean;
}) => {
  let _asFragment: () => DocumentFragment;
  let remock: MocksToUse = {};
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  if (toUse?.passData) {
    extraMocks.getMultipleValueFromLocalStorage();
  }
  if (toUse?.maxManaGreater) {
    remock = {
      app: {
        getRCMana: {
          current_mana: 1000,
          percentage: 100,
          max_mana: Config.claims.freeAccount.MIN_RC + 1,
          received_delegated_rc: 0,
          max_rc: 0,
          delegated_rc: 0,
          //adding while refactoring //TODO check & fix
          rc_manabar: { current_mana: '10000000', last_update_time: 12321324 },
        },
      },
    };
  }
  mockPreset.setOrDefault(remock);
  _asFragment = customRenderFixed({
    initialState: constants.stateAs,
  }).asFragment;
  await assertion.awaitMk(constants.username);
  await clickAwait([
    alButton.menu,
    alButton.menuPreFix + Icons.PREFERENCES,
    alButton.menuPreFix + Icons.AUTOMATED_TASKS,
  ]);
  return _asFragment;
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
};

const extraMocks = {
  getMultipleValueFromLocalStorage: () =>
    (LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(constants.data.getClaims)),
  remockAccounts: () => {
    mockPreset.setOrDefault({
      app: {
        getExtendedAccount: {
          ...accounts.extended,
          name: mk.user.two,
        },
      },
    });
  },
  spySaveClaims: jest.spyOn(AutomatedTasksUtils, 'saveClaims'),
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};
