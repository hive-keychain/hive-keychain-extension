import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alDropdown from 'src/__tests__/utils-for-testing/aria-labels/al-dropdown';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
/**
 * Extra cases executions
 */
const run = () => {
  it('Must show delegations page when clicking delegations', async () => {
    await clickAwait([alDropdown.arrow.hp, alDropdown.span.delegations]);
    assertion.getByLabelText(alComponent.delegationsPage);
  });
  it('Must show power down page when clicking power down', async () => {
    await clickAwait([alDropdown.arrow.hp, alDropdown.span.powerDown]);
    assertion.getByLabelText(alComponent.powerUpDownPage);
  });
};

export default { run };
