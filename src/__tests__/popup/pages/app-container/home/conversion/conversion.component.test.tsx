import App from '@popup/App';
import '@testing-library/jest-dom';
import React from 'react';
import conversion from 'src/__tests__/popup/pages/app-container/home/conversion/mocks/conversion';
import conversionHbdToHive from 'src/__tests__/popup/pages/app-container/home/conversion/othercases/conversion-hbd-to-hive';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alDropdown from 'src/__tests__/utils-for-testing/aria-labels/al-dropdown';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import {
  EventType,
  QueryDOM,
} from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  actRunAllTimers,
  clickAwait,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('conversion.component tests:\n', () => {
  // beforeEach(async () => {
  //   await conversion.beforeEach(<App />);
  // });
  describe('HIVE to HBD:\n', () => {
    // beforeEach(async () => {
    //   await conversion.methods.clickAwaitDrop(alDropdown.arrow.hive);
    // });
    afterEach(() => {
      afterTests.clean();
    });
    describe('To remove testing moer than 1', () => {
      it('Must show error if wrong requested value', async () => {
        await conversion.beforeEach(<App />);
        // await actPendingTimers();
        // actRunAllTimers();
        // actAdvanceTime(1000);
        await conversion.methods.clickAwaitDrop(alDropdown.arrow.hive);
        await conversion.methods.typeNClick('2000', false);
        await assertion.awaitFor(
          conversion.methods.message('popup_html_power_up_down_error'),
          QueryDOM.BYTEXT,
        );
        await clickAwait([alIcon.closePage]);
      });
      it('Must show confirmation page and after cancel go back', async () => {
        await conversion.beforeEach(<App />);
        // await actPendingTimers();
        // jest.runOnlyPendingTimers();
        // actAdvanceTime(1000);
        await conversion.methods.clickAwaitDrop(alDropdown.arrow.hive);
        await conversion.methods.typeNClick('500', false);
        await assertion.awaitFor(
          alComponent.confirmationPage,
          QueryDOM.BYLABEL,
        );
        await clickAwait([alButton.dialog.cancel]);
        assertion.getByLabelText(alComponent.conversionPage);
      });
    });

    it('Must navigate to home page after successful conversion and show message', async () => {
      conversion.extraMocks(true);
      await conversion.beforeEach(<App />);
      await conversion.methods.clickAwaitDrop(alDropdown.arrow.hive);
      await conversion.methods.typeNClick('500', true);
      actRunAllTimers();
      conversion.methods.tobeInTheDoc(
        'popup_html_hive_to_hbd_conversion_success',
      );
    });
    it('Must set convertion value to max when pressing to max button', async () => {
      await conversion.beforeEach(<App />);
      await conversion.methods.clickAwaitDrop(alDropdown.arrow.hive);
      assertion.getByDisplay('0');
      await clickTypeAwait([
        { ariaLabel: alButton.setToMax, event: EventType.CLICK },
      ]);
      assertion.getByDisplay('1000');
    });
    it('Must show error if convertion fails', async () => {
      conversion.extraMocks(false);
      await conversion.beforeEach(<App />);
      await conversion.methods.clickAwaitDrop(alDropdown.arrow.hive);
      await conversion.methods.typeNClick('500', true);
      actRunAllTimers();
      conversion.methods.tobeInTheDoc('popup_html_hive_to_hbd_conversion_fail');
    });
  });
  describe('HBD to HIVE:\n', () => {
    beforeEach(async () => {
      await conversion.methods.clickAwaitDrop(alDropdown.arrow.hbd);
    });
    conversionHbdToHive.run();
  });
});
