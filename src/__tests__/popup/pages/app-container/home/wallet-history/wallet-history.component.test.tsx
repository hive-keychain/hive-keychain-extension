import App from '@popup/App';
import React from 'react';
import walletHistory from 'src/__tests__/popup/pages/app-container/home/wallet-history/mocks/wallet-history';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { actPendingTimers } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
const { methods } = walletHistory;
describe('wallet-history.component tests:\n', () => {
  methods.afterEach;
  describe('With Transactions', () => {
    it.todo('Must show transaction list');
    it.todo('Must show available filters');
    it.todo('Must set search box filter value');
    it.todo('Must clear search box filter value');
    //     filterValue: '',
    //   inSelected: false,
    //   outSelected: false,
    //   selectedTransactionTypes: {
    //     transfer: false,
    //     claim_reward_balance: false,
    //     delegate_vesting_shares: false,
    //     claim_account: false,
    //     savings: false,
    //     power_up_down: false,
    //     convert: false,
    //   }
    it.todo('Must filter by a value');
    //maybe we can do a main function to run an arrar of:
    //  - TransactionTypes
    //  - inSelected & outSelected
    it.todo('Must show detals when clicked');
    it.todo('Must show tool tip with date time when hovered');
    it.todo('Must load more when scrolling down');
    it.todo('Must scroll to top when click on up arrow');
    it.todo('Must open new window when click on transaction icon');
  });
  describe('No Transactions', () => {
    beforeEach(async () => {
      await walletHistory.beforeEach(<App />, { emptyTransactions: true });
    });
    it.skip('Must show empty if no transactions', async () => {
      //popup_html_transaction_list_is_empty
      await actPendingTimers();
      await assertion.awaitFor('yolo', QueryDOM.BYTEXT);
    });
  });
});
