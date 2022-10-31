import automatedTasks from 'src/__tests__/popup/pages/app-container/settings/user-preferences/automated-tasks/mocks/automated-tasks';
import alCheckbox from 'src/__tests__/utils-for-testing/aria-labels/al-checkbox';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alSelect from 'src/__tests__/utils-for-testing/aria-labels/al-select';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('automated-tasks.component tests:\n', () => {
  let _asFragment: () => DocumentFragment;
  const { methods, constants, extraMocks } = automatedTasks;
  methods.afterEach;
  describe('Stored data:\n', () => {
    describe('Max mana greater than freeAccount credits:\n', () => {
      beforeEach(async () => {
        _asFragment = await automatedTasks.beforeEach({
          passData: true,
          maxManaGreater: true,
        });
      });
      it('Must load component and show intro', () => {
        assertion.getByLabelText(alComponent.userPreferences.automatedTasks);
        assertion.getOneByText(constants.message.intro);
      });
      it('Must set to false auto claim accounts', async () => {
        await clickAwait([alCheckbox.automatedTasks.checkbox.claim.accounts]);
        expect(extraMocks.spySaveClaims).toBeCalledWith(
          true,
          false,
          true,
          'keychain.tests',
        );
      });
      it('Must set to false auto claims rewards', async () => {
        await clickAwait([alCheckbox.automatedTasks.checkbox.claim.rewards]);
        expect(extraMocks.spySaveClaims).toBeCalledWith(
          false,
          true,
          true,
          'keychain.tests',
        );
      });
      it('Must set to false auto claims savings', async () => {
        await clickAwait([alCheckbox.automatedTasks.checkbox.claim.savings]);
        expect(extraMocks.spySaveClaims).toBeCalledWith(
          true,
          true,
          false,
          'keychain.tests',
        );
      });
    });
    describe('Max mana lower:\n', () => {
      beforeEach(async () => {
        _asFragment = await automatedTasks.beforeEach({
          passData: true,
        });
      });
      it('Must load selected account', async () => {
        extraMocks.remockAccounts();
        await clickAwait([
          alSelect.accountSelector,
          alSelect.itemSelectorPreFix + mk.user.two,
        ]);
        assertion.queryByText(mk.user.one, false);
        assertion.queryByText(mk.user.two);
      });
    });
  });
  describe('No data', () => {
    beforeEach(async () => {
      _asFragment = await automatedTasks.beforeEach();
    });
    it('Must load component and match snapshot', () => {
      assertion.getByLabelText(alComponent.userPreferences.automatedTasks);
      assertion.getOneByText(constants.message.intro);
    });
  });
});
