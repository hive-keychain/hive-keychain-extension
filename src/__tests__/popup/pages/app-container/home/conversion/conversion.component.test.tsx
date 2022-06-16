import App from '@popup/App';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import React from 'react';
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

beforeEach(() => {
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
});
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  cleanup();
});

describe('conversion.component tests:\n', () => {
  describe('HIVE to HBD:\n', () => {
    it('Must show error if wrong requested value', async () => {
      customRender(<App />, {
        initialState: { mk: mk, accounts: accounts } as RootState,
      });
      expect(await screen.findByText(mk)).toBeDefined();
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
  });
});

//handleButtonClick
// Types of convertions:
// 1. CONVERT_HBD_TO_HIVE
// cases:
// - asked value is greater than available:
//      Must show error if not enough HBD (popup_html_power_up_down_error)
// - Succesful case as onSetToMaxClicked={setToMax}
// - Successful HBD2HIVE convertion case 1, adding the amount:
//      - Load confirmation page with the data.
//      - mock HiveUtils.convertOperation as succesfull => true.
//      - after success will navigate to HOME_PAGE
//      - setSuccessMessage as (popup_html_hbd_to_hive_conversion_success)
// - Failed HBD2HIVE convertion:
//      - Load confirmation page with the data.
//      - mock HiveUtils.convertOperation as failed => false.
//      - after failing will stay on actual page, i think
//      - setErrorMessage as (popup_html_hbd_to_hive_conversion_fail)
// 2. CONVERT_HIVE_TO_HBD
// cases:
//  - ideam as previous but using hive2hbd.
