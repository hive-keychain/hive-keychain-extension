import { TransactionResult } from '@interfaces/hive-tx.interface';
import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelDiv from 'src/__tests__/utils-for-testing/aria-labels/aria-label-div';
import ariaLabelDropdown from 'src/__tests__/utils-for-testing/aria-labels/aria-label-dropdown';
import ariaLabelInput from 'src/__tests__/utils-for-testing/aria-labels/aria-label-input';
import ariaLabelSpan from 'src/__tests__/utils-for-testing/aria-labels/aria-label-span';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { DelegationUtils } from 'src/utils/delegation.utils';
import { FavoriteUserUtils } from 'src/utils/favorite-user.utils';

describe('delegations.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  describe('handling errors on load:\n', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
        initialStates.iniStateAs.defaultExistent,
        {
          app: {
            apiRelated: {
              KeychainApi: {
                customData: {
                  delegators: { data: '' },
                },
              },
            },
          },
        },
      );
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(ariaLabelDropdown.arrow.hp),
        );
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelDropdown.itemPreFix + Icons.DELEGATIONS_HP,
          ),
        );
      });
    });

    it('Must load delegations page, and show error', async () => {
      expect(
        await screen.findByText(
          chrome.i18n.getMessage(
            'popup_html_error_retrieving_incoming_delegations',
          ),
        ),
      ).toBeInTheDocument();
    });
  });

  describe('no errors on load:\n', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
        initialStates.iniStateAs.defaultExistent,
      );
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(ariaLabelDropdown.arrow.hp),
        );
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelDropdown.itemPreFix + Icons.DELEGATIONS_HP,
          ),
        );
      });
    });
    it('Must show total incoming/outgoing values', async () => {
      const incomingHTMLElement = await screen.findByLabelText(
        ariaLabelSpan.delegations.incoming.spanTotal,
      );
      expect(incomingHTMLElement.textContent).toContain('+');
      expect(incomingHTMLElement.textContent).toContain('HP');
      const outgoingTotalHTMLElement = await screen.findByLabelText(
        ariaLabelDiv.delegations.outgoing.totalValue,
      );
      expect(outgoingTotalHTMLElement.textContent).toContain('-');
      expect(outgoingTotalHTMLElement.textContent).toContain('HP');
    });

    it('Must navigate to INCOMING_PAGE when clicking incoming', async () => {
      await act(async () => {
        await userEvent.click(
          await screen.findByLabelText(
            ariaLabelButton.delegations.total.incoming,
          ),
        );
      });
      const pageHTMLElement = await screen.findByLabelText(
        `${Screen.INCOMING_OUTGOING_PAGE}-page`,
      );
      expect(pageHTMLElement.textContent).toContain(
        chrome.i18n.getMessage('popup_html_total_incoming'),
      );
    });

    it('Must navigate to INCOMING_OUTGOING_PAGE when clicking outcomming', async () => {
      await act(async () => {
        await userEvent.click(
          await screen.findByLabelText(
            ariaLabelButton.delegations.total.outgoing,
          ),
        );
      });
      const pageHTMLElement = await screen.findByLabelText(
        `${Screen.INCOMING_OUTGOING_PAGE}-page`,
      );
      expect(pageHTMLElement.textContent).toContain(
        chrome.i18n.getMessage('popup_html_total_outgoing'),
      );
    });

    it('Must show error when delegation fails', async () => {
      DelegationUtils.delegateVestingShares = jest.fn().mockResolvedValue({
        tx_id: 'tx_id',
        id: 'id',
        confirmed: false,
      } as TransactionResult);
      await act(async () => {
        await userEvent.type(
          await screen.findByLabelText(ariaLabelInput.username),
          'keychain.user1',
        );
        await userEvent.type(
          await screen.findByLabelText(ariaLabelInput.amount),
          '0.01',
        );
        await userEvent.click(
          await screen.findByLabelText(
            ariaLabelButton.operation.delegate.submit,
          ),
        );
        await userEvent.click(
          await screen.findByLabelText(ariaLabelButton.dialog.confirm),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_delegation_fail'),
        ),
      ).toBeInTheDocument();
    });

    it('Must make a delegation & show message', async () => {
      DelegationUtils.delegateVestingShares = jest.fn().mockResolvedValue({
        tx_id: 'tx_id',
        id: 'id',
        confirmed: true,
      } as TransactionResult);
      FavoriteUserUtils.saveFavoriteUser = jest.fn();
      await act(async () => {
        await userEvent.type(
          await screen.findByLabelText(ariaLabelInput.username),
          'keychain.user1',
        );
        await userEvent.type(
          await screen.findByLabelText(ariaLabelInput.amount),
          '0.01',
        );
        await userEvent.click(
          await screen.findByLabelText(
            ariaLabelButton.operation.delegate.submit,
          ),
        );
        await userEvent.click(
          await screen.findByLabelText(ariaLabelButton.dialog.confirm),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_delegation_successful'),
        ),
      ).toBeInTheDocument();
    });

    it('Must cancel a delegation & show message', async () => {
      DelegationUtils.delegateVestingShares = jest.fn().mockResolvedValue({
        tx_id: 'tx_id',
        id: 'id',
        confirmed: true,
      } as TransactionResult);
      FavoriteUserUtils.saveFavoriteUser = jest.fn();
      await act(async () => {
        await userEvent.type(
          await screen.findByLabelText(ariaLabelInput.username),
          'keychain.user1',
        );
        await userEvent.type(
          await screen.findByLabelText(ariaLabelInput.amount),
          '{space}',
        );
        await userEvent.click(
          await screen.findByLabelText(
            ariaLabelButton.operation.delegate.submit,
          ),
        );
        await userEvent.click(
          await screen.findByLabelText(ariaLabelButton.dialog.confirm),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_cancel_delegation_successful'),
        ),
      ).toBeInTheDocument();
    });

    it('Must show error message if cancellation fail', async () => {
      DelegationUtils.delegateVestingShares = jest.fn().mockResolvedValue({
        tx_id: 'tx_id',
        id: 'id',
        confirmed: false,
      } as TransactionResult);
      FavoriteUserUtils.saveFavoriteUser = jest.fn();
      await act(async () => {
        await userEvent.type(
          await screen.findByLabelText(ariaLabelInput.username),
          'keychain.user1',
        );
        await userEvent.type(
          await screen.findByLabelText(ariaLabelInput.amount),
          '{space}',
        );
        await userEvent.click(
          await screen.findByLabelText(
            ariaLabelButton.operation.delegate.submit,
          ),
        );
        await userEvent.click(
          await screen.findByLabelText(ariaLabelButton.dialog.confirm),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_cancel_delegation_fail'),
        ),
      ).toBeInTheDocument();
    });

    it('Must catch error and show message', async () => {
      DelegationUtils.delegateVestingShares = jest
        .fn()
        .mockRejectedValue(new Error('Error on delegation'));
      await act(async () => {
        await userEvent.type(
          await screen.findByLabelText(ariaLabelInput.username),
          'keychain.user1',
        );
        await userEvent.type(
          await screen.findByLabelText(ariaLabelInput.amount),
          '{space}',
        );
        await userEvent.click(
          await screen.findByLabelText(
            ariaLabelButton.operation.delegate.submit,
          ),
        );
        await userEvent.click(
          await screen.findByLabelText(ariaLabelButton.dialog.confirm),
        );
      });
      expect(
        await screen.findByText('Error on delegation'),
      ).toBeInTheDocument();
    });
  });
});
