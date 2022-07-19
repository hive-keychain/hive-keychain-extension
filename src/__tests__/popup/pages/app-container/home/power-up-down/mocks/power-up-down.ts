import { ExtendedAccount } from '@hiveio/dhive';
import { PowerType } from '@popup/pages/app-container/home/power-up-down/power-type.enum';
import { ReactElement } from 'react';
import HiveUtils from 'src/utils/hive.utils';
import TransferUtils from 'src/utils/transfer.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import {
  EventType,
  QueryDOM,
} from 'src/__tests__/utils-for-testing/enums/enums';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { ElementQuery } from 'src/__tests__/utils-for-testing/interfaces/elements';
import { ClickOrType } from 'src/__tests__/utils-for-testing/interfaces/events';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

const i18n = {
  get: (key: string, extra?: any) =>
    mocksImplementation.i18nGetMessageCustom(key, [extra]),
};

const constants = {
  stateAs: initialStates.iniStateAs.defaultExistent as RootState,
  label: {
    current: i18n.get('popup_html_current'),
    available: i18n.get('popup_html_available'),
  },
  value: {
    current: '1,000.000 HIVE',
    available: {
      down: '0.459 HP',
      up: '5.459 HP',
    },
    max: '1000',
    poweringDown: 'Powering Down 55 / 5 HP',
  },
  username: mk.user.one,
  error: {
    form: i18n.get('popup_html_fill_form_error').trim(),
    greaterThan: i18n.get('popup_html_power_up_down_error').trim(),
    cancellation: i18n.get('popup_html_cancel_power_down_fail').trim(),
  },
  success: {
    confirmation: i18n.get('popup_html_confirm_power_up_down_message').trim(),
    cancellation: i18n.get('popup_html_cancel_power_down_success').trim(),
  },
  extendedWPowerDown: {
    ...accounts.extended,
    withdrawn: 100000000000,
    to_withdraw: 10000000000,
    next_vesting_withdrawal: '100000',
  } as ExtendedAccount,
  text: {
    poweringDown: i18n.get('popup_html_powerdown_text'),
    poweringUp: i18n.get('popup_html_powerup_text'),
  },
};

const beforeEach = async (component: ReactElement) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({
    app: { getAccounts: [constants.extendedWPowerDown] },
  });
  TransferUtils.saveTransferRecipient = jest.fn().mockResolvedValue(undefined);
  renders.wInitialState(component, constants.stateAs);
  await assertion.awaitMk(mk.user.one);
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
  powerType: (powerType: PowerType) =>
    i18n.get(
      powerType === PowerType.POWER_UP ? 'popup_html_pu' : 'popup_html_pd',
    ),
  powerFailed: (powerType: PowerType) =>
    i18n
      .get('popup_html_power_up_down_fail', [methods.powerType(powerType)])
      .trim(),
  powerSuccess: (powerType: PowerType) =>
    i18n
      .get('popup_html_power_up_down_success', [methods.powerType(powerType)])
      .trim(),
  typeNClick: async (amount: string, confirmButton: boolean) => {
    let events: ClickOrType[] = [
      { ariaLabel: alInput.amount, event: EventType.TYPE, text: amount },
      {
        ariaLabel: alButton.operation.powerUpDown.submit,
        event: EventType.CLICK,
      },
    ];
    if (confirmButton === true) {
      events.push({
        ariaLabel: alButton.dialog.confirm,
        event: EventType.CLICK,
      });
    }
    await clickTypeAwait(events);
  },
  assertInfo: (powerType: PowerType) => {
    let events: ElementQuery[] = [
      { arialabelOrText: constants.label.current, query: QueryDOM.BYTEXT },
      { arialabelOrText: constants.label.available, query: QueryDOM.BYTEXT },
      { arialabelOrText: constants.value.current, query: QueryDOM.BYTEXT },
    ];
    switch (powerType) {
      case PowerType.POWER_UP:
        events.push(
          {
            arialabelOrText: constants.value.available.up,
            query: QueryDOM.BYTEXT,
          },
          {
            arialabelOrText: constants.text.poweringUp,
            query: QueryDOM.BYTEXT,
          },
        );
        break;
      case PowerType.POWER_DOWN:
        events.push(
          {
            arialabelOrText: constants.value.available.down,
            query: QueryDOM.BYTEXT,
          },
          {
            arialabelOrText: constants.text.poweringDown,
            query: QueryDOM.BYTEXT,
          },
        );
        break;
    }
    assertion.getByText(events);
  },
};

const extraMocks = {
  powerUp: (powerUp: boolean) => {
    HiveUtils.powerUp = jest.fn().mockResolvedValue(powerUp);
  },
  powerDown: (powerDown: boolean) => {
    HiveUtils.powerDown = jest.fn().mockResolvedValue(powerDown);
  },
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};
