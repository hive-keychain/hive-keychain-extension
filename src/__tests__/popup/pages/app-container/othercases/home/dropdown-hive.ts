import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alDropdown from 'src/__tests__/utils-for-testing/aria-labels/al-dropdown';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
/**
 * Extra cases executions
 */
const run = () => {
  it('Must open transfer funds page when clicking on send hive', async () => {
    await clickAwait([alDropdown.arrow.hive, alDropdown.span.send]);
    assertion.getByLabelText(alComponent.transfersFundsPage);
  });
  it('Must open power up page when clicking on power up', async () => {
    await clickAwait([alDropdown.arrow.hive, alDropdown.span.powerUp]);
    assertion.getByLabelText(alComponent.powerUpDownPage);
  });
  it('Must load buy HIVE options when clicking on buy', async () => {
    await clickAwait([alDropdown.arrow.hive, alDropdown.span.buy]);
    assertion.getByLabelText(alComponent.buyCoinsPage);
  });
  it('Must show convert page when clicking convert', async () => {
    await clickAwait([alDropdown.arrow.hive, alDropdown.span.convert]);
    assertion.getByLabelText(alComponent.conversionPage);
  });
  it('Must show hive savings page when clicking on savings', async () => {
    await clickAwait([alDropdown.arrow.hive, alDropdown.span.savings]);
    assertion.getByLabelText(alComponent.savingsPage);
  });
};

export default { run };
