import { FavoriteUserUtils } from '@hiveapp/utils/favorite-user.utils';
import { PowerUtils } from '@hiveapp/utils/power.utils';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormatUtils } from 'hive-keychain-commons';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdDropdown from 'src/__tests__/utils-for-testing/data-testid/data-testid-dropdown';
import dataTestIdInput from 'src/__tests__/utils-for-testing/data-testid/data-testid-input';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import delegations from 'src/__tests__/utils-for-testing/data/delegations';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';

describe('power-up-down.component tests:\n', () => {
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

  describe('power up:\n', () => {
    const hiveBalance = accounts.extended.balance;
    beforeEach(async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdDropdown.arrow.hive),
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdDropdown.span.powerUp),
        );
      });
    });

    it('Must show power up/down page & user info', async () => {
      expect(
        await screen.findByTestId(`${Screen.POWER_UP_PAGE}-page`),
      ).toBeInTheDocument();
      expect(
        await screen.findByText(
          `${FormatUtils.formatCurrencyValue(hiveBalance)} HIVE`,
        ),
      ).toBeInTheDocument();
    });

    it('Must show error if empty input', async () => {
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.amount),
          '{space}',
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.powerUpDown.submit),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_fill_form_error'),
        ),
      ).toBeInTheDocument();
    });

    it('Must show error if not enough balance', async () => {
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.amount),
          (parseFloat(hiveBalance.toString().split(' HIVE')[0]) + 1).toString(),
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.powerUpDown.submit),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_power_up_down_error'),
        ),
      ).toBeInTheDocument();
    });

    it('Must set value to  max & show confirmation page', async () => {
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdButton.setToMax));
      });
      expect(screen.getByTestId(dataTestIdInput.amount)).toHaveValue(
        parseFloat(hiveBalance.toString().split(' HIVE')[0]),
      );
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.powerUpDown.submit),
        );
      });
      expect(
        await screen.findByTestId(`${Screen.CONFIRMATION_PAGE}-page`),
      ).toBeInTheDocument();
    });

    it('Must show error message if power up fails', async () => {
      PowerUtils.powerUp = jest.fn().mockResolvedValue({
        tx_id: 'tx_id',
        id: 'id',
        confirmed: false,
      } as TransactionResult);
      await act(async () => {
        await userEvent.type(screen.getByTestId(dataTestIdInput.amount), '1');
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.powerUpDown.submit),
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.dialog.confirm),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_power_up_down_fail', [
            chrome.i18n.getMessage('popup_html_pu'),
          ]),
        ),
      ).toBeInTheDocument();
    });

    it('Must show success message after power up', async () => {
      PowerUtils.powerUp = jest.fn().mockResolvedValue({
        tx_id: 'tx_id',
        id: 'id',
        confirmed: true,
      } as TransactionResult);
      FavoriteUserUtils.saveFavoriteUser = jest.fn();
      await act(async () => {
        await userEvent.type(screen.getByTestId(dataTestIdInput.amount), '1');
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.powerUpDown.submit),
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.dialog.confirm),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_power_up_down_success', [
            chrome.i18n.getMessage('popup_html_pu'),
          ]),
        ),
      ).toBeInTheDocument();
    });

    it('Must catch and show error on power up', async () => {
      PowerUtils.powerUp = jest
        .fn()
        .mockRejectedValue(new Error('Error power up'));
      await act(async () => {
        await userEvent.type(screen.getByTestId(dataTestIdInput.amount), '1');
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.powerUpDown.submit),
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.dialog.confirm),
        );
      });
      expect(await screen.findByText('Error power up')).toBeInTheDocument();
    });
  });

  describe('power down:\n', () => {
    let totalOutgoingVestingShares = 0;
    for (const delegation of delegations.delegatees) {
      totalOutgoingVestingShares += parseFloat(
        delegation.vesting_shares.toString().split(' ')[0],
      );
    }
    let hpBalance = (
      FormatUtils.toHP(
        (
          parseFloat(
            accounts.extended.vesting_shares.toString().replace('VESTS', ''),
          ) - totalOutgoingVestingShares
        ).toString(),
        dynamic.globalProperties,
      ) - 5
    ).toFixed(3);
    beforeEach(async () => {
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdDropdown.arrow.hp));
        await userEvent.click(
          screen.getByTestId(dataTestIdDropdown.span.powerDown),
        );
      });
    });

    it('Must show power up/down page & user info', async () => {
      expect(
        await screen.findByTestId(`${Screen.POWER_UP_PAGE}-page`),
      ).toBeInTheDocument();
      expect(
        await screen.findByText(
          `${FormatUtils.formatCurrencyValue(hpBalance)} HP`,
        ),
      ).toBeInTheDocument();
    });

    it('Must show error if empty input', async () => {
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.amount),
          '{space}',
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.powerUpDown.submit),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_fill_form_error'),
        ),
      ).toBeInTheDocument();
    });

    it('Must show error if not enough balance', async () => {
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.amount),
          parseFloat(hpBalance + 1).toString(),
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.powerUpDown.submit),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_power_up_down_error'),
        ),
      ).toBeInTheDocument();
    });

    it('Must set value to  max & show confirmation page', async () => {
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdButton.setToMax));
      });
      expect(screen.getByTestId(dataTestIdInput.amount)).toHaveValue(
        Number(hpBalance),
      );
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.powerUpDown.submit),
        );
      });
      expect(
        await screen.findByTestId(`${Screen.CONFIRMATION_PAGE}-page`),
      ).toBeInTheDocument();
    });

    it('Must show error message if power down fails', async () => {
      PowerUtils.powerDown = jest.fn().mockResolvedValue({
        tx_id: 'tx_id',
        id: 'id',
        confirmed: false,
      } as TransactionResult);
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.amount),
          '0.01',
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.powerUpDown.submit),
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.dialog.confirm),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_power_up_down_fail', [
            chrome.i18n.getMessage('popup_html_pd'),
          ]),
        ),
      ).toBeInTheDocument();
    });

    it('Must show success message after power down', async () => {
      PowerUtils.powerDown = jest.fn().mockResolvedValue({
        tx_id: 'tx_id',
        id: 'id',
        confirmed: true,
      } as TransactionResult);
      FavoriteUserUtils.saveFavoriteUser = jest.fn();
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.amount),
          '0.01',
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.powerUpDown.submit),
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.dialog.confirm),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_power_up_down_success', [
            chrome.i18n.getMessage('popup_html_pd'),
          ]),
        ),
      ).toBeInTheDocument();
    });

    it('Must catch and show error on power down', async () => {
      PowerUtils.powerDown = jest
        .fn()
        .mockRejectedValue(new Error('Error power down'));
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.amount),
          '0.01',
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.powerUpDown.submit),
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.dialog.confirm),
        );
      });
      expect(await screen.findByText('Error power down')).toBeInTheDocument();
    });
  });
});
