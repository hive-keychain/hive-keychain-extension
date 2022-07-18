import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alDropdown from 'src/__tests__/utils-for-testing/aria-labels/al-dropdown';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
/**
 * Extra cases executions
 */
const run = () => {
  it('Must open transfer funds page when clicking on send hbd', async () => {
    await clickAwait([alDropdown.arrow.hbd, alDropdown.span.send]);
    assertion.getByLabelText(alComponent.transfersFundsPage);
  });
  it('Must load buy HBD options when clicking on buy', async () => {
    await clickAwait([alDropdown.arrow.hbd, alDropdown.span.buy]);
    assertion.getByLabelText(alComponent.buyCoinsPage);
  });
  it('Must show convert page when clicking convert', async () => {
    await clickAwait([alDropdown.arrow.hbd, alDropdown.span.convert]);
    assertion.getByLabelText(alComponent.conversionPage);
  });
  it('Must show hbd savings page when clicking savings', async () => {
    await clickAwait([alDropdown.arrow.hbd, alDropdown.span.savings]);
    assertion.getByLabelText(alComponent.savingsPage);
  });
};

export default { run };
