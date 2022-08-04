import { Icons } from '@popup/icons.enum';
import Config from 'src/config';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import manabar from 'src/__tests__/utils-for-testing/data/manabar';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import { MocksToUse } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import { customRenderFixed } from 'src/__tests__/utils-for-testing/setups/render-fragment';

const constants = {
  username: mk.user.one,
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
  snapshotName: {
    withData: 'automated-tasks.component With Data',
    noData: 'automated-tasks.component No Data',
  },
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
          ...manabar,
          max_mana: Config.claims.freeAccount.MIN_RC + 1,
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
};

export default {
  beforeEach,
  methods,
  constants,
};
