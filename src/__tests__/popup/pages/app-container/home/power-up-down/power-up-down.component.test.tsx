import App from '@popup/App';
import { PowerType } from '@popup/pages/app-container/home/power-up-down/power-type.enum';
import React from 'react';
import powerUpDown from 'src/__tests__/popup/pages/app-container/home/power-up-down/mocks/power-up-down';
import powerDown from 'src/__tests__/popup/pages/app-container/home/power-up-down/othercases/power-down';
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
    it('Must show user info', () => {
      methods.assertInfo(PowerType.POWER_UP);
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
      extraMocks.powerUp(false);
      await methods.typeNClick('100', true);
      await assertion.awaitFor(
        methods.powerFailed(PowerType.POWER_UP),
        QueryDOM.BYTEXT,
      );
    });
    it('Must show success message after power up', async () => {
      extraMocks.powerUp(true);
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
    powerDown.run();
  });
});
