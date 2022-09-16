import authorizedOperations from 'src/__tests__/popup/pages/app-container/settings/user-preferences/authorized-operations/mocks/authorized-operations';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('authorized-operations.component tests:\n', () => {
  let _asFragment: () => DocumentFragment;
  const { methods, constants } = authorizedOperations;
  const { snapshotName, data } = constants;
  methods.afterEach;
  describe('Having operations cases:\n', () => {
    beforeEach(async () => {
      _asFragment = await authorizedOperations.beforeEach({
        customAuthorizedOP: data.authorizedOP,
      });
    });
    it('Must load component and match snapshot', () => {
      expect(_asFragment()).toMatchSnapshot(snapshotName.withData);
    });
    it('Must delete selected website', async () => {
      const toDelete = 'post-splinterlands.com';
      const ariaLabel =
        alIcon.authorizedOperations.icon.delete.preFix + toDelete;
      await clickAwait([ariaLabel]);
      assertion.queryByLabel(ariaLabel, false);
    });
  });
  describe('No operations cases:\n', () => {
    beforeEach(async () => {
      _asFragment = await authorizedOperations.beforeEach();
    });
    it('Must load component and match snapshot', () => {
      expect(_asFragment()).toMatchSnapshot(snapshotName.noData);
    });
  });
});
