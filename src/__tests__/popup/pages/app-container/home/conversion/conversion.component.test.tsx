import App from '@popup/App';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import React from 'react';
import HiveUtils from 'src/utils/hive.utils';
import al from 'src/__tests__/utils-for-testing/end-to-end-aria-labels';
import fakeData from 'src/__tests__/utils-for-testing/end-to-end-data';
import { userEventPendingTimers } from 'src/__tests__/utils-for-testing/end-to-end-events';
import mocks from 'src/__tests__/utils-for-testing/end-to-end-mocks';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import { customRender } from 'src/__tests__/utils-for-testing/renderSetUp';

const chrome = require('chrome-mock');
global.chrome = chrome;
jest.setTimeout(10000);
const mk = fakeData.mk.userData1;
const accounts = fakeData.accounts.twoAccounts;

beforeEach(async () => {
  jest.useFakeTimers('legacy');
  act(() => {
    jest.advanceTimersByTime(4300);
  });
  mocks.mocksApp({
    fixPopupOnMacOs: jest.fn(),
    getValueFromLocalStorage: jest
      .fn()
      .mockImplementation(mocks.getValuefromLS),
    getCurrentRpc: fakeData.rpc.fake,
    activeAccountUsername: mk,
    getRCMana: fakeData.manabar.manabarMin,
    getAccounts: fakeData.accounts.extendedAccountFull,
    rpcStatus: true,
    setRpc: jest.fn(),
    chromeSendMessage: jest.fn(),
    hasStoredAccounts: true,
    mkLocal: mk,
    getAccountsFromLocalStorage: accounts,
    hasVotedForProposal: true,
    voteForKeychainProposal: jest.fn(),
    chromeTabsCreate: jest.fn(),
    i18nGetMessage: jest.fn().mockImplementation(mocks.i18nGetMessage),
    saveValueInLocalStorage: jest.fn(),
    clearLocalStorage: jest.fn(),
    removeFromLocalStorage: jest.fn(),
  });
  mocks.mocksHome({
    getPrices: fakeData.prices,
    getAccountValue: '100000',
  });
  mocks.mocksTopBar({
    hasReward: false,
  });
  mocks.mocksPowerUp({
    getVestingDelegations: jest
      .fn()
      .mockResolvedValue(utilsT.fakeGetDelegateesResponse),
  });
  mocks.mocksDelegations({
    getDelegators: jest.fn().mockResolvedValue({
      data: utilsT.fakeGetDelegatorsResponse,
    }),
  });
  mocks.mocksWalletHistory({
    getAccountTransactions: jest
      .fn()
      .mockResolvedValue(utilsT.expectedDataGetAccountHistory),
  });
  mocks.mocksTokens({
    getAllTokens: jest.fn().mockResolvedValue(utilsT.fakeTokensResponse),
    getUserBalance: jest
      .fn()
      .mockResolvedValue(utilsT.fakeGetUserBalanceResponse),
  });
  customRender(<App />, {
    initialState: { mk: mk, accounts: accounts } as RootState,
  });
  expect(await screen.findByText(mk)).toBeDefined();
});
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  cleanup();
});

