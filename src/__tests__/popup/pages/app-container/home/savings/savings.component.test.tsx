import { TransactionResult } from '@interfaces/hive-tx.interface';
import App from '@popup/App';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdDropdown from 'src/__tests__/utils-for-testing/data-testid/data-testid-dropdown';
import dataTestIdInput from 'src/__tests__/utils-for-testing/data-testid/data-testid-input';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { FavoriteUserUtils } from 'src/utils/favorite-user.utils';
import { SavingsUtils } from 'src/utils/savings.utils';

describe('savings.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <App />,
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
            await screen.findByLabelText(dataTestIdDropdown.arrow.hive),
          );
          await userEvent.click(
            await screen.findByLabelText(dataTestIdDropdown.span.savings),
          );
          await userEvent.click(
            await screen.findByLabelText(
              dataTestIdDropdown.select.savings.operation.selector,
            ),
          );
          await userEvent.click(
            await screen.findByLabelText(
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
        await act(async () => {
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.setToMax),
          );
        });
        expect(
          await screen.findByLabelText(dataTestIdInput.amount),
        ).toHaveValue(hiveSavingsBalance);
        await act(async () => {
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.operation.savings.submit),
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
            screen.getByLabelText(dataTestIdInput.amount),
            String(hiveSavingsBalance + 1),
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.operation.savings.submit),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_power_up_down_error'),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error if operation fails', async () => {
        SavingsUtils.withdraw = jest.fn().mockResolvedValue({
          tx_id: 'tx_id',
          id: 'id',
          confirmed: false,
        } as TransactionResult);
        await act(async () => {
          await userEvent.type(
            screen.getByLabelText(dataTestIdInput.amount),
            '10',
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.operation.savings.submit),
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.dialog.confirm),
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
            screen.getByLabelText(dataTestIdInput.amount),
            '10',
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.operation.savings.submit),
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.dialog.confirm),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_withdraw_success', ['10 HIVE']),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error in HIVE withdraw', async () => {
        SavingsUtils.withdraw = jest
          .fn()
          .mockRejectedValue(new Error('Error withdraw'));
        await act(async () => {
          await userEvent.type(
            screen.getByLabelText(dataTestIdInput.amount),
            '10',
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.operation.savings.submit),
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.dialog.confirm),
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
            await screen.findByLabelText(dataTestIdDropdown.arrow.hive),
          );
          await userEvent.click(
            await screen.findByLabelText(dataTestIdDropdown.span.savings),
          );
          await userEvent.click(
            await screen.findByLabelText(
              dataTestIdDropdown.select.savings.operation.selector,
            ),
          );
          await userEvent.click(
            await screen.findByLabelText(
              dataTestIdDropdown.select.savings.operation.deposit,
            ),
          );
        });
      });

      it('Must show deposit HIVE button', async () => {
        expect(
          await screen.findByLabelText(
            dataTestIdButton.operation.savings.submit,
          ),
        ).toHaveTextContent('Deposit HIVE');
      });

      it('Must set input to max & load HIVE deposit confirmation text', async () => {
        await act(async () => {
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.setToMax),
          );
        });
        expect(
          await screen.findByLabelText(dataTestIdInput.amount),
        ).toHaveValue(hiveBalance);
        await act(async () => {
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.operation.savings.submit),
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
            screen.getByLabelText(dataTestIdInput.amount),
            String(hiveBalance + 1),
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.operation.savings.submit),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_power_up_down_error'),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error if operation fails', async () => {
        SavingsUtils.deposit = jest.fn().mockResolvedValue({
          tx_id: 'tx_id',
          id: 'id',
          confirmed: false,
        } as TransactionResult);
        await act(async () => {
          await userEvent.type(
            screen.getByLabelText(dataTestIdInput.amount),
            '10',
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.operation.savings.submit),
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.dialog.confirm),
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
            screen.getByLabelText(dataTestIdInput.amount),
            '10',
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.operation.savings.submit),
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.dialog.confirm),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_deposit_success', ['10 HIVE']),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error in HIVE desposit', async () => {
        SavingsUtils.deposit = jest
          .fn()
          .mockRejectedValue(new Error('Error deposit'));
        await act(async () => {
          await userEvent.type(
            screen.getByLabelText(dataTestIdInput.amount),
            '10',
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.operation.savings.submit),
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.dialog.confirm),
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
            await screen.findByLabelText(dataTestIdDropdown.arrow.hbd),
          );
          await userEvent.click(
            await screen.findByLabelText(dataTestIdDropdown.span.savings),
          );
          await userEvent.click(
            await screen.findByLabelText(
              dataTestIdDropdown.select.savings.operation.selector,
            ),
          );
          await userEvent.click(
            await screen.findByLabelText(
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
        await act(async () => {
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.setToMax),
          );
        });
        expect(
          await screen.findByLabelText(dataTestIdInput.amount),
        ).toHaveValue(hbdSavingsBalance);
        await act(async () => {
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.operation.savings.submit),
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
            screen.getByLabelText(dataTestIdInput.amount),
            String(hbdSavingsBalance + 1),
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.operation.savings.submit),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_power_up_down_error'),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error if operation fails', async () => {
        SavingsUtils.withdraw = jest.fn().mockResolvedValue({
          tx_id: 'tx_id',
          id: 'id',
          confirmed: false,
        } as TransactionResult);
        await act(async () => {
          await userEvent.type(
            screen.getByLabelText(dataTestIdInput.amount),
            '10',
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.operation.savings.submit),
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.dialog.confirm),
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
            screen.getByLabelText(dataTestIdInput.amount),
            '10',
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.operation.savings.submit),
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.dialog.confirm),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_withdraw_success', ['10 HBD']),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error in HBD withdraw', async () => {
        SavingsUtils.withdraw = jest
          .fn()
          .mockRejectedValue(new Error('Error withdraw HBD'));
        await act(async () => {
          await userEvent.type(
            screen.getByLabelText(dataTestIdInput.amount),
            '10',
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.operation.savings.submit),
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.dialog.confirm),
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
            await screen.findByLabelText(dataTestIdDropdown.arrow.hbd),
          );
          await userEvent.click(
            await screen.findByLabelText(dataTestIdDropdown.span.savings),
          );
          await userEvent.click(
            await screen.findByLabelText(
              dataTestIdDropdown.select.savings.operation.selector,
            ),
          );
          await userEvent.click(
            await screen.findByLabelText(
              dataTestIdDropdown.select.savings.operation.deposit,
            ),
          );
        });
      });

      it('Must show deposit HBD button', async () => {
        expect(
          await screen.findByLabelText(
            dataTestIdButton.operation.savings.submit,
          ),
        ).toHaveTextContent('Deposit HBD');
      });

      it('Must set input to max & load HBD deposit confirmation text', async () => {
        await act(async () => {
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.setToMax),
          );
        });
        expect(
          await screen.findByLabelText(dataTestIdInput.amount),
        ).toHaveValue(hbdBalance);
        await act(async () => {
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.operation.savings.submit),
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
            screen.getByLabelText(dataTestIdInput.amount),
            String(hbdBalance + 1),
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.operation.savings.submit),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_power_up_down_error'),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error if HBD operation fails', async () => {
        SavingsUtils.deposit = jest.fn().mockResolvedValue({
          tx_id: 'tx_id',
          id: 'id',
          confirmed: false,
        } as TransactionResult);
        await act(async () => {
          await userEvent.type(
            screen.getByLabelText(dataTestIdInput.amount),
            '10',
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.operation.savings.submit),
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.dialog.confirm),
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
            screen.getByLabelText(dataTestIdInput.amount),
            '10',
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.operation.savings.submit),
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.dialog.confirm),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_html_deposit_success', ['10 HBD']),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error in HBD desposit', async () => {
        SavingsUtils.deposit = jest
          .fn()
          .mockRejectedValue(new Error('Error deposit HBD'));
        await act(async () => {
          await userEvent.type(
            screen.getByLabelText(dataTestIdInput.amount),
            '10',
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.operation.savings.submit),
          );
          await userEvent.click(
            screen.getByLabelText(dataTestIdButton.dialog.confirm),
          );
        });
        expect(
          await screen.findByText('Error deposit HBD'),
        ).toBeInTheDocument();
      });
    });
  });
});
