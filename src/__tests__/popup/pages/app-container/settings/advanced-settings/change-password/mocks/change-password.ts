import { Icons } from '@popup/icons.enum';
import AccountUtils from 'src/utils/account.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { EventType } from 'src/__tests__/utils-for-testing/enums/enums';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { ClickOrType } from 'src/__tests__/utils-for-testing/interfaces/events';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  clickAwait,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import { customRenderFixed } from 'src/__tests__/utils-for-testing/setups/render-fragment';

const i18n = {
  get: (key: string, options?: string[] | undefined) =>
    mocksImplementation.i18nGetMessageCustom(key, options),
};

const constants = {
  mk: mk.user.one,
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
  snapshotName: {
    default: 'change-password.component Default',
  },
  message: {
    wrongPassword: i18n.get('wrong_password'),
    passwordMismatch: i18n.get('popup_password_mismatch'),
    invalidPassword: i18n.get('popup_password_regex'),
    masterChanged: i18n.get('popup_master_changed'),
  },
  input: {
    wrongPassword: ['{space}', 'wrong_one'],
    badConfirmation: ['{space}', 'not_the_same1234'],
    invalids: ['short12', '12345678', 'justlow1', 'JUSTwrong', '@#$^^&*!'],
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
  await assertion.awaitMk(constants.mk);
  await clickAwait([
    alButton.menu,
    alButton.menuPreFix + Icons.SETTINGS,
    alButton.menuPreFix + Icons.PASSWORD,
  ]);
  return _asFragment;
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
  clickNType: async (
    inputPassword: { old: string; new?: string; confirmation?: string },
    submit?: boolean,
  ) => {
    let events: ClickOrType[] = [
      {
        ariaLabel: alInput.changePassword.old,
        event: EventType.TYPE,
        text: inputPassword.old,
      },
    ];
    if (inputPassword.new) {
      events.push({
        ariaLabel: alInput.changePassword.new,
        event: EventType.TYPE,
        text: inputPassword.new,
      });
    }
    if (inputPassword.confirmation) {
      events.push({
        ariaLabel: alInput.changePassword.confirmation,
        event: EventType.TYPE,
        text: inputPassword.confirmation,
      });
    }
    await clickTypeAwait(events);
    if (submit) {
      await clickAwait([alButton.submit]);
    }
  },
};

const extraMocks = {
  saveAccounts: () => (AccountUtils.saveAccounts = jest.fn()),
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};
