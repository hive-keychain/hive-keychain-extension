import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { ReactElement } from 'react';
import { SavingsUtils } from 'src/utils/savings.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alDropdown from 'src/__tests__/utils-for-testing/aria-labels/al-dropdown';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { EventType } from 'src/__tests__/utils-for-testing/enums/enums';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { ArrowDrop } from 'src/__tests__/utils-for-testing/interfaces/elements';
import { ClickOrType } from 'src/__tests__/utils-for-testing/interfaces/events';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  clickAwait,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

const i18n = {
  get: (key: string, extra?: any) =>
    mocksImplementation.i18nGetMessageCustom(key, [extra]),
};

const labels = {
  savings: {
    available: i18n.get('popup_html_savings_available'),
    current: i18n.get('popup_html_savings_current'),
  },
};

const constants = {
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
  balances: {
    HIVE: [
      labels.savings.available,
      '10,000.000 HIVE',
      labels.savings.current,
      '1,000.000 HIVE',
    ],
    HBD: [
      labels.savings.available,
      '10,000.000 HBD',
      labels.savings.current,
      '1,000.000 HBD',
    ],
  },
  texts: {
    withdraw: i18n.get('popup_html_withdraw_text'),
    depositHBD: i18n.get('popup_html_deposit_hbd_text', [
      Number(dynamic.globalProperties.hbd_interest_rate) / 100 + '',
    ]),
  },
  username: mk.user.one,
  missingKey: i18n.get('popup_missing_key', [KeychainKeyTypesLC.active]),
  greaterThan: i18n.get('popup_html_power_up_down_error'),
  success: {
    withdraw: (currency: string, value: string) =>
      i18n.get('popup_html_withdraw_success', [`${value} ${currency}`]).trim(),
    deposit: (currency: string, value: string) =>
      i18n.get('popup_html_deposit_success', [`${value} ${currency}`]),
  },
  failed: {
    withdraw: (currency: string) =>
      i18n.get('popup_html_withdraw_fail', [currency]).trim(),
    deposit: (currency: string) =>
      i18n.get('popup_html_deposit_fail', [currency]),
  },
  buttonDeposit: (currency: string) =>
    i18n.get('popup_html_deposit_param', [currency]),
  buttonWithdraw: (currency: string) =>
    i18n.get('popup_html_withdraw_param', [currency]),
  toHiveSavings: {
    arrow: alDropdown.arrow.hive,
    dropMenu: alDropdown.span.savings,
  } as ArrowDrop,
  toHbdSavings: {
    arrow: alDropdown.arrow.hbd,
    dropMenu: alDropdown.span.savings,
  } as ArrowDrop,
};

const beforeEach = async (
  component: ReactElement,
  clickOnAl: ArrowDrop,
  removeActiveKey: boolean = false,
) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({});
  if (removeActiveKey) {
    delete constants.stateAs.accounts[0].keys.active;
    delete constants.stateAs.accounts[0].keys.activePubkey;
  }
  renders.wInitialState(component, constants.stateAs);
  await assertion.awaitMk(mk.user.one);
  await methods.clickOnArialabel(clickOnAl);
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
  clickOnArialabel: async (clickOnAl: ArrowDrop) => {
    await clickAwait([clickOnAl.arrow, clickOnAl.dropMenu]);
  },
  typeNClick: async (toUse: {
    amount?: string;
    transferTo?: string;
    confirmButton?: boolean;
  }) => {
    let events: ClickOrType[] = [];
    if (toUse.amount) {
      events.push({
        ariaLabel: alInput.amount,
        event: EventType.TYPE,
        text: toUse.amount,
      });
    }
    if (toUse.transferTo) {
      events.push({
        ariaLabel: alInput.username,
        event: EventType.TYPE,
        text: toUse.transferTo,
      });
    }
    events.push({
      ariaLabel: alButton.operation.savings.submit,
      event: EventType.CLICK,
    });
    if (toUse.confirmButton) {
      events.push({
        ariaLabel: alButton.dialog.confirm,
        event: EventType.CLICK,
      });
    }
    await clickTypeAwait(events);
  },
  label: (currency: string) => {
    return alDropdown.select.preFix.accountItem + currency.toUpperCase();
  },
  dropOpAssert: async (currency: string, constants: string[]) => {
    await clickAwait([
      alDropdown.select.savings.currency,
      methods.label(currency),
    ]);
    assertion.getManyByText(constants);
  },
  clickToDeposit: async () => {
    await clickAwait([
      alDropdown.select.savings.operation.selector,
      alDropdown.select.savings.operation.deposit,
    ]);
  },
  clickToWithdraw: async () => {
    await clickAwait([
      alDropdown.select.savings.operation.selector,
      alDropdown.select.savings.operation.withdraw,
    ]);
  },
};

const extraMocks = {
  withdraw: (withdrawResult: boolean) => {
    SavingsUtils.withdraw = jest.fn().mockResolvedValue(withdrawResult);
  },
  deposit: (depositResult: boolean) => {
    SavingsUtils.deposit = jest.fn().mockResolvedValue(depositResult);
  },
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};
