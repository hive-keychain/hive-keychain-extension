import { HpDropdownMenuItems } from '@popup/pages/app-container/home/wallet-info-section/wallet-info-dropdown-menus.list';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import walletInfoImplementations from 'src/__tests__/popup/pages/app-container/home/wallet-info-section.component/mocks/implementations';
import walletInfo from 'src/__tests__/popup/pages/app-container/home/wallet-info-section.component/mocks/wallet-info';
import walletInfoConstants from 'src/__tests__/popup/pages/app-container/home/wallet-info-section.component/mocks/wallet-info-constants';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alDropdown from 'src/__tests__/utils-for-testing/aria-labels/al-dropdown';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
const { methods } = walletInfo;
const { constants } = walletInfoConstants;
const { arraysInfo } = constants;
describe('wallet-info-section.component tests:\n', () => {
  let _asFragment: () => DocumentFragment;
  describe('Regular Data:\n', () => {
    beforeEach(async () => {
      _asFragment = await walletInfo.beforeEach();
    });
    it('Must show actual balances', () => {
      const { balanceRepeated, balanceCurrencies, delegations } = arraysInfo;
      const { repetitions } = arraysInfo;
      assertion.AllinArrayTextToHaveLength(balanceRepeated, repetitions);
      assertion.AllinArrayTextToHaveLength(balanceCurrencies, 1);
      assertion.AllinArrayTextToHaveLength(delegations, 1);
    });
    it('Must show 3 dropdown arrow items', () => {
      methods.assertManyByLabel(arraysInfo.dropDownElements);
    });
    it('Must show hive menus', async () => {
      await clickAwait([alDropdown.arrow.hive]);
      methods.assertManyByLabel(arraysInfo.span.hive);
    });
    it('Must show hbd menus', async () => {
      await clickAwait([alDropdown.arrow.hbd]);
      methods.assertManyByLabel(arraysInfo.span.hbd);
    });
    it('Must navigate to each page on hive dropdown', async () => {
      const pages = arraysInfo.pages.tofindOn.hive;
      for (let i = 0; i < pages.length; i++) {
        await clickAwait([alDropdown.arrow.hive, arraysInfo.span.hive[i]]);
        await assertion.awaitOneByLabel(pages[i]);
        await clickAwait([alIcon.arrowBack]);
      }
    });
    it('Must navigate to each page on hbd dropdown', async () => {
      const pages = arraysInfo.pages.tofindOn.hbd;
      for (let i = 0; i < pages.length; i++) {
        await clickAwait([alDropdown.arrow.hbd, arraysInfo.span.hbd[i]]);
        await assertion.awaitOneByLabel(pages[i]);
        await clickAwait([alIcon.arrowBack]);
      }
    });
    it('Must navigate to each page on hp dropdown', async () => {
      const ariaLabelPage = [
        alComponent.delegationsPage,
        alComponent.rcDelegationsPage,
        alComponent.powerUpDownPage,
      ];
      for (let i = 0; i < HpDropdownMenuItems.length; i++) {
        await clickAwait([alDropdown.arrow.hp]);
        const element = HpDropdownMenuItems[i];
        const ariaLabel = alDropdown.itemPreFix + element.icon;
        await clickAwait([ariaLabel]);
        assertion.getByLabelText(ariaLabelPage[i]);
        await clickAwait([alIcon.arrowBack]);
      }
    });
  });
  describe('Irregular Data:\n', () => {
    describe('0 as balances', () => {
      beforeEach(async () => {
        _asFragment = await walletInfo.beforeEach({ zeroBalances: true });
      });
      it('Must not display any savings subvalue', () => {
        expect(screen.queryAllByText('0.000', { exact: false }).length).toBe(3);
      });
    });
    describe('Short popup_html_delegations message:\n', () => {
      beforeEach(async () => {
        _asFragment = await walletInfo.beforeEach({ reImplement18n: true });
      });
      it('Must show full delegations message, if message length < 5', () => {
        assertion.getOneByText(
          '(' + walletInfoImplementations.shortDelegationLabel + ')',
        );
      });
    });
  });
});
