import App from '@popup/App';
import React from 'react';
import walletInfoImplementations from 'src/__tests__/popup/pages/app-container/home/wallet-info-section.component/mocks/implementations';
import walletInfo from 'src/__tests__/popup/pages/app-container/home/wallet-info-section.component/mocks/wallet-info';
import alDropdown from 'src/__tests__/utils-for-testing/aria-labels/al-dropdown';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
const { methods, constants } = walletInfo;
const { arraysInfo } = constants;
describe('wallet-info-section.component tests:\n', () => {
  describe('Regular Data:\n', () => {
    beforeEach(async () => {
      await walletInfo.beforeEach(<App />);
    });
    it('Must show actual balances', () => {
      methods.assertManyBy(arraysInfo.balanceCurrencies);
      methods.assertManyBy(arraysInfo.delegatios);
      methods.assertRepetead(
        arraysInfo.balanceRepeated,
        arraysInfo.repetitions,
      );
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
    it('Must show hp menus', async () => {
      await clickAwait([alDropdown.arrow.hp]);
      methods.assertManyByLabel(arraysInfo.span.hp);
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
      const pages = arraysInfo.pages.tofindOn.hp;
      for (let i = 0; i < pages.length; i++) {
        await clickAwait([alDropdown.arrow.hp, arraysInfo.span.hp[i]]);
        await assertion.awaitOneByLabel(pages[i]);
        await clickAwait([alIcon.arrowBack]);
      }
    });
  });
  describe('Irregular Data:\n', () => {
    describe('0 as balances', () => {
      beforeEach(async () => {
        await walletInfo.beforeEach(<App />, { zeroBalances: true });
      });
      it('Must not display any savings subvalue', () => {
        assertion.queryByText(arraysInfo.balanceRepeated[2], false);
      });
    });
    describe('Short popup_html_delegations message:\n', () => {
      beforeEach(async () => {
        await walletInfo.beforeEach(<App />, { reImplement18n: true });
      });
      it('Must show full delegations message, if message length < 5', () => {
        assertion.getOneByText(
          '(' + walletInfoImplementations.shortDelegationLabel + ')',
        );
      });
    });
  });
});
