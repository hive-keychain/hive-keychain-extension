import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelDiv from 'src/__tests__/utils-for-testing/aria-labels/aria-label-div';
import walletHistory from 'src/__tests__/utils-for-testing/data/history/transactions/wallet-history';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
describe('wallet-history.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  describe('No transactions to show', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
        initialStates.iniStateAs.defaultExistent,
      );
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelButton.actionBtn.preFix + Icons.HISTORY,
          ),
        );
      });
    });
    it('Must show empty transactions & try clear filter, messages', async () => {
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_transaction_list_is_empty'),
        ),
      ).toBeInTheDocument();
      expect(
        await screen.findByText(
          chrome.i18n.getMessage(
            'popup_html_transaction_list_is_empty_try_clear_filter',
          ),
        ),
      ).toBeInTheDocument();
    });
  });
  describe('With Transactions', () => {
    Element.prototype.scrollTo = jest.fn();
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
        initialStates.iniStateAs.defaultExistent,
        {
          app: {
            accountsRelated: {
              TransactionUtils: {
                getAccountTransactions: [walletHistory.allTypes, 1000],
                getLastTransaction: -1,
              },
            },
          },
        },
      );
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelButton.actionBtn.preFix + Icons.HISTORY,
          ),
        );
      });
    });
    it('Must show transaction list', async () => {
      //TODO finish from here.
      // await waitFor(() => {
      const historyItemHTMLElementList = await screen.findAllByLabelText(
        ariaLabelDiv.wallet.history.item,
      );
      // expect(historyItemHTMLElementList[9]).toHaveTextContent('');
      expect(historyItemHTMLElementList).toHaveLength(
        walletHistory.allTypes.length,
      );
      // screen.debug();
      // });
      // await waitFor(() => {
      //   expect(screen.getAllByLabelText(alDiv.wallet.history.item).length).toBe(
      //     transactions.length,
      //   );
      // });
    });

    // it('Must show available filters', async () => {
    //   await clickAwait([alDiv.wallet.history.filterPanel]);
    //   assertion.getByText(
    //     filter.ariaLabelsToFind.map((al) => {
    //       return { arialabelOrText: al, query: QueryDOM.BYLABEL };
    //     }),
    //   );
    // });

    // it('Must set search box filter value', async () => {
    //   await methods.typeInput(alInput.filter.walletHistory, typeValue.random);
    //   await actPendingTimers();
    //   assertion.toHaveValue(alInput.filter.walletHistory, typeValue.random);
    // });

    // it('Must clear search box filter value', async () => {
    //   await methods.typeInput(alInput.filter.walletHistory, typeValue.random);
    //   await actPendingTimers();
    //   assertion.toHaveValue(alInput.filter.walletHistory, typeValue.random);
    //   await clickAwait([alDiv.wallet.history.clearFilters]);
    //   actAdvanceTime(400);
    //   assertion.toHaveValue(alInput.filter.walletHistory, typeValue.empty);
    // });

    // it('Must filter by an specific value and display 1 transaction', async () => {
    //   await methods.typeInput(
    //     alInput.filter.walletHistory,
    //     typeValue.uniqueValue,
    //   );
    //   actAdvanceTime(200);
    //   assertion.getByLabelText(alDiv.wallet.history.item);
    //   assertion.getByDisplay(typeValue.uniqueValue);
    // });

    // filters.forEach((filter) => {
    //   it(`Must show specific number of transaction(s) when clicking filter: ${filter}`, async () => {
    //     await clickAwait([alDiv.wallet.history.filterPanel, prefix + filter]);
    //     actAdvanceTime(200);
    //     expect(screen.getAllByLabelText(alDiv.wallet.history.item).length).toBe(
    //       constants.results.lengths[filter],
    //     );
    //   });
    // });

    // describe('No delegations In/Out Filters', () => {
    //   noDelegationsInOut.run();
    // });

    // it('Must show details when clicked', async () => {
    //   await clickAwait([alDiv.wallet.history.filterPanel, prefix + filters[0]]);
    //   actAdvanceTime(200);
    //   await clickAwait([alDiv.transactions.expandableArea]);
    //   assertion.getOneByText(constants.transfer.data.memo);
    // });

    // it('Must show tool tip with date/time when hovered', async () => {
    //   await clickAwait([alDiv.wallet.history.filterPanel, prefix + filters[0]]);
    //   actAdvanceTime(200);
    //   await clickAwait([alDiv.transactions.expandableArea]);
    //   await clickTypeAwait([
    //     { ariaLabel: alToolTip.custom.toolTip, event: EventType.HOVER },
    //   ]);
    //   assertion.getOneByText(constants.transfer.toolTip);
    // });
  });

  // describe('No tranfers in data', () => {
  //   beforeEach(async () => {
  //     await walletHistory.beforeEach(<App />, { noTransfersOnData: true });
  //     await actPendingTimers();
  //   });
  //   noTransfersInData.run();
  // });

  // describe('Default filters from storage:\n', () => {
  //   filters.forEach((filter) => {
  //     it(`Must load expected transactions, using ${filter} as filter`, async () => {
  //       await walletHistory.beforeEach(<App />, {
  //         reImplementFilter: filter,
  //       });
  //       await actPendingTimers();
  //       await waitFor(() => {
  //         expect(
  //           screen.getAllByLabelText(alDiv.wallet.history.item).length,
  //         ).toBe(constants.results.lengths[filter]);
  //       });
  //     });
  //   });
  // });

  // describe('No Transactions', () => {
  //   beforeEach(async () => {
  //     await walletHistory.beforeEach(<App />, { emptyTransactions: true });
  //   });
  //   it('Must show messages if no transactions', async () => {
  //     assertion.getManyByText([
  //       constants.error.emptyList,
  //       constants.error.tryClearFilter,
  //     ]);
  //   });
  // });
});
