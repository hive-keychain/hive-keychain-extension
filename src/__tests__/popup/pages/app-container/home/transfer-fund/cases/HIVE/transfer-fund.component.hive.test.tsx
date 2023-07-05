import { TransactionResult } from '@interfaces/hive-tx.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Icons } from '@popup/icons.enum';
import { exchanges } from '@popup/pages/app-container/home/buy-coins/buy-coins-list-item.list';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdCheckbox from 'src/__tests__/utils-for-testing/data-testid/data-testid-checkbox';
import dataTestIdDiv from 'src/__tests__/utils-for-testing/data-testid/data-testid-div';
import dataTestIdDropdown from 'src/__tests__/utils-for-testing/data-testid/data-testid-dropdown';
import dataTestIdInput from 'src/__tests__/utils-for-testing/data-testid/data-testid-input';
import dataTestIdSelect from 'src/__tests__/utils-for-testing/data-testid/data-testid-select';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import phishing from 'src/__tests__/utils-for-testing/data/phishing';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { HiveAppComponent } from 'src/multichain-container/hive/hive-app.component';
import CurrencyUtils from 'src/utils/currency.utils';
import { FavoriteUserUtils } from 'src/utils/favorite-user.utils';
import TransferUtils from 'src/utils/transfer.utils';
describe('transfer-fund.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  describe('HIVE cases:\n', () => {
    describe('Having all keys:\n', () => {
      beforeEach(async () => {
        await reactTestingLibrary.renderWithConfiguration(
          <HiveAppComponent />,
          initialStates.iniStateAs.defaultExistent,
        );
        await act(async () => {
          await userEvent.click(
            screen.getByTestId(
              `${
                dataTestIdDropdown.arrow.preFix
              }${CurrencyUtils.getCurrencyLabels(false).hive.toLowerCase()}`,
            ),
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdDropdown.itemPreFix + Icons.SEND),
          );
        });
      });
      it('Must show transfer fund page with hive currency selected', async () => {
        expect(
          await screen.findByTestId(`${Screen.TRANSFER_FUND_PAGE}-page`),
        ).toBeInTheDocument();
        //bellow the only element using an actual aria-label.
        expect(
          await screen.findByLabelText(dataTestIdSelect.accountSelector),
        ).toHaveTextContent(CurrencyUtils.getCurrencyLabels(false).hive);
      });

      it('Must show error if no amount when transferring', async () => {
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.username),
            mk.user.two,
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.transfer.send),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_fill_form_error'),
          ),
        );
      });

      it('Must show error if no receiverUsername', async () => {
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '1.000',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.transfer.send),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_fill_form_error'),
          ),
        );
      });

      it('Must show error if empty receiverUsername', async () => {
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.username),
            '{space}',
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '1.000',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.transfer.send),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_fill_form_error'),
          ),
        );
      });

      it('Must show error if negative amount', async () => {
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.username),
            mk.user.two,
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '-1.000',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.transfer.send),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_need_positive_amount'),
          ),
        );
      });

      it('Must show error if not enough balance', async () => {
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.username),
            mk.user.two,
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '1000000000000',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.transfer.send),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_power_up_down_error'),
          ),
        );
      });

      it('Must show error if no frequency, when selecting recurrent', async () => {
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.username),
            mk.user.two,
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '0.001',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdCheckbox.transfer.recurrent),
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.transfer.send),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage(
              'popup_html_transfer_recurrent_missing_field',
            ),
          ),
        );
      });

      it('Must show error if no iteration', async () => {
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.username),
            mk.user.two,
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '0.001',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdCheckbox.transfer.recurrent),
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.recurrent.frecuency),
            '10',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.transfer.send),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage(
              'popup_html_transfer_recurrent_missing_field',
            ),
          ),
        );
      });

      it('Must show memo warning when transferring to an exchange account', async () => {
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.username),
            exchanges.filter((exchange) =>
              exchange.acceptedCoins.includes('HIVE'),
            )[0].username,
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '0.001',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.transfer.send),
          );
        });
        await waitFor(async () => {
          const warningDivHTMLElement = await screen.findByTestId(
            dataTestIdDiv.warning.message,
          );
          expect(warningDivHTMLElement).toHaveTextContent(
            chrome.i18n.getMessage('popup_warning_exchange_memo'),
          );
        });
      });

      it('Must show phishing warning', async () => {
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.username),
            phishing.accounts[0],
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '0.001',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.transfer.send),
          );
        });
        await waitFor(async () => {
          const warningDivHTMLElement = await screen.findByTestId(
            dataTestIdDiv.warning.message,
          );
          expect(warningDivHTMLElement).toHaveTextContent(
            chrome.i18n.getMessage('popup_warning_phishing', [
              phishing.accounts[0],
            ]),
          );
        });
      });

      it('Must return to transfer page after clicking cancel confirmation', async () => {
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.username),
            mk.user.two,
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '0.001',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.transfer.send),
          );
        });
        await waitFor(async () => {
          expect(
            await screen.findByTestId(`${Screen.CONFIRMATION_PAGE}-page`),
          ).toBeInTheDocument();
        });
        await act(async () => {
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.dialog.cancel),
          );
        });
        await waitFor(async () => {
          expect(
            await screen.findByTestId(`${Screen.TRANSFER_FUND_PAGE}-page`),
          ).toBeInTheDocument();
        });
      });

      it('Must show encrypted text & confirmation page', async () => {
        const memoField = '#Private Message';
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.username),
            mk.user.two,
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '0.001',
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.memoOptional),
            memoField,
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.transfer.send),
          );
        });
        await waitFor(async () => {
          expect(
            await screen.findByTestId(`${Screen.CONFIRMATION_PAGE}-page`),
          ).toBeInTheDocument();
          expect(
            await screen.findByText(
              `${memoField} (${chrome.i18n.getMessage('popup_encrypted')})`,
            ),
          ).toBeInTheDocument();
        });
      });

      it('Must show success message on transfer', async () => {
        TransferUtils.sendTransfer = jest.fn().mockResolvedValue({
          tx_id: 'trx_id',
          id: 'id',
          confirmed: true,
        } as TransactionResult);
        FavoriteUserUtils.saveFavoriteUser = jest
          .fn()
          .mockResolvedValue(undefined);
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.username),
            mk.user.two,
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '0.001',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.transfer.send),
          );
          await userEvent.click(
            await screen.findByTestId(dataTestIdButton.dialog.confirm),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_transfer_successful', [
              `@${mk.user.two}`,
              '0.001 HIVE',
            ]),
          ),
        ).toBeInTheDocument();
      });

      it('Must show success message on recurrent cancellation', async () => {
        TransferUtils.sendTransfer = jest.fn().mockResolvedValue({
          tx_id: 'trx_id',
          id: 'id',
          confirmed: true,
        } as TransactionResult);
        FavoriteUserUtils.saveFavoriteUser = jest
          .fn()
          .mockResolvedValue(undefined);
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.username),
            mk.user.two,
          );
          await userEvent.type(screen.getByTestId(dataTestIdInput.amount), '0');
          await userEvent.click(
            screen.getByTestId(dataTestIdCheckbox.transfer.recurrent),
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.transfer.send),
          );
          await userEvent.click(
            await screen.findByTestId(dataTestIdButton.dialog.confirm),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage(
              'popup_html_cancel_transfer_recurrent_successful',
              [`@${mk.user.two}`],
            ),
          ),
        ).toBeInTheDocument();
      });

      it('Must show success message on recurrent', async () => {
        TransferUtils.sendTransfer = jest.fn().mockResolvedValue({
          tx_id: 'trx_id',
          id: 'id',
          confirmed: true,
        } as TransactionResult);
        FavoriteUserUtils.saveFavoriteUser = jest
          .fn()
          .mockResolvedValue(undefined);
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.username),
            mk.user.two,
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '0.001',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdCheckbox.transfer.recurrent),
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.recurrent.frecuency),
            '10',
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.recurrent.iterations),
            '10',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.transfer.send),
          );
          await userEvent.click(
            await screen.findByTestId(dataTestIdButton.dialog.confirm),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_transfer_recurrent_successful', [
              `@${mk.user.two}`,
              '0.001 HIVE',
              '10',
              '10',
            ]),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error when failed transaction', async () => {
        TransferUtils.sendTransfer = jest.fn().mockResolvedValue(null);
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.username),
            mk.user.two,
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '0.001',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.transfer.send),
          );
          await userEvent.click(
            await screen.findByTestId(dataTestIdButton.dialog.confirm),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_transfer_failed'),
          ),
        ).toBeInTheDocument();
      });

      it('Must catch error & show, when failed transaction', async () => {
        TransferUtils.sendTransfer = jest
          .fn()
          .mockRejectedValue(new Error('Failed to sign'));
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.username),
            mk.user.two,
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '0.001',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.transfer.send),
          );
          await userEvent.click(
            await screen.findByTestId(dataTestIdButton.dialog.confirm),
          );
        });
        expect(await screen.findByText('Failed to sign')).toBeInTheDocument();
      });
    });

    describe('No memo Key:\n', () => {
      beforeEach(async () => {
        const cloneLocalAccounts = objects.clone(
          accounts.twoAccounts,
        ) as LocalAccount[];
        delete cloneLocalAccounts[0].keys.memo;
        delete cloneLocalAccounts[0].keys.memoPubkey;
        await reactTestingLibrary.renderWithConfiguration(
          <HiveAppComponent />,
          initialStates.iniStateAs.defaultExistent,
          {
            app: {
              accountsRelated: {
                AccountUtils: {
                  getAccountsFromLocalStorage: cloneLocalAccounts,
                },
              },
            },
          },
        );
        await act(async () => {
          await userEvent.click(
            screen.getByTestId(
              `${
                dataTestIdDropdown.arrow.preFix
              }${CurrencyUtils.getCurrencyLabels(false).hive.toLowerCase()}`,
            ),
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdDropdown.itemPreFix + Icons.SEND),
          );
        });
      });
      it('Must show error if no memo key', async () => {
        const memoField = '#Private Message';
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.username),
            mk.user.two,
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '0.001',
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.memoOptional),
            memoField,
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.transfer.send),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_memo_key_missing'),
          ),
        ).toBeInTheDocument();
      });
    });

    describe('No Active key:\n', () => {
      beforeEach(async () => {
        const cloneLocalAccounts = objects.clone(
          accounts.twoAccounts,
        ) as LocalAccount[];
        delete cloneLocalAccounts[0].keys.active;
        delete cloneLocalAccounts[0].keys.activePubkey;
        await reactTestingLibrary.renderWithConfiguration(
          <HiveAppComponent />,
          initialStates.iniStateAs.defaultExistent,
          {
            app: {
              accountsRelated: {
                AccountUtils: {
                  getAccountsFromLocalStorage: cloneLocalAccounts,
                },
              },
            },
          },
        );
        await act(async () => {
          await userEvent.click(
            screen.getByTestId(
              `${
                dataTestIdDropdown.arrow.preFix
              }${CurrencyUtils.getCurrencyLabels(false).hive.toLowerCase()}`,
            ),
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdDropdown.itemPreFix + Icons.SEND),
          );
        });
      });
      it('Must show error making a transfer', async () => {
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.username),
            mk.user.two,
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '0.001',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.transfer.send),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_missing_key', ['active']),
          ),
        ).toBeInTheDocument();
      });
    });
  });
});
