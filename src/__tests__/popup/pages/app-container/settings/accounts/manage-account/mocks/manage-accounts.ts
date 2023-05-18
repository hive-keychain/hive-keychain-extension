import { ExtendedAccount } from '@hiveio/dhive';
import { KeyType } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Icons } from '@popup/icons.enum';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import {
  EventType,
  KeyToUse,
  KeyToUseNoMaster,
  QueryDOM,
} from 'src/__tests__/utils-for-testing/enums/enums';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import manipulateStrings from 'src/__tests__/utils-for-testing/helpers/manipulate-strings';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { KeyShowed } from 'src/__tests__/utils-for-testing/interfaces/test-objects';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  clickAwait,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import { customRenderFixed } from 'src/__tests__/utils-for-testing/setups/render-fragment';
import { KeyNamePopupHtml } from 'src/__tests__/utils-for-testing/types/keys-types';
import AccountUtils from 'src/utils/account.utils';

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
  localAccount: [
    accounts.local.oneAllkeys,
    accounts.local.two,
  ] as LocalAccount[],
  authorizedLocalAccount: [
    {
      ...accounts.local.oneAllkeys,
      keys: {
        ...accounts.local.oneAllkeys.keys,
        postingPubkey: `@${mk.user.two}`,
      },
    } as LocalAccount,
    accounts.local.two,
  ] as LocalAccount[],
  localAccountDeletedOne: [accounts.local.two] as LocalAccount[],
  dataUserTwoLoaded: [
    {
      ...accounts.extended,
      name: mk.user.two,
    } as ExtendedAccount,
  ],
  message: {
    copied: i18n.get('popup_html_copied'),
    toDeleteAccount: i18n.get(
      'popup_html_delete_account_confirmation_message',
      [mk.user.one],
    ),
    usingAuthorized: i18n.get('html_popup_using_authorized_account', [
      `@${mk.user.two}`,
    ]),
    addKey: {
      text: (keyType: KeyType) => {
        const _keyType =
          keyType.substring(0, 1) + keyType.substring(1).toLowerCase();
        return manipulateStrings.removeHtmlTags(
          i18n.get('popup_html_add_key_text', [`${_keyType}`]),
        );
      },
      missingFields: i18n.get('popup_accounts_fill'),
      isPublicKey: i18n.get('popup_account_password_is_public_key'),
      incorrectUser: i18n.get('popup_accounts_incorrect_user'),
      incorrectKey: i18n.get('popup_accounts_incorrect_key'),
    },
  },
};

const beforeEach = async (feedLocalAccount?: {
  localAccount: LocalAccount[];
}) => {
  let localAccounts: LocalAccount[] = constants.localAccount;
  let stateAs: RootState = constants.stateAs;
  if (feedLocalAccount) {
    localAccounts = feedLocalAccount.localAccount;
  }
  let _asFragment: () => DocumentFragment;
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({
    app: { getAccountsFromLocalStorage: localAccounts },
  });
  _asFragment = customRenderFixed({
    initialState: stateAs,
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
  gotoManageAccounts: async () => {
    await clickAwait([
      alButton.menu,
      alButton.menuSettingsPeople,
      alButton.menuPreFix + Icons.MANAGE_ACCOUNTS,
    ]);
  },
  removeKeysLocalAccount: (
    removeTo: LocalAccount,
    removeKeys: KeyToUseNoMaster[],
  ) => {
    removeKeys.forEach((key) => {
      delete removeTo.keys[key];
      delete removeTo.keys[`${key}Pubkey`];
    });
  },
  clickNAssert: async (ariaLabel: string) => {
    await clickAwait([ariaLabel]);
    assertion.getByLabelText(alComponent.confirmationPage);
    await clickAwait([alButton.dialog.confirm]);
    await assertion.awaitFor(alComponent.homePage, QueryDOM.BYLABEL);
  },
  clickNType: async (
    key: KeyNamePopupHtml,
    text: string,
    clickImport?: boolean,
  ) => {
    await clickAwait([alIcon.keys.list.preFix.add + methods.getKeyName(key)]);
    await clickTypeAwait([
      {
        ariaLabel: alInput.privateKey,
        event: EventType.TYPE,
        text: text,
      },
    ]);
    if (clickImport) {
      await clickAwait([alButton.importKeys]);
    }
  },
  asserByText: async (text: string) =>
    await assertion.awaitFor(text, QueryDOM.BYTEXT),
};

const extraMocks = {
  /**
   * Will load the second account.
   */
  remockGetAccount: () =>
    (AccountUtils.getAccount = jest
      .fn()
      .mockResolvedValue(constants.dataUserTwoLoaded)),
  scrollNotImpl: () => (Element.prototype.scrollIntoView = jest.fn()),
  deleteAccount: () =>
    (AccountUtils.deleteAccount = jest
      .fn()
      .mockReturnValue(constants.localAccountDeletedOne)),
  getAccount: (extendedAccount: ExtendedAccount[]) =>
    (AccountUtils.getAccount = jest.fn().mockResolvedValue(extendedAccount)),
};

export default {
  // beforeEach,
  // methods,
  // constants,
  // extraMocks,
  // keys,
};
