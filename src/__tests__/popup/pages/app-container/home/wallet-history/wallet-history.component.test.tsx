import App from '@popup/App';
import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import walletHistory from 'src/__tests__/popup/pages/app-container/home/wallet-history/mocks/wallet-history';
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
const { methods, constants, extraMocks, filters, prefix } = walletHistory;
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
    it('Must filter by an specific value and display 1 transaction', async () => {
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
    filters.forEach((filter) => {
      it(`Must show specific number of transaction(s) when clicking filter: ${filter}`, async () => {
        await actPendingTimers();
        extraMocks.scrollToNotImpl();
        await clickAwait([alDiv.wallet.history.filterPanel, prefix + filter]);
        actAdvanceTime(200);
        expect(screen.getAllByLabelText(alDiv.wallet.history.item).length).toBe(
          constants.results.lengths[filter],
        );
      });
    });
    const noDelegations = filters.filter(
      (filter) => filter !== 'delegate_vesting_shares',
    );
    noDelegations.forEach((filter) => {
      it(`Must show IN transactions when applied filter ${filter}`, async () => {
        await actPendingTimers();
        extraMocks.scrollToNotImpl();
        await clickAwait([
          alDiv.wallet.history.filterPanel,
          prefix + filter,
          alDiv.wallet.history.byIn,
        ]);
        actAdvanceTime(200);
        expect(screen.getAllByLabelText(alDiv.wallet.history.item).length).toBe(
          constants.results.in[filter],
        );
      });
      it(`Must show OUT transactions when applied filter ${filter}`, async () => {
        await actPendingTimers();
        extraMocks.scrollToNotImpl();
        await clickAwait([
          alDiv.wallet.history.filterPanel,
          prefix + filter,
          alDiv.wallet.history.byOut,
        ]);
        actAdvanceTime(200);
        expect(
          screen.queryAllByLabelText(alDiv.wallet.history.item).length,
        ).toBe(constants.results.out[filter]);
      });
    });
    it('Must show details when clicked', async () => {
      await actPendingTimers();
      extraMocks.scrollToNotImpl();
      await clickAwait([alDiv.wallet.history.filterPanel, prefix + filters[0]]);
      actAdvanceTime(200);
      await clickAwait([alDiv.transactions.expandableArea]);
      assertion.getOneByText(constants.typeValue.transferExpanded.memo);
    });
    it('Must show tool tip with date time when hovered', async () => {
      await actPendingTimers();
      extraMocks.scrollToNotImpl();
      await clickAwait([alDiv.wallet.history.filterPanel, prefix + filters[0]]);
      actAdvanceTime(200);
      await clickAwait([alDiv.transactions.expandableArea]);
      await clickTypeAwait([
        { ariaLabel: alToolTip.custom.toolTip, event: EventType.HOVER },
      ]);
      assertion.getOneByText(constants.typeValue.transfer.toolTip);
    });
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
  describe.skip('No Transactions', () => {
    //TODO: let's check the whole process of this case as
    //  i don't know but it seems it is not taken into account, when
    //  a user has no transactions as it looks to stay hanged. I.e: New account.
    beforeEach(async () => {
      await walletHistory.beforeEach(<App />, { emptyTransactions: true });
    });
    it('Must show empty if no transactions', async () => {
      //popup_html_transaction_list_is_empty
      await actPendingTimers();
      await waitFor(() => {
        expect(screen.getAllByLabelText(alDiv.wallet.history.item).length).toBe(
          transactions.length,
        );
      });
    });
  });

  //what if we code instead of no data, a case where applied filters brings no results
  //so we can check on the data message ??
  //will need:
  // change the wallet.history.getTrasnactions.
});
