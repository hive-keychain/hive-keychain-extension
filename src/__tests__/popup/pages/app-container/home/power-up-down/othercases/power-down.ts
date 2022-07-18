import { PowerType } from '@popup/pages/app-container/home/power-up-down/power-type.enum';
import powerUpDown from 'src/__tests__/popup/pages/app-container/home/power-up-down/mocks/power-up-down';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
const { methods, constants, extraMocks } = powerUpDown;
/**
 * Extra cases for power down.
 */
const run = () => {
  it('Must show user info', () => {
    methods.assertInfo(PowerType.POWER_DOWN);
  });
  it('Must show error if empty input', async () => {
    await clickAwait([alButton.operation.powerUpDown.submit]);
    await assertion.awaitFor(constants.error.form, QueryDOM.BYTEXT);
  });
  it('Must load confirmation page', async () => {
    await methods.typeNClick('0.000', false);
    await assertion.awaitFor(alComponent.confirmationPage, QueryDOM.BYLABEL);
  });
  it('Must show success message if cancellation', async () => {
    extraMocks.powerDown(true);
    await methods.typeNClick('0.000', true);
    await assertion.awaitFor(constants.success.cancellation, QueryDOM.BYTEXT);
  });
  it('Must show error if cancellation fails', async () => {
    extraMocks.powerDown(false);
    await methods.typeNClick('0.000', true);
    await assertion.awaitFor(constants.error.cancellation, QueryDOM.BYTEXT);
  });
  it('Must show success message after power down', async () => {
    extraMocks.powerDown(true);
    await methods.typeNClick('0.1', true);
    await assertion.awaitFor(
      methods.powerSuccess(PowerType.POWER_DOWN),
      QueryDOM.BYTEXT,
    );
  });
  it('Must show error message if power down fails', async () => {
    extraMocks.powerDown(false);
    await methods.typeNClick('0.1', true);
    await assertion.awaitFor(
      methods.powerFailed(PowerType.POWER_DOWN),
      QueryDOM.BYTEXT,
    );
  });
};

export default { run };
