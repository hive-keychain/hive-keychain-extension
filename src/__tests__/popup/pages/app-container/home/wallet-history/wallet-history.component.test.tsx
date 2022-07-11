import App from '@popup/App';
import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import walletHistory from 'src/__tests__/popup/pages/app-container/home/wallet-history/mocks/wallet-history';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import {
  EventType,
  QueryDOM,
} from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  actAdvanceTime,
  actPendingTimers,
  clickAwait,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
//TODO remove all logs + coments from components
config.byDefault();
const { methods, constants, extraMocks, filterOpType } = walletHistory;
const { transactions, filter, typeValue } = constants;
describe('wallet-history.component tests:\n', () => {
  methods.afterEach;
  describe('With Transactions', () => {
    beforeEach(async () => {
      await walletHistory.beforeEach(<App />);
    });
    it('Must show transaction list', async () => {
      await actPendingTimers();
      await waitFor(() => {
        expect(screen.getAllByLabelText(alDiv.wallet.history.item).length).toBe(
          transactions.length,
        );
      });
      screen.debug();
    });
    it('Must show available filters', async () => {
      await actPendingTimers();
      await clickAwait([alDiv.wallet.history.filterPanel]);
      assertion.getByText(
        filter.ariaLabelsToFind.map((al) => {
          return { arialabelOrText: al, query: QueryDOM.BYLABEL };
        }),
      );
    });
    it('Must set search box filter value', async () => {
      await actPendingTimers();
      extraMocks.scrollToNotImpl();
      await clickTypeAwait([
        {
          ariaLabel: alInput.filter.walletHistory,
          event: EventType.TYPE,
          text: typeValue.random,
        },
      ]);
      await actPendingTimers();
      assertion.toHaveValue(alInput.filter.walletHistory, typeValue.random);
    });
    it('Must clear search box filter value', async () => {
      await actPendingTimers();
      extraMocks.scrollToNotImpl();
      await clickTypeAwait([
        {
          ariaLabel: alInput.filter.walletHistory,
          event: EventType.TYPE,
          text: typeValue.random,
        },
      ]);
      await actPendingTimers();
      assertion.toHaveValue(alInput.filter.walletHistory, typeValue.random);
      await clickAwait([alDiv.wallet.history.clearFilters]);
      actAdvanceTime(400);
      assertion.toHaveValue(alInput.filter.walletHistory, typeValue.empty);
    });
    it('Must filter by an specific value and show 1 transaction', async () => {
      await actPendingTimers();
      extraMocks.scrollToNotImpl();
      await clickTypeAwait([
        {
          ariaLabel: alInput.filter.walletHistory,
          event: EventType.TYPE,
          text: typeValue.uniqueValue,
        },
      ]);
      actAdvanceTime(200);
      assertion.getByLabelText(alDiv.wallet.history.item);
      assertion.getByDisplay(typeValue.uniqueValue);
    });
    //maybe we can do a main function to run an array of:
    //  - TransactionTypes
    //  - inSelected & outSelected
    it.skip('Must show 1 transaction per filter applied', async () => {
      jest.spyOn(window, 'scrollTo');
      await actPendingTimers();
      extraMocks.scrollToNotImpl();
      await clickAwait([filterOpType[0]]);
      actAdvanceTime(200);
      await assertion.awaitFor('yolo', QueryDOM.BYTEXT);
      // expect(screen.getAllByLabelText(alDiv.wallet.history.item).length).toBe(
      //   1,
      // );
      // filterOpType.forEach(async (al) => {
      //   await clickAwait([al]);
      //   await actPendingTimers();
      //   assertion.getByLabelText(alDiv.wallet.history.item);
      // });
    });
    it('Must show details when clicked', async () => {
      extraMocks.scrollToNotImpl();
      screen.debug();
      actAdvanceTime(200);
      screen.debug();
      // extraMocks.scrollToNotImpl();
      // await waitFor(() => {
      //   expect(
      //     screen.getByLabelText(alDiv.wallet.history.item),
      //   ).toBeInTheDocument();
      // });
      // screen.debug();
      // const transactions = await screen.findAllByLabelText(
      //   alDiv.wallet.history.item,
      // );
      // await userEventPendingTimers.click(transactions[0]);
      // await waitFor(() => {
      //   expect(screen.getByText('yolo')).toBeInTheDocument();
      // });
    });
    //on the next one we could change the default value on each iteration???
    it.todo('Must load each filter when loaded from storage');
    it.todo('Must show tool tip with date time when hovered');
    it.todo('Must load more when scrolling down');
    it.todo('Must scroll to top when click on up arrow');
    it.todo('Must open new window when click on transaction icon');
  });
  describe('No Transactions', () => {
    beforeEach(async () => {
      await walletHistory.beforeEach(<App />, { emptyTransactions: true });
    });
    it('Must show empty if no transactions', async () => {
      //popup_html_transaction_list_is_empty
      //await actPendingTimers();
      //actRunAllTimers();
      await assertion.awaitFor('yolo', QueryDOM.BYTEXT);
    });
  });
});
