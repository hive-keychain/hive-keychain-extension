import App from '@popup/App';
import '@testing-library/jest-dom';
import React from 'react';
import home from 'src/__tests__/popup/pages/app-container/home/mocks/home/home';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  actRunAllTimers,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('home.component action-buttons tests:\n', () => {
  beforeEach(async () => {
    home.extraMocks.getLastTransaction();
    await home.beforeEach(<App />, accounts.twoAccounts);
  });
  afterEach(() => {
    afterTests.clean();
  });
  it('Must open each page on each action button', async () => {
    /**
     * Note: add or remove more actions buttons & ariaLabels page when needed here.
     */
    const actionButtonLabelPage = [
      {
        ariaLabel: alButton.actionBtn.send,
        pageComponent: alComponent.transfersFundsPage,
      },
      {
        ariaLabel: alButton.actionBtn.history,
        pageComponent: alComponent.walletItemList,
      },
      {
        ariaLabel: alButton.actionBtn.buy,
        pageComponent: alComponent.buyCoinsPage,
      },
      {
        ariaLabel: alButton.actionBtn.send,
        pageComponent: alComponent.transfersFundsPage,
      },
    ];
    for (let i = 0; i < actionButtonLabelPage.length; i++) {
      const { ariaLabel, pageComponent } = actionButtonLabelPage[i];
      await clickAwait([ariaLabel]);
      actRunAllTimers();
      assertion.getByLabelText(pageComponent);
      await clickAwait([alIcon.arrowBack]);
    }
  });
});