describe('conversion.component tests:\n', () => {
  describe('HIVE to HBD:\n', () => {
    beforeEach(async () => {
      await act(async () => {
        await userEventPendingTimers.click(
          screen.getByLabelText(al.dropdown.arrow.hive),
        );
      });
      await act(async () => {
        await userEventPendingTimers.click(
          screen.getByLabelText(al.dropdown.span.convert),
        );
      });
    });
    it('Must show error if wrong requested value', async () => {
      await act(async () => {
        await userEventPendingTimers.type(
          screen.getByLabelText(al.input.amount),
          '2000',
        );
      });
      await act(async () => {
        await userEventPendingTimers.click(
          screen.getByLabelText(al.button.submit),
        );
        jest.runAllTimers();
      });
      expect(
        screen.getByText(fakeData.messages.error.greaterThan),
      ).toBeInTheDocument();
    });
    it('Must show confirmation page and after cancel go back', async () => {
      await act(async () => {
        await userEventPendingTimers.type(
          screen.getByLabelText(al.input.amount),
          '500',
        );
      });
      await act(async () => {
        await userEventPendingTimers.click(
          screen.getByLabelText(al.button.submit),
        );
        jest.runAllTimers();
      });
      expect(
        screen.getByLabelText(al.component.confirmationPage),
      ).toBeInTheDocument();
      await act(async () => {
        await userEventPendingTimers.click(
          screen.getByLabelText(al.button.dialog.cancel),
        );
      });
      expect(
        screen.getByLabelText(al.component.conversionPage),
      ).toBeInTheDocument();
    });
    it('Must navigate to home page after successful conversion and show message', async () => {
      await act(async () => {
        await userEventPendingTimers.type(
          screen.getByLabelText(al.input.amount),
          '500',
        );
      });
      await act(async () => {
        await userEventPendingTimers.click(
          screen.getByLabelText(al.button.submit),
        );
        jest.runAllTimers();
      });
      expect(
        screen.getByLabelText(al.component.confirmationPage),
      ).toBeInTheDocument();
      HiveUtils.convertOperation = jest.fn().mockResolvedValue(true);
      await act(async () => {
        await userEventPendingTimers.click(
          screen.getByLabelText(al.button.dialog.confirm),
        );
        jest.runAllTimers();
      });
      expect(screen.getByLabelText(al.component.homePage)).toBeInTheDocument();
      expect(
        screen.getByText(fakeData.messages.success.convertion.hive),
      ).toBeInTheDocument();
    });
    it('Must set convertion value to max when pressing to max button', async () => {
      const amountInputDefault = screen.getByLabelText(
        al.input.amount,
      ) as HTMLInputElement;
      expect(amountInputDefault.value).toBe('0');
      await act(async () => {
        await userEventPendingTimers.click(
          screen.getByLabelText(al.button.setToMax),
        );
      });
      const amountInput = (await screen.findByLabelText(
        al.input.amount,
      )) as HTMLInputElement;
      expect(amountInput.value).toBe('1000');
    });
    it('Must show error if convertion fails', async () => {
      await act(async () => {
        await userEventPendingTimers.type(
          screen.getByLabelText(al.input.amount),
          '500',
        );
      });
      await act(async () => {
        await userEventPendingTimers.click(
          screen.getByLabelText(al.button.submit),
        );
        jest.runAllTimers();
      });
      expect(
        screen.getByLabelText(al.component.confirmationPage),
      ).toBeInTheDocument();
      HiveUtils.convertOperation = jest.fn().mockResolvedValue(false);
      await act(async () => {
        await userEventPendingTimers.click(
          screen.getByLabelText(al.button.dialog.confirm),
        );
        jest.runAllTimers();
      });
      expect(
        screen.getByText(fakeData.messages.error.conversion.hive),
      ).toBeInTheDocument();
    });
  });
  describe('HBD to HIVE:\n', () => {
    beforeEach(async () => {
      await act(async () => {
        await userEventPendingTimers.click(
          screen.getByLabelText(al.dropdown.arrow.hbd),
        );
      });
      await act(async () => {
        await userEventPendingTimers.click(
          screen.getByLabelText(al.dropdown.span.convert),
        );
      });
    });
    it('Must show error if wrong requested value', async () => {
      await act(async () => {
        await userEventPendingTimers.type(
          screen.getByLabelText(al.input.amount),
          '2000',
        );
      });
      await act(async () => {
        await userEventPendingTimers.click(
          screen.getByLabelText(al.button.submit),
        );
        jest.runAllTimers();
      });
      expect(
        screen.getByText(fakeData.messages.error.greaterThan),
      ).toBeInTheDocument();
    });
    it('Must show confirmation page and after cancel go back', async () => {
      await act(async () => {
        await userEventPendingTimers.type(
          screen.getByLabelText(al.input.amount),
          '500',
        );
      });
      await act(async () => {
        await userEventPendingTimers.click(
          screen.getByLabelText(al.button.submit),
        );
        jest.runAllTimers();
      });
      expect(
        screen.getByLabelText(al.component.confirmationPage),
      ).toBeInTheDocument();
      await act(async () => {
        await userEventPendingTimers.click(
          screen.getByLabelText(al.button.dialog.cancel),
        );
      });
      expect(
        screen.getByLabelText(al.component.conversionPage),
      ).toBeInTheDocument();
    });
    it('Must navigate to home page after successful conversion and show message', async () => {
      await act(async () => {
        await userEventPendingTimers.type(
          screen.getByLabelText(al.input.amount),
          '500',
        );
      });
      await act(async () => {
        await userEventPendingTimers.click(
          screen.getByLabelText(al.button.submit),
        );
        jest.runAllTimers();
      });
      expect(
        screen.getByLabelText(al.component.confirmationPage),
      ).toBeInTheDocument();
      HiveUtils.convertOperation = jest.fn().mockResolvedValue(true);
      await act(async () => {
        await userEventPendingTimers.click(
          screen.getByLabelText(al.button.dialog.confirm),
        );
        jest.runAllTimers();
      });
      expect(screen.getByLabelText(al.component.homePage)).toBeInTheDocument();
      expect(
        screen.getByText(fakeData.messages.success.convertion.hbd),
      ).toBeInTheDocument();
    });
    it('Must set convertion value to max when pressing to max button', async () => {
      const amountInputDefault = screen.getByLabelText(
        al.input.amount,
      ) as HTMLInputElement;
      expect(amountInputDefault.value).toBe('0');
      await act(async () => {
        await userEventPendingTimers.click(
          screen.getByLabelText(al.button.setToMax),
        );
      });
      const amountInput = (await screen.findByLabelText(
        al.input.amount,
      )) as HTMLInputElement;
      expect(amountInput.value).toBe('1000');
    });
    it('Must show error if convertion fails', async () => {
      await act(async () => {
        await userEventPendingTimers.type(
          screen.getByLabelText(al.input.amount),
          '500',
        );
      });
      await act(async () => {
        await userEventPendingTimers.click(
          screen.getByLabelText(al.button.submit),
        );
        jest.runAllTimers();
      });
      expect(
        screen.getByLabelText(al.component.confirmationPage),
      ).toBeInTheDocument();
      HiveUtils.convertOperation = jest.fn().mockResolvedValue(false);
      await act(async () => {
        await userEventPendingTimers.click(
          screen.getByLabelText(al.button.dialog.confirm),
        );
        jest.runAllTimers();
      });
      expect(
        screen.getByText(fakeData.messages.error.conversion.hbd),
      ).toBeInTheDocument();
    });
  });
});
