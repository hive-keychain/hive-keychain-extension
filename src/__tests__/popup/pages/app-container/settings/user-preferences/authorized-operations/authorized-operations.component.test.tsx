import authorizedOperations from 'src/__tests__/popup/pages/app-container/settings/user-preferences/authorized-operations/mocks/authorized-operations';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('authorized-operations.component tests:\n', () => {
  let _asFragment: () => DocumentFragment;
  const { methods, constants } = authorizedOperations;
  const { data } = constants;
  methods.afterEach;
  describe('No operations cases:\n', () => {
    beforeEach(async () => {
      _asFragment = await authorizedOperations.beforeEach();
    });
    it('Must load component and show no whitelisted operations', () => {
      assertion.getByLabelText(
        alComponent.userPreferences.authorizedOperations,
      );
      assertion.getOneByText(constants.message.info);
      assertion.getOneByText(constants.message.noWhitelisted);
    });
  });
  describe('Having operations cases:\n', () => {
    beforeEach(async () => {
      _asFragment = await authorizedOperations.beforeEach({
        customAuthorizedOP: data.authorizedOP,
      });
    });
    it('Must load component and show info', async () => {
      assertion.getByLabelText(
        alComponent.userPreferences.authorizedOperations,
      );
      assertion.getOneByText(constants.message.info);
      await assertion.allToHaveLength(alDiv.authorizedOperations.item, 4);
    });
    it('Must delete selected website', async () => {
      const toDelete = 'post-splinterlands.com';
      const ariaLabel =
        alIcon.authorizedOperations.icon.delete.preFix + toDelete;
      await clickAwait([ariaLabel]);
      assertion.queryByLabel(ariaLabel, false);
    });
  });
});
