import conversion from 'src/__tests__/popup/pages/app-container/home/conversion/mocks/conversion';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import {
  EventType,
  QueryDOM,
} from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import {
  actRunAllTimers,
  clickAwait,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
/**
 * Extra cases executions
 */
const run = () => {
  it('Must show error if wrong requested value', async () => {
    await conversion.methods.typeNClick('2000', false);
    await assertion.awaitFor(
      conversion.methods.message('popup_html_power_up_down_error'),
      QueryDOM.BYTEXT,
    );
  });
  it('Must show confirmation page and after cancel go back', async () => {
    await conversion.methods.typeNClick('500', false);
    await assertion.awaitFor(alComponent.confirmationPage, QueryDOM.BYLABEL);
    await clickAwait([alButton.dialog.cancel]);
    assertion.getByLabelText(alComponent.conversionPage);
  });
  it('Must navigate to home page after successful conversion and show message', async () => {
    conversion.extraMocks(true);
    await conversion.methods.typeNClick('500', true);
    actRunAllTimers();
    conversion.methods.tobeInTheDoc(
      'popup_html_hbd_to_hive_conversion_success',
    );
  });
  it('Must set convertion value to max when pressing to max button', async () => {
    assertion.getByDisplay('0');
    await clickTypeAwait([
      { ariaLabel: alButton.setToMax, event: EventType.CLICK },
    ]);
    assertion.getByDisplay('1000');
  });
  it('Must show error if convertion fails', async () => {
    conversion.extraMocks(false);
    await conversion.methods.typeNClick('500', true);
    actRunAllTimers();
    conversion.methods.tobeInTheDoc('popup_html_hbd_to_hive_conversion_fail');
  });
};

export default { run };
