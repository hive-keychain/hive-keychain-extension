import { FavoriteUserUtils } from '@hiveapp/utils/favorite-user.utils';
import { SavingsUtils } from '@hiveapp/utils/savings.utils';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdDropdown from 'src/__tests__/utils-for-testing/data-testid/data-testid-dropdown';
import dataTestIdInput from 'src/__tests__/utils-for-testing/data-testid/data-testid-input';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
import { Screen } from 'src/reference-data/screen.enum';
import FormatUtils from 'src/utils/format.utils';

describe('savings.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <HiveAppComponent />,
      initialStates.iniStateAs.defaultExistent,
    );
  });
  describe('HIVE:\n', () => {
    describe('withdraw:\n', () => {
      const hiveSavingsBalance = parseFloat(
        accounts.extended.savings_balance.toString().split(' HIVE')[0],
      );
      beforeEach(async () => {
        await act(async () => {
          await userEvent.click(
            await screen.findByTestId(dataTestIdDropdown.arrow.hive),
          );
          await userEvent.click(
            await screen.findByTestId(dataTestIdDropdown.span.savings),
          );
          fireEvent.click(
            await screen.findByTestId(
              dataTestIdDropdown.select.savings.operation.selector,
            ),
          );
          await userEvent.click(
            await screen.findByTestId(
              dataTestIdDropdown.select.savings.operation.withdraw,
            ),
          );
        });
      });

      it('Must show withdraw message', async () => {
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_withdraw_text'),
            { exact: true },
          ),
        ).toBeInTheDocument();
      });

      it('Must set input to max & load HIVE withdraw confirmation text', async () => {
        await waitFor(() => {
          expect(
            screen.getByTestId(`${Screen.SAVINGS_PAGE}-page`),
          ).not.toHaveTextContent('...');
        });
        await act(async () => {
          await userEvent.click(screen.getByTestId(dataTestIdButton.setToMax));
        });
        await waitFor(() => {
          const amountInput = screen.getByTestId(
            dataTestIdInput.amount,
          ) as HTMLInputElement;
          expect(parseFloat(amountInput.value)).toBeCloseTo(
            hiveSavingsBalance,
            2,
          );
        });
        await act(async () => {
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.savings.submit),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_confirm_savings_withdraw', [
              'HIVE',
            ]),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error if not enough balance', async () => {
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            String(hiveSavingsBalance + 1),
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.savings.submit),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('validation_error_less_or_equal_value'),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error if operation fails', async () => {
        SavingsUtils.withdraw = jest.fn().mockResolvedValue(null);
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '10',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.savings.submit),
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.dialog.confirm),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_withdraw_fail', ['HIVE']),
          ),
        ).toBeInTheDocument();
      });

      it('Must show success message in HIVE', async () => {
        SavingsUtils.withdraw = jest.fn().mockResolvedValue({
          tx_id: 'tx_id',
          id: 'id',
          confirmed: true,
        } as TransactionResult);
        FavoriteUserUtils.saveFavoriteUser = jest.fn();
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '10',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.savings.submit),
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.dialog.confirm),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_withdraw_success', [
              `${FormatUtils.formatCurrencyValue(10)} HIVE`,
            ]),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error in HIVE withdraw', async () => {
        SavingsUtils.withdraw = jest
          .fn()
          .mockRejectedValue(new Error('Error withdraw'));
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '10',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.savings.submit),
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.dialog.confirm),
          );
        });
        expect(await screen.findByText('Error withdraw')).toBeInTheDocument();
      });
    });

    describe('deposit:\n', () => {
      const hiveBalance = parseFloat(
        accounts.extended.balance.toString().split(' HIVE')[0],
      );
      beforeEach(async () => {
        await act(async () => {
          await userEvent.click(
            await screen.findByTestId(dataTestIdDropdown.arrow.hive),
          );
          await userEvent.click(
            await screen.findByTestId(dataTestIdDropdown.span.savings),
          );
          fireEvent.click(
            await screen.findByTestId(
              dataTestIdDropdown.select.savings.operation.selector,
            ),
          );
          await userEvent.click(
            await screen.findByTestId(
              dataTestIdDropdown.select.savings.operation.deposit,
            ),
          );
        });
      });

      it('Must show deposit HIVE button', async () => {
        expect(
          await screen.findByTestId(dataTestIdButton.operation.savings.submit),
        ).toHaveTextContent('Deposit HIVE');
      });

      it('Must set input to max & load HIVE deposit confirmation text', async () => {
        await waitFor(() => {
          expect(
            screen.getByTestId(`${Screen.SAVINGS_PAGE}-page`),
          ).not.toHaveTextContent('...');
        });
        await act(async () => {
          await userEvent.click(screen.getByTestId(dataTestIdButton.setToMax));
        });
        await waitFor(() => {
          const el = screen.getByTestId(
            dataTestIdInput.amount,
          ) as HTMLInputElement;
          expect(parseFloat(el.value)).toBeCloseTo(hiveBalance, 2);
        });
        await act(async () => {
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.savings.submit),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_confirm_savings_deposit', [
              'HIVE',
            ]),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error if not enough balance', async () => {
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            String(hiveBalance + 1),
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.savings.submit),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('validation_error_less_or_equal_value'),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error if operation fails', async () => {
        SavingsUtils.deposit = jest.fn().mockResolvedValue(null);
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '10',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.savings.submit),
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.dialog.confirm),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_deposit_fail', ['HIVE']),
          ),
        ).toBeInTheDocument();
      });

      it('Must show success message in HIVE deposit', async () => {
        SavingsUtils.deposit = jest.fn().mockResolvedValue({
          tx_id: 'tx_id',
          id: 'id',
          confirmed: true,
        } as TransactionResult);
        FavoriteUserUtils.saveFavoriteUser = jest.fn();
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '10',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.savings.submit),
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.dialog.confirm),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_deposit_success', [
              `${FormatUtils.formatCurrencyValue(10)} HIVE`,
            ]),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error in HIVE desposit', async () => {
        SavingsUtils.deposit = jest
          .fn()
          .mockRejectedValue(new Error('Error deposit'));
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '10',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.savings.submit),
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.dialog.confirm),
          );
        });
        expect(await screen.findByText('Error deposit')).toBeInTheDocument();
      });
    });
  });

  describe('HBD:\n', () => {
    describe('withdraw:\n', () => {
      const hbdSavingsBalance = parseFloat(
        accounts.extended.savings_hbd_balance.toString().split(' HBD')[0],
      );
      beforeEach(async () => {
        await act(async () => {
          await userEvent.click(
            await screen.findByTestId(dataTestIdDropdown.arrow.hbd),
          );
          await userEvent.click(
            await screen.findByTestId(dataTestIdDropdown.span.savings),
          );
          fireEvent.click(
            await screen.findByTestId(
              dataTestIdDropdown.select.savings.operation.selector,
            ),
          );
          await userEvent.click(
            await screen.findByTestId(
              dataTestIdDropdown.select.savings.operation.withdraw,
            ),
          );
        });
      });

      it('Must show withdraw message', async () => {
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_withdraw_text'),
            { exact: true },
          ),
        ).toBeInTheDocument();
      });

      it('Must set input to max & load HBD withdraw confirmation text', async () => {
        await waitFor(() => {
          expect(
            screen.getByTestId(`${Screen.SAVINGS_PAGE}-page`),
          ).not.toHaveTextContent('...');
        });
        await act(async () => {
          await userEvent.click(screen.getByTestId(dataTestIdButton.setToMax));
        });
        await waitFor(() => {
          const el = screen.getByTestId(
            dataTestIdInput.amount,
          ) as HTMLInputElement;
          expect(parseFloat(el.value)).toBeCloseTo(hbdSavingsBalance, 2);
        });
        await act(async () => {
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.savings.submit),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_confirm_savings_withdraw', [
              'HBD',
            ]),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error if not enough balance', async () => {
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            String(hbdSavingsBalance + 1),
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.savings.submit),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('validation_error_less_or_equal_value'),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error if operation fails', async () => {
        SavingsUtils.withdraw = jest.fn().mockResolvedValue(null);
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '10',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.savings.submit),
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.dialog.confirm),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_withdraw_fail', ['HBD']),
          ),
        ).toBeInTheDocument();
      });

      it('Must show success message in HBD', async () => {
        SavingsUtils.withdraw = jest.fn().mockResolvedValue({
          tx_id: 'tx_id',
          id: 'id',
          confirmed: true,
        } as TransactionResult);
        FavoriteUserUtils.saveFavoriteUser = jest.fn();
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '10',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.savings.submit),
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.dialog.confirm),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_withdraw_success', [
              `${FormatUtils.formatCurrencyValue(10)} HBD`,
            ]),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error in HBD withdraw', async () => {
        SavingsUtils.withdraw = jest
          .fn()
          .mockRejectedValue(new Error('Error withdraw HBD'));
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '10',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.savings.submit),
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.dialog.confirm),
          );
        });
        expect(
          await screen.findByText('Error withdraw HBD'),
        ).toBeInTheDocument();
      });
    });

    describe('deposit:\n', () => {
      const hbdBalance = parseFloat(
        accounts.extended.hbd_balance.toString().split(' HBD')[0],
      );
      beforeEach(async () => {
        await act(async () => {
          await userEvent.click(
            await screen.findByTestId(dataTestIdDropdown.arrow.hbd),
          );
          await userEvent.click(
            await screen.findByTestId(dataTestIdDropdown.span.savings),
          );
          fireEvent.click(
            await screen.findByTestId(
              dataTestIdDropdown.select.savings.operation.selector,
            ),
          );
          await userEvent.click(
            await screen.findByTestId(
              dataTestIdDropdown.select.savings.operation.deposit,
            ),
          );
        });
      });

      it('Must show deposit HBD button', async () => {
        expect(
          await screen.findByTestId(dataTestIdButton.operation.savings.submit),
        ).toHaveTextContent('Deposit HBD');
      });

      it('Must set input to max & load HBD deposit confirmation text', async () => {
        await waitFor(() => {
          expect(
            screen.getByTestId(`${Screen.SAVINGS_PAGE}-page`),
          ).not.toHaveTextContent('...');
        });
        await act(async () => {
          await userEvent.click(screen.getByTestId(dataTestIdButton.setToMax));
        });
        await waitFor(() => {
          const el = screen.getByTestId(
            dataTestIdInput.amount,
          ) as HTMLInputElement;
          expect(parseFloat(el.value)).toBeCloseTo(hbdBalance, 2);
        });
        await act(async () => {
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.savings.submit),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_confirm_savings_deposit', [
              'HBD',
            ]),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error if not enough HBD balance', async () => {
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            String(hbdBalance + 1),
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.savings.submit),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('validation_error_less_or_equal_value'),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error if HBD operation fails', async () => {
        SavingsUtils.deposit = jest.fn().mockResolvedValue(null);
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '10',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.savings.submit),
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.dialog.confirm),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_deposit_fail', ['HBD']),
          ),
        ).toBeInTheDocument();
      });

      it('Must show success message in HBD deposit', async () => {
        SavingsUtils.deposit = jest.fn().mockResolvedValue({
          tx_id: 'tx_id',
          id: 'id',
          confirmed: true,
        } as TransactionResult);
        FavoriteUserUtils.saveFavoriteUser = jest.fn();
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '10',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.savings.submit),
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.dialog.confirm),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_deposit_success', [
              `${FormatUtils.formatCurrencyValue(10)} HBD`,
            ]),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error in HBD desposit', async () => {
        SavingsUtils.deposit = jest
          .fn()
          .mockRejectedValue(new Error('Error deposit HBD'));
        await act(async () => {
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.amount),
            '10',
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.operation.savings.submit),
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.dialog.confirm),
          );
        });
        expect(
          await screen.findByText('Error deposit HBD'),
        ).toBeInTheDocument();
      });
    });
  });
});
