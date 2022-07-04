import App from '@popup/App';
import { PowerType } from '@popup/pages/app-container/home/power-up-down/power-type.enum';
import React from 'react';
import powerUpDown from 'src/__tests__/popup/pages/app-container/home/power-up-down/mocks/power-up-down';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alDropdown from 'src/__tests__/utils-for-testing/aria-labels/al-dropdown';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import alToolTip from 'src/__tests__/utils-for-testing/aria-labels/al-toolTip';
import {
  EventType,
  QueryDOM,
} from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  clickAwait,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
jest.setTimeout(10000);
describe('power-up-down.component tests:\n', () => {
  const { methods, constants, extraMocks } = powerUpDown;
  beforeEach(async () => {
    await powerUpDown.beforeEach(<App />);
  });
  powerUpDown.methods.afterEach;
  describe('power up:\n', () => {
    beforeEach(async () => {
      await clickAwait([alDropdown.arrow.hive, alDropdown.span.powerUp]);
    });
    it('Must show current and available HP', () => {
      assertion.getByText([
        { arialabelOrText: constants.label.current, query: QueryDOM.BYTEXT },
        { arialabelOrText: constants.label.available, query: QueryDOM.BYTEXT },
        { arialabelOrText: constants.value.current, query: QueryDOM.BYTEXT },
        {
          arialabelOrText: constants.value.available.up,
          query: QueryDOM.BYTEXT,
        },
        { arialabelOrText: constants.text.poweringUp, query: QueryDOM.BYTEXT },
      ]);
    });
    it('Must load username on receiver input by default', () => {
      assertion.toHaveValue(alInput.receiver, constants.username);
    });
    it('Must show error if input empty', async () => {
      await clickTypeAwait([
        { ariaLabel: alInput.clear, event: EventType.CLICK },
        {
          ariaLabel: alButton.operation.powerUpDown.submit,
          event: EventType.CLICK,
        },
      ]);
      await assertion.awaitFor(constants.error.form, QueryDOM.BYTEXT);
    });
    it('Must show error if requested greater than available', async () => {
      await methods.typeNClick('10000', false);
      await assertion.awaitFor(constants.error.greaterThan, QueryDOM.BYTEXT);
    });
    it('Must load confirmation page', async () => {
      await methods.typeNClick('100', false);
      await assertion.awaitFor(alComponent.confirmationPage, QueryDOM.BYLABEL);
    });
    it('Must set max value', async () => {
      await clickAwait([alButton.setToMax]);
      assertion.getByDisplay(constants.value.max);
    });
    it('Must show error message if power up fails', async () => {
      extraMocks(false);
      await methods.typeNClick('100', true);
      await assertion.awaitFor(
        methods.powerFailed(PowerType.POWER_UP),
        QueryDOM.BYTEXT,
      );
    });
    it('Must show success message after power up and load HOME_PAGE', async () => {
      extraMocks(true);
      await methods.typeNClick('100', true);
      await assertion.awaitFor(
        methods.powerSuccess(PowerType.POWER_UP),
        QueryDOM.BYTEXT,
      );
    });
  });
  describe('power down:\n', () => {
    beforeEach(async () => {
      await clickAwait([alDropdown.arrow.hp, alDropdown.span.powerDown]);
    });
    it('Must show tool tip when hover', async () => {
      await clickTypeAwait([
        {
          ariaLabel: alToolTip.custom.powerUpDown.next,
          event: EventType.HOVER,
        },
      ]);
      assertion.getOneByText(constants.value.poweringDown);
    });

    it('Must show powerdown text and user balances', () => {
      assertion.getByText([
        { arialabelOrText: constants.label.current, query: QueryDOM.BYTEXT },
        { arialabelOrText: constants.label.available, query: QueryDOM.BYTEXT },
        { arialabelOrText: constants.value.current, query: QueryDOM.BYTEXT },
        {
          arialabelOrText: constants.value.available.down,
          query: QueryDOM.BYTEXT,
        },
        {
          arialabelOrText: constants.text.poweringDown,
          query: QueryDOM.BYTEXT,
        },
      ]);
    });
    it.todo('Must stop cancel current power down');
    it.todo('Must show error if cancellation fails');
    it.todo('Must show success message after power down and load HOME_PAGE');
    //      ->  HiveUtils.powerDown
    //      ->  TransferUtils.saveTransferRecipient
    //      -> popup_html_power_up_down_success
    it.todo('Must show error if requested greater than available');
    // it('Must load confirmation page', async () => {
    //     await methods.typeNClick('100', false);
    //     await assertion.awaitFor(alComponent.confirmationPage, QueryDOM.BYLABEL);
    //   });
    it.todo('Must show error if power down fails');
    //      ->  HiveUtils.powerDown
    //      -> popup_html_power_up_down_fail
  });
});
