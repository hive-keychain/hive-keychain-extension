import { screen } from '@testing-library/react';
import manageAccounts from 'src/__tests__/popup/pages/app-container/settings/accounts/manage-account/mocks/manage-accounts';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import alSelect from 'src/__tests__/utils-for-testing/aria-labels/al-select';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  actAdvanceTime,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('manage-account.component tests:\n', () => {
  let _asFragment: () => DocumentFragment;
  const { methods, constants, extraMocks, keys } = manageAccounts;
  const { snapshotName } = constants;
  methods.afterEach;
  describe('General cases:\n', () => {
    beforeEach(async () => {
      _asFragment = await manageAccounts.beforeEach();
    });
    it('Must display manage-account and match snapshot', () => {
      expect(_asFragment()).toMatchSnapshot(snapshotName.withData.default);
    });
    it('Must change to selected account', async () => {
      extraMocks.remockGetAccount();
      await clickAwait([
        alSelect.accountSelector,
        alSelect.itemSelectorPreFix + mk.user.two,
      ]);
      expect(screen.getByLabelText(alDiv.selectedAccount)).toHaveTextContent(
        mk.user.two,
      );
    });
    it('Must show selected private key when clicking', async () => {
      for (let i = 0; i < keys.length; i++) {
        await clickAwait([
          alDiv.keys.list.preFix.clickeableKey +
            methods.getKeyName(keys[i].keyName),
        ]);
        assertion.getOneByText(keys[i].privateKey);
      }
    });
    it('Must copy selected private key to clipboard', async () => {
      for (let i = 0; i < keys.length; i++) {
        await clickAwait([
          alDiv.keys.list.preFix.clickeableKey +
            methods.getKeyName(keys[i].keyName),
          alDiv.keys.list.preFix.clickeableKey +
            methods.getKeyName(keys[i].keyName),
        ]);
      }
      actAdvanceTime(200);
      expect(screen.queryAllByText(constants.message.copied)).toHaveLength(3);
    });
    it('Must show confirmation page and go back', async () => {
      for (let i = 0; i < keys.length; i++) {
        await clickAwait([
          alIcon.keys.list.preFix.remove + methods.getKeyName(keys[i].keyName),
        ]);
        assertion.getByLabelText(alComponent.confirmationPage);
        await clickAwait([alButton.dialog.cancel]);
      }
    });
    it.todo('Must show error if only one key');
    it.todo('Must show QR code');
    it.todo('Must remove from keychain');

    //maybe loading initial data? or just moving it to add-key component if gets too long
    it.todo('Must add all keys using master password');
    it.todo('Must add active key');
    it.todo('Must add memo key');
    it.todo('Must add posting key');

    //different data tests
    it.todo('Must not displayed remove button');
  });
  describe('Removing key cases:\n', () => {
    beforeEach(async () => {
      _asFragment = await manageAccounts.beforeEach();
    });
    it('Must remove active key', async () => {
      //TODO actual app take the user to the homepage after deleting a key.
      const ariaLabel =
        alIcon.keys.list.preFix.remove +
        methods.getKeyName('popup_html_active');
      await clickAwait([ariaLabel]);
      assertion.getByLabelText(alComponent.confirmationPage);
      await clickAwait([alButton.dialog.confirm]);
      await assertion.awaitFor(alComponent.homePage, QueryDOM.BYLABEL);
      await methods.gotoManageAccounts();
      assertion.queryByLabel(ariaLabel, false);
    });
    it('Must remove posting key', async () => {
      _asFragment = await manageAccounts.beforeEach();
      const ariaLabel =
        alIcon.keys.list.preFix.remove +
        methods.getKeyName('popup_html_posting');
      await clickAwait([ariaLabel]);
      assertion.getByLabelText(alComponent.confirmationPage);
      await clickAwait([alButton.dialog.confirm]);
      await assertion.awaitFor(alComponent.homePage, QueryDOM.BYLABEL);
      await methods.gotoManageAccounts();
      assertion.queryByLabel(ariaLabel, false);
    });
    it('Must remove memo key', async () => {
      _asFragment = await manageAccounts.beforeEach();
      const ariaLabel =
        alIcon.keys.list.preFix.remove + methods.getKeyName('popup_html_memo');
      await clickAwait([ariaLabel]);
      assertion.getByLabelText(alComponent.confirmationPage);
      await clickAwait([alButton.dialog.confirm]);
      await assertion.awaitFor(alComponent.homePage, QueryDOM.BYLABEL);
      await methods.gotoManageAccounts();
      assertion.queryByLabel(ariaLabel, false);
    });
  });
});
