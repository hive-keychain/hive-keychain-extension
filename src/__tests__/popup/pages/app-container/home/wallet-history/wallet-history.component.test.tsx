import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import { DEFAULT_FILTER } from '@popup/pages/app-container/home/wallet-history/wallet-history.component';
import '@testing-library/jest-dom';
import { act, cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelDiv from 'src/__tests__/utils-for-testing/aria-labels/aria-label-div';
import ariaLabelInput from 'src/__tests__/utils-for-testing/aria-labels/aria-label-input';
import walletHistory from 'src/__tests__/utils-for-testing/data/history/transactions/wallet-history';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
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

  describe('With Transactions to show', () => {
    Element.prototype.scrollTo = jest.fn();
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
        initialStates.iniStateAs.defaultExistent,
        {
          app: {
            accountsRelated: {
              TransactionUtils: {
                getTransactions: walletHistory.rawAllTypes,
                getLastTransaction: walletHistory.rawAllTypes.length,
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
      await waitFor(async () => {
        const historyItemHTMLElementList = await screen.findAllByLabelText(
          ariaLabelDiv.wallet.history.item,
        );
        expect(historyItemHTMLElementList).toHaveLength(
          walletHistory.rawAllTypes.length,
        );
      });
    });

    it('Must show available all filters', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(ariaLabelDiv.wallet.history.filterPanel),
        );
      });
      Object.keys(DEFAULT_FILTER.selectedTransactionTypes).map(
        (filterOperationType) => {
          expect(
            screen.getByLabelText(
              `${ariaLabelDiv.wallet.history.filterSelector.preFix}${filterOperationType}`,
            ),
          ).toBeInTheDocument();
        },
      );
      expect(
        screen.getByLabelText(ariaLabelDiv.wallet.history.byIncoming),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(ariaLabelDiv.wallet.history.byOutgoing),
      ).toBeInTheDocument();
    });

    it('Must set search box filter value & display try clear message', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(ariaLabelDiv.wallet.history.filterPanel),
        );
        await userEvent.type(
          screen.getByLabelText(ariaLabelInput.filter.walletHistory),
          'one op',
        );
      });
      expect(
        await screen.findByLabelText(ariaLabelInput.filter.walletHistory),
      ).toHaveValue('one op');
      expect(
        await screen.findByText(
          chrome.i18n.getMessage(
            'popup_html_transaction_list_is_empty_try_clear_filter',
          ),
        ),
      ).toBeInTheDocument();
    });

    it('Must filter by an specific value and display 1 transaction', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(ariaLabelDiv.wallet.history.filterPanel),
        );
        await userEvent.type(
          screen.getByLabelText(ariaLabelInput.filter.walletHistory),
          'unique memo',
        );
      });
      expect(
        await screen.findAllByLabelText(ariaLabelDiv.wallet.history.item),
      ).toHaveLength(1);
    });
  });
});
