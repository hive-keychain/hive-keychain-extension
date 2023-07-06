import { TransactionResult } from '@interfaces/hive-tx.interface';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdDropdown from 'src/__tests__/utils-for-testing/data-testid/data-testid-dropdown';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { Icons } from 'src/common-ui/icons.enum';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
import { ConversionUtils } from 'src/utils/conversion.utils';

describe('conversion.component tests:\n', () => {
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
  describe('HIVE to HBD:\n', () => {
    beforeEach(async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdDropdown.arrow.hive),
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdDropdown.itemPreFix + Icons.CONVERT),
        );
      });
    });

    it('Must show conversions page & show HIVE intro', async () => {
      expect(
        await screen.findByTestId(`${Screen.CONVERSION_PAGE}-page`),
      ).toBeInTheDocument();
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_convert_hive_intro'),
        ),
      ).toBeInTheDocument();
    });

    it('Must convert HIVE to HBD, with max value & show message', async () => {
      ConversionUtils.sendConvert = jest.fn().mockResolvedValue({
        tx_id: 'tx_id',
        id: 'id',
        confirmed: true,
      } as TransactionResult);
      await act(async () => {
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.setToMax),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.submit),
        );
      });
      expect(
        await screen.findByText(accounts.extended.balance.toString()),
      ).toBeInTheDocument();
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_confirm_hive_to_hbd_conversion'),
        ),
      ).toBeInTheDocument();
      await act(async () => {
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.dialog.confirm),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_hive_to_hbd_conversion_success'),
        ),
      ).toBeInTheDocument();
    });

    it('Must show error if HIVE convertion fails', async () => {
      ConversionUtils.sendConvert = jest.fn().mockResolvedValue({
        tx_id: 'tx_id',
        id: 'id',
        confirmed: false,
      } as TransactionResult);
      await act(async () => {
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.setToMax),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.submit),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.dialog.confirm),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_hive_to_hbd_conversion_fail'),
        ),
      ).toBeInTheDocument();
    });

    it('Must catch error and show message', async () => {
      ConversionUtils.sendConvert = jest
        .fn()
        .mockRejectedValue(new Error('Error HIVE to HBD'));
      await act(async () => {
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.setToMax),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.submit),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.dialog.confirm),
        );
      });
      expect(await screen.findByText('Error HIVE to HBD')).toBeInTheDocument();
    });
  });

  describe('HBD to HIVE:\n', () => {
    beforeEach(async () => {
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdDropdown.arrow.hbd));
        await userEvent.click(
          screen.getByTestId(dataTestIdDropdown.itemPreFix + Icons.CONVERT),
        );
      });
    });

    it('Must show conversions page & show HBD intro', async () => {
      expect(
        await screen.findByTestId(`${Screen.CONVERSION_PAGE}-page`),
      ).toBeInTheDocument();
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_convert_hbd_intro'),
        ),
      ).toBeInTheDocument();
    });

    it('Must convert HBD to HIVE, with max value & show message', async () => {
      ConversionUtils.sendConvert = jest.fn().mockResolvedValue({
        tx_id: 'tx_id',
        id: 'id',
        confirmed: true,
      } as TransactionResult);
      await act(async () => {
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.setToMax),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.submit),
        );
      });
      expect(
        await screen.findByText(accounts.extended.hbd_balance.toString()),
      ).toBeInTheDocument();
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_confirm_hbd_to_hive_conversion'),
        ),
      ).toBeInTheDocument();
      await act(async () => {
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.dialog.confirm),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_hbd_to_hive_conversion_success'),
        ),
      ).toBeInTheDocument();
    });

    it('Must show error if HBD convertion fails', async () => {
      ConversionUtils.sendConvert = jest.fn().mockResolvedValue({
        tx_id: 'tx_id',
        id: 'id',
        confirmed: false,
      } as TransactionResult);
      await act(async () => {
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.setToMax),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.submit),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.dialog.confirm),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_hbd_to_hive_conversion_fail'),
        ),
      ).toBeInTheDocument();
    });

    it('Must catch error and show message', async () => {
      ConversionUtils.sendConvert = jest
        .fn()
        .mockRejectedValue(new Error('Error HBD to HIVE'));
      await act(async () => {
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.setToMax),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.submit),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.dialog.confirm),
        );
      });
      expect(await screen.findByText('Error HBD to HIVE')).toBeInTheDocument();
    });
  });
});
