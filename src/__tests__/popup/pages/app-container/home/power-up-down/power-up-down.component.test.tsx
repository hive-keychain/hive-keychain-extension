import { TransactionResult } from '@interfaces/hive-tx.interface';
import App from '@popup/App';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelDropdown from 'src/__tests__/utils-for-testing/aria-labels/aria-label-dropdown';
import ariaLabelInput from 'src/__tests__/utils-for-testing/aria-labels/aria-label-input';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import delegations from 'src/__tests__/utils-for-testing/data/delegations';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { FavoriteUserUtils } from 'src/utils/favorite-user.utils';
import FormatUtils from 'src/utils/format.utils';
import { PowerUtils } from 'src/utils/power.utils';

describe('power-up-down.component tests:\n', () => {
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

  describe('power up:\n', () => {
    const hiveBalance = accounts.extended.balance;
    beforeEach(async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(ariaLabelDropdown.arrow.hive),
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelDropdown.span.powerUp),
        );
      });
    });

    it('Must show power up/down page & user info', async () => {
      expect(
        await screen.findByLabelText(`${Screen.POWER_UP_PAGE}-page`),
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
          screen.getByLabelText(ariaLabelInput.amount),
          '{space}',
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.operation.powerUpDown.submit),
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
          screen.getByLabelText(ariaLabelInput.amount),
          (parseFloat(hiveBalance.toString().split(' HIVE')[0]) + 1).toString(),
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.operation.powerUpDown.submit),
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
        await userEvent.click(screen.getByLabelText(ariaLabelButton.setToMax));
      });
      expect(screen.getByLabelText(ariaLabelInput.amount)).toHaveValue(
        parseFloat(hiveBalance.toString().split(' HIVE')[0]),
      );
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.operation.powerUpDown.submit),
        );
      });
      expect(
        await screen.findByLabelText(`${Screen.CONFIRMATION_PAGE}-page`),
      ).toBeInTheDocument();
    });

    it('Must show error message if power up fails', async () => {
      PowerUtils.powerUp = jest.fn().mockResolvedValue({
        tx_id: 'tx_id',
        id: 'id',
        confirmed: false,
      } as TransactionResult);
      await act(async () => {
        await userEvent.type(screen.getByLabelText(ariaLabelInput.amount), '1');
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.operation.powerUpDown.submit),
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.dialog.confirm),
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
        await userEvent.type(screen.getByLabelText(ariaLabelInput.amount), '1');
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.operation.powerUpDown.submit),
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.dialog.confirm),
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
        await userEvent.type(screen.getByLabelText(ariaLabelInput.amount), '1');
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.operation.powerUpDown.submit),
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.dialog.confirm),
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
        await userEvent.click(
          screen.getByLabelText(ariaLabelDropdown.arrow.hp),
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelDropdown.span.powerDown),
        );
      });
    });

    it('Must show power up/down page & user info', async () => {
      expect(
        await screen.findByLabelText(`${Screen.POWER_UP_PAGE}-page`),
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
          screen.getByLabelText(ariaLabelInput.amount),
          '{space}',
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.operation.powerUpDown.submit),
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
          screen.getByLabelText(ariaLabelInput.amount),
          parseFloat(hpBalance + 1).toString(),
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.operation.powerUpDown.submit),
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
        await userEvent.click(screen.getByLabelText(ariaLabelButton.setToMax));
      });
      expect(screen.getByLabelText(ariaLabelInput.amount)).toHaveValue(
        Number(hpBalance),
      );
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.operation.powerUpDown.submit),
        );
      });
      expect(
        await screen.findByLabelText(`${Screen.CONFIRMATION_PAGE}-page`),
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
          screen.getByLabelText(ariaLabelInput.amount),
          '0.01',
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.operation.powerUpDown.submit),
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.dialog.confirm),
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
          screen.getByLabelText(ariaLabelInput.amount),
          '0.01',
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.operation.powerUpDown.submit),
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.dialog.confirm),
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
          screen.getByLabelText(ariaLabelInput.amount),
          '0.01',
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.operation.powerUpDown.submit),
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.dialog.confirm),
        );
      });
      expect(await screen.findByText('Error power down')).toBeInTheDocument();
    });
  });
});
