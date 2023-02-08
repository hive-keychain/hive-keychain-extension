import { LocalAccount } from '@interfaces/local-account.interface';
import { screen } from '@testing-library/react';
import manageAccounts from 'src/__tests__/popup/pages/app-container/settings/accounts/manage-account/mocks/manage-accounts';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import alSelect from 'src/__tests__/utils-for-testing/aria-labels/al-select';
import alSvg from 'src/__tests__/utils-for-testing/aria-labels/al-svg';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import {
  KeyToUseNoMaster,
  QueryDOM,
} from 'src/__tests__/utils-for-testing/enums/enums';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  actAdvanceTime,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('manage-account.component tests:\n', () => {
  let _asFragment: () => DocumentFragment | undefined;
  const { methods, constants, extraMocks } = manageAccounts;
  const { localAccount } = constants;
  methods.afterEach;
  describe('General cases:\n', () => {
    beforeEach(async () => {
      _asFragment = await manageAccounts.beforeEach();
    });
    it('Must display manage-account page', () => {
      assertion.getByLabelText(alComponent.account.subMenu.manageAccounts);
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
    it('Must show QR code', async () => {
      extraMocks.scrollNotImpl();
      await clickAwait([alButton.qrCode.toogle]);
      actAdvanceTime(100);
      await assertion.awaitFor(alSvg.qrcode, QueryDOM.BYLABEL);
    });
    it('Must hide QR code', async () => {
      extraMocks.scrollNotImpl();
      await clickAwait([alButton.qrCode.toogle]);
      actAdvanceTime(100);
      await assertion.awaitFor(alSvg.qrcode, QueryDOM.BYLABEL);
      await clickAwait([alButton.qrCode.toogle]);
      actAdvanceTime(100);
      assertion.queryByLabel(alSvg.qrcode, false);
    });
    it('Must close page and go home', async () => {
      await clickAwait([alIcon.closePage]);
      await assertion.awaitFor(alComponent.homePage, QueryDOM.BYLABEL);
    });
  });
  describe('Account having 1 key only:\n', () => {
    beforeEach(async () => {
      const cloneLocalAccounts = objects.clone(localAccount) as LocalAccount[];
      methods.removeKeysLocalAccount(cloneLocalAccounts[0], [
        KeyToUseNoMaster.ACTIVE,
        KeyToUseNoMaster.MEMO,
      ]);
      _asFragment = await manageAccounts.beforeEach({
        localAccount: cloneLocalAccounts,
      });
    });
    it('Must not show remove memo key', () => {
      const ariaLabel =
        alIcon.keys.list.preFix.remove + methods.getKeyName('popup_html_memo');
      assertion.queryByLabel(ariaLabel, false);
    });
  });
});
