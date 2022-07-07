import KeychainApi from '@api/keychain';
import { ReactElement } from 'react';
import HiveUtils from 'src/utils/hive.utils';
import alDropdown from 'src/__tests__/utils-for-testing/aria-labels/al-dropdown';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import phishing from 'src/__tests__/utils-for-testing/data/phishing';
import { KeyMessage } from 'src/__tests__/utils-for-testing/enums/enums';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import mocks from 'src/__tests__/utils-for-testing/helpers/mocks';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

// enum KeyMessage {
//   MISSING_FIELDS = 'popup_html_fill_form_error',
//   NEGATIVE_AMOUNT = 'popup_html_need_positive_amount',
//   NOT_ENOUGH_BALANCE = 'popup_html_power_up_down_error',
//   RECURRENT_MISSING_FIELDS = 'popup_html_transfer_recurrent_missing_field',
//   WARNING_PHISHING = 'popup_warning_phishing',
//   CONFIRM_RECURRENT = 'popup_html_transfer_confirm_cancel_recurrent',
//   CONFIRM_TRANSFER = 'popup_html_transfer_confirm_text',
//   SUCCESS_TRANSFER = 'popup_html_transfer_successful',
//   SUCCESS_CANCEL_RECURRENT = 'popup_html_cancel_transfer_recurrent_successful',
//   SUCCESS_RECURRENT = 'popup_html_transfer_recurrent_successful',
//   FAILED_TRANSFER = 'popup_html_transfer_failed',
// }

const i18n = {
  get: (key: string, extra?: any) =>
    mocksImplementation.i18nGetMessageCustom(key, [extra]),
};

const constants = {
  username: mk.user.one,
  anotherUser: mk.user.two,
  phishingAccount: phishing.accounts.data[0],
  exchange: {
    accepting: {
      hive: 'bittrex',
      hbd: 'ionomy',
    },
    notAccepting: {
      hive: 'binance-hot',
      hbd: 'hot.dunamu',
    },
  },
  memoMessage: {
    nonEncrypted: 'This is an awesome test on Hive Keychain!',
    toEncrypt: '# This is encrypted MEMO on HIVE Keychain.',
    encryptedLabel: '# This is encrypted MEMO on HIVE Keychain. (encrypted)',
  },
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
  balanceTextOnScreen: {
    hive: ['Balance', '1,000.000 HIVE'],
  },
  keyMessage: {
    fields: i18n.get(KeyMessage.MISSING_FIELDS),
    negative: i18n.get(KeyMessage.NEGATIVE_AMOUNT),
    insufficient: i18n.get(KeyMessage.NOT_ENOUGH_BALANCE),
    recurrentFields: i18n.get(KeyMessage.RECURRENT_MISSING_FIELDS),
    successRecurrent: i18n.get(KeyMessage.SUCCESS_RECURRENT),
    successCancelRecurrent: i18n.get(KeyMessage.SUCCESS_CANCEL_RECURRENT),
    warningPhising: (receiverUsername: string) =>
      i18n.get(KeyMessage.WARNING_PHISHING, [receiverUsername]),
    confirmRecurrent: i18n
      .get(KeyMessage.CONFIRM_RECURRENT)
      .replace('<br>', ''),
    confirmTransfer: i18n.get(KeyMessage.CONFIRM_TRANSFER).split('<br>')[0],
    failTransfer: i18n.get(KeyMessage.FAILED_TRANSFER),
    exchangeWarning: (currency: string) =>
      i18n.get(KeyMessage.EXCHANGE_WARNING, [currency]),
    memoWarning: i18n.get(KeyMessage.EXCHANGE_MEMO),
    warningRecurrent: i18n.get(KeyMessage.EXCHANGE_WARNING_RECURRENT),
    successTransfer: (receiverUsername: string, formattedAmount: string) =>
      i18n.get(KeyMessage.SUCCESS_TRANSFER, [
        `@${receiverUsername}`,
        formattedAmount,
      ]),
  },
};

const beforeEach = async (
  component: ReactElement,
  dropDownTo: string,
  remove?: {
    activeKey?: string;
    memoKey?: string;
  },
) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({});
  if (remove?.activeKey) {
    methods.removeKey(remove.activeKey);
  }
  if (remove?.memoKey) {
    methods.removeKey(remove.memoKey);
  }
  extraMocks.getPhishingAccounts();
  renders.wInitialState(component, constants.stateAs);
  await assertion.awaitMk(constants.username);
  await methods.clickArrowTo(dropDownTo);
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
  clickArrowTo: async (dropDownTo: string) => {
    let ariaLabels = [alDropdown.span.send];
    if (dropDownTo === 'hive') {
      ariaLabels.unshift(alDropdown.arrow.hive);
    } else if (dropDownTo === 'hbd') {
      ariaLabels.unshift(alDropdown.arrow.hbd);
    }
    await clickAwait(ariaLabels);
  },
  removeKey: (key: string) => {
    delete constants.stateAs.accounts[0].keys[key];
    delete constants.stateAs.accounts[0].keys[`${key}Pubkey`]; //
  },
};

const extraMocks = {
  getPhishingAccounts: () => {
    KeychainApi.get = jest.fn().mockResolvedValue(phishing.accounts);
  },
  transfer: (transfer: boolean) =>
    (HiveUtils.transfer = jest.fn().mockResolvedValueOnce(transfer)),
};

/**
 * Conveniently to add data to be checked on home page, as text or aria labels.
 */
const userInformation = () => {};

mocks.helper();

export default {
  beforeEach,
  userInformation,
  methods,
  constants,
  extraMocks,
};
