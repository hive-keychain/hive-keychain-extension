import { ConversionUtils } from '@hiveapp/utils/conversion.utils';
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

// Mock network requests
global.fetch = jest.fn((url: string) => {
  // Mock Hive Engine API calls
  if (url.includes('hive-engine') || url.includes('api.hive-engine')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ result: [] }),
    } as Response);
  }
  // Mock PeakD notifications API
  if (url.includes('notifications') || url.includes('peakd')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    } as Response);
  }
  // Mock other API calls
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ result: [] }),
  } as Response);
}) as jest.Mock;

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
    // Wait for home page to be rendered
    await screen.findByTestId(`${Screen.HOME_PAGE}-page`, {}, { timeout: 10000 });
    // Wait a bit more for wallet info section to be ready
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
  });
  describe('HIVE to HBD:\n', () => {
    beforeEach(async () => {
      await act(async () => {
        // Find all wallet info section rows
        const walletRows = await screen.findAllByTestId('wallet-info-section-row');
        // Click on the first row (HIVE) to expand it
        await userEvent.click(walletRows[0]);
        // Wait for dropdown to expand and action buttons to appear
        await new Promise((resolve) => setTimeout(resolve, 300));
        // Find the convert button by its label text
        const convertButtons = document.querySelectorAll('.wallet-action-button');
        let convertButton: HTMLElement | null = null;
        for (const button of Array.from(convertButtons)) {
          const title = button.querySelector('.title');
          if (title && title.textContent === chrome.i18n.getMessage('popup_html_convert')) {
            convertButton = button as HTMLElement;
            break;
          }
        }
        if (convertButton) {
          await userEvent.click(convertButton);
          // Wait for navigation to complete
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
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
      // Wait for conversion page to be fully rendered
      await screen.findByTestId(`${Screen.CONVERSION_PAGE}-page`, {}, { timeout: 5000 });
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        await userEvent.click(
          await screen.findByTestId('right-action', {}, { timeout: 5000 }),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.submit, {}, { timeout: 5000 }),
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
      // Wait for conversion page to be fully rendered
      await screen.findByTestId(`${Screen.CONVERSION_PAGE}-page`, {}, { timeout: 5000 });
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        await userEvent.click(
          await screen.findByTestId('right-action', {}, { timeout: 5000 }),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.submit, {}, { timeout: 5000 }),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.dialog.confirm, {}, { timeout: 5000 }),
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
      // Wait for conversion page to be fully rendered
      await screen.findByTestId(`${Screen.CONVERSION_PAGE}-page`, {}, { timeout: 5000 });
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        await userEvent.click(
          await screen.findByTestId('right-action', {}, { timeout: 5000 }),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.submit, {}, { timeout: 5000 }),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.dialog.confirm, {}, { timeout: 5000 }),
        );
      });
      expect(await screen.findByText('Error HIVE to HBD')).toBeInTheDocument();
    });
  });

  describe('HBD to HIVE:\n', () => {
    beforeEach(async () => {
      await act(async () => {
        // Find all wallet info section rows
        const walletRows = await screen.findAllByTestId('wallet-info-section-row');
        // Click on the second row (HBD) to expand it
        await userEvent.click(walletRows[1]);
        // Wait for dropdown to expand and action buttons to appear
        await new Promise((resolve) => setTimeout(resolve, 300));
        // Find the convert button by its label text
        const convertButtons = document.querySelectorAll('.wallet-action-button');
        let convertButton: HTMLElement | null = null;
        for (const button of Array.from(convertButtons)) {
          const title = button.querySelector('.title');
          if (title && title.textContent === chrome.i18n.getMessage('popup_html_convert')) {
            convertButton = button as HTMLElement;
            break;
          }
        }
        if (convertButton) {
          await userEvent.click(convertButton);
          // Wait for navigation to complete
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
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
      // Wait for conversion page to be fully rendered
      await screen.findByTestId(`${Screen.CONVERSION_PAGE}-page`, {}, { timeout: 5000 });
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        await userEvent.click(
          await screen.findByTestId('right-action', {}, { timeout: 5000 }),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.submit, {}, { timeout: 5000 }),
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
      // Wait for conversion page to be fully rendered
      await screen.findByTestId(`${Screen.CONVERSION_PAGE}-page`, {}, { timeout: 5000 });
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        await userEvent.click(
          await screen.findByTestId('right-action', {}, { timeout: 5000 }),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.submit, {}, { timeout: 5000 }),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.dialog.confirm, {}, { timeout: 5000 }),
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
      // Wait for conversion page to be fully rendered
      await screen.findByTestId(`${Screen.CONVERSION_PAGE}-page`, {}, { timeout: 5000 });
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        await userEvent.click(
          await screen.findByTestId('right-action', {}, { timeout: 5000 }),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.submit, {}, { timeout: 5000 }),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.dialog.confirm, {}, { timeout: 5000 }),
        );
      });
      expect(await screen.findByText('Error HBD to HIVE')).toBeInTheDocument();
    });
  });
});
