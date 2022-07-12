import App from '@popup/App';
import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import walletHistory from 'src/__tests__/popup/pages/app-container/home/wallet-history/mocks/wallet-history';
import noDelegationsInOut from 'src/__tests__/popup/pages/app-container/home/wallet-history/othercases/no-delegations-in-out';
import noTransfersInData from 'src/__tests__/popup/pages/app-container/home/wallet-history/othercases/no-transfers-in-data';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import alToolTip from 'src/__tests__/utils-for-testing/aria-labels/al-toolTip';
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
config.byDefault();
const { methods, constants, filters, prefix } = walletHistory;
const { transactions, filter, typeValue } = constants;
describe('wallet-history.component tests:\n', () => {
  methods.afterEach;
  describe('With Transactions', () => {
    beforeEach(async () => {
      await walletHistory.beforeEach(<App />);
      await actPendingTimers();
    });
    it('Must show transaction list', async () => {
      await waitFor(() => {
        expect(screen.getAllByLabelText(alDiv.wallet.history.item).length).toBe(
          transactions.length,
        );
      });
    });
    it('Must show available filters', async () => {
      await clickAwait([alDiv.wallet.history.filterPanel]);
      assertion.getByText(
        filter.ariaLabelsToFind.map((al) => {
          return { arialabelOrText: al, query: QueryDOM.BYLABEL };
        }),
      );
    });
    it('Must set search box filter value', async () => {
      await methods.typeInput(alInput.filter.walletHistory, typeValue.random);
      await actPendingTimers();
      assertion.toHaveValue(alInput.filter.walletHistory, typeValue.random);
    });
    it('Must clear search box filter value', async () => {
      await methods.typeInput(alInput.filter.walletHistory, typeValue.random);
      await actPendingTimers();
      assertion.toHaveValue(alInput.filter.walletHistory, typeValue.random);
      await clickAwait([alDiv.wallet.history.clearFilters]);
      actAdvanceTime(400);
      assertion.toHaveValue(alInput.filter.walletHistory, typeValue.empty);
    });
    it('Must filter by an specific value and display 1 transaction', async () => {
      await methods.typeInput(
        alInput.filter.walletHistory,
        typeValue.uniqueValue,
      );
      actAdvanceTime(200);
      assertion.getByLabelText(alDiv.wallet.history.item);
      assertion.getByDisplay(typeValue.uniqueValue);
    });
    filters.forEach((filter) => {
      it(`Must show specific number of transaction(s) when clicking filter: ${filter}`, async () => {
        await clickAwait([alDiv.wallet.history.filterPanel, prefix + filter]);
        actAdvanceTime(200);
        expect(screen.getAllByLabelText(alDiv.wallet.history.item).length).toBe(
          constants.results.lengths[filter],
        );
      });
    });
    describe('No delegations In/Out Filters', () => {
      noDelegationsInOut.run();
    });
    it('Must show details when clicked', async () => {
      await clickAwait([alDiv.wallet.history.filterPanel, prefix + filters[0]]);
      actAdvanceTime(200);
      await clickAwait([alDiv.transactions.expandableArea]);
      assertion.getOneByText(constants.transfer.data.memo);
    });
    it('Must show tool tip with date/time when hovered', async () => {
      await clickAwait([alDiv.wallet.history.filterPanel, prefix + filters[0]]);
      actAdvanceTime(200);
      await clickAwait([alDiv.transactions.expandableArea]);
      await clickTypeAwait([
        { ariaLabel: alToolTip.custom.toolTip, event: EventType.HOVER },
      ]);
      assertion.getOneByText(constants.transfer.toolTip);
    });
  });
  describe('No tranfers in data', () => {
    beforeEach(async () => {
      await walletHistory.beforeEach(<App />, { noTransfersOnData: true });
      await actPendingTimers();
    });
    noTransfersInData.run();
  });
  describe('Default filters from storage:\n', () => {
    filters.forEach((filter) => {
      it(`Must load expected transactions, using ${filter} as filter`, async () => {
        await walletHistory.beforeEach(<App />, {
          reImplementFilter: filter,
        });
        await actPendingTimers();
        await waitFor(() => {
          expect(
            screen.getAllByLabelText(alDiv.wallet.history.item).length,
          ).toBe(constants.results.lengths[filter]);
        });
      });
    });
  });
  describe('No Transactions', () => {
    beforeEach(async () => {
      await walletHistory.beforeEach(<App />, { emptyTransactions: true });
    });
    it('Must show messages if no transactions', async () => {
      assertion.getManyByText([
        constants.error.emptyList,
        constants.error.tryClearFilter,
      ]);
    });
  });
});
