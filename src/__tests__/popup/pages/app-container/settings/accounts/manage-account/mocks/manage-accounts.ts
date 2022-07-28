import { ExtendedAccount } from '@hiveio/dhive';
import { Icons } from '@popup/icons.enum';
import AccountUtils from 'src/utils/account.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import { KeyToUse } from 'src/__tests__/utils-for-testing/enums/enums';
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

type KeyNamePopupHtml =
  | 'popup_html_posting'
  | 'popup_html_active'
  | 'popup_html_memo';

interface KeyShowed {
  keyName: KeyNamePopupHtml;
  key: KeyToUse;
  privateKey: string;
}
const keys: KeyShowed[] = [
  {
    keyName: 'popup_html_active',
    key: KeyToUse.ACTIVE,
    privateKey: userData.one.nonEncryptKeys.active,
  },
  {
    keyName: 'popup_html_posting',
    key: KeyToUse.POSTING,
    privateKey: userData.one.nonEncryptKeys.posting,
  },
  {
    keyName: 'popup_html_memo',
    key: KeyToUse.MEMO,
    privateKey: userData.one.nonEncryptKeys.memo,
  },
];

const i18n = {
  get: (key: string, options?: string[] | undefined) =>
    mocksImplementation.i18nGetMessageCustom(key, options),
};

const constants = {
  username: mk.user.one,
  stateAs: initialStates.iniStateAs.defaultExistentAllKeys as RootState,
  justLocalAccounts: initialStates.iniStateAs.defaultExistentAllKeys.accounts,
  snapshotName: {
    withData: {
      default: 'manage-account.component ALL KEYS',
    },
  },
  dataUserTwoLoaded: [
    {
      ...accounts.extended,
      name: mk.user.two,
    } as ExtendedAccount,
  ],
  message: {
    copied: i18n.get('popup_html_copied'),
  },
};
/**
 * Intended to use App component as default.
 * You must use only inner params to handle different data/initialState.
 * Also it will return the fragment to use the snapshots feature.
 * @link https://jestjs.io/docs/snapshot-testing or https://goo.gl/fbAQLP
 */
const beforeEach = async (noTokenHistoryData: boolean = false) => {
  let _asFragment: () => DocumentFragment;
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({
    app: { getAccountsFromLocalStorage: constants.justLocalAccounts },
  });
  _asFragment = customRenderFixed({
    initialState: constants.stateAs,
  }).asFragment;
  await assertion.awaitMk(constants.username);
  await clickAwait([
    alButton.menu,
    alButton.menuSettingsPeople,
    alButton.menuPreFix + Icons.MANAGE_ACCOUNTS,
  ]);
  return _asFragment;
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
  getKeyName: (keyName: KeyNamePopupHtml) => i18n.get(keyName),
};

const extraMocks = {
  remockGetAccount: () =>
    (AccountUtils.getAccount = jest
      .fn()
      .mockResolvedValue(constants.dataUserTwoLoaded)),
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
  keys,
};
