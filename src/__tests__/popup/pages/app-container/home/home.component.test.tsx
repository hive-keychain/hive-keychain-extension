import App from '@popup/App';
import SettingsMenuItems from '@popup/pages/app-container/settings/settings-main-page/settings-main-page-menu-items';
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
    getAccountsFromLocalStorage: fakeData.accounts.twoAccounts,
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
});
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  cleanup();
});
describe('home.component tests:\n', () => {
  it('Must load the homepage and display active username', async () => {
    customRender(<App />, {
      initialState: { mk: mk, accounts: accounts } as RootState,
    });
    expect(await screen.findByText(mk)).toBeDefined();
    expect(screen.getByLabelText(al.component.homePage));
  });
  it('Must change active account to the selected one', async () => {
    customRender(<App />, {
      initialState: { mk: mk, accounts: accounts } as RootState,
    });
    expect(await screen.findByText(mk)).toBeDefined();
    const dropdownSelect = screen.getByLabelText(al.select.accountSelector);
    await act(async () => {
      await userEventPendingTimers.click(dropdownSelect);
    });
    const divAccount = screen.getByText(utilsT.userData2.username);
    await act(async () => {
      await userEventPendingTimers.click(divAccount);
    });
    expect(screen.getByLabelText(al.div.selectedAccount));
    const previousUserDiv = screen.queryByText(mk);
    expect(previousUserDiv).not.toBeInTheDocument();
    expect(screen.getByText(utilsT.userData2.username)).toBeDefined();
  });
  it('Must refresh data when click on logo', async () => {
    customRender(<App />, {
      initialState: { mk: mk, accounts: accounts } as RootState,
    });
    const imageRefresh = await screen.findByLabelText(al.icon.refreshHome);
    //reMocks
    HiveUtils.getClient().database.getAccounts = jest
      .fn()
      .mockResolvedValue(fakeData.accounts.extendedAccountMinVariant);
    HiveUtils.getClient().rc.getRCMana = jest
      .fn()
      .mockResolvedValue(fakeData.manabar.manabarMinVariant);
    const updatedAccountValue = '80000';
    mocks.mocksHome({
      getPrices: fakeData.prices,
      getAccountValue: updatedAccountValue,
    });
    //end reMocks
    await act(async () => {
      await userEventPendingTimers.click(imageRefresh);
      jest.advanceTimersByTime(4300);
    });
    expect(await screen.findByText('8,000.000')).toBeDefined();
    expect(
      await screen.findByText(`$ ${updatedAccountValue} USD`),
    ).toBeDefined();
  });
  it('Must log out user when clicking on log out', async () => {
    customRender(<App />, {
      initialState: { mk: mk, accounts: accounts } as RootState,
    });
    const selectedAccountDiv = await screen.findByLabelText(
      al.div.selectedAccount,
    );
    expect(selectedAccountDiv).toBeDefined();
    const logOutButton = screen.getByLabelText(al.button.logOut);
    await act(async () => {
      await userEventPendingTimers.click(logOutButton);
    });
    expect(screen.queryByLabelText(al.button.logOut)).not.toBeInTheDocument();
    expect(screen.getByLabelText(al.button.login)).toBeDefined();
  });
  it('Must show menu settings', async () => {
    customRender(<App />, {
      initialState: { mk: mk, accounts: accounts } as RootState,
    });
    expect(await screen.findByText(mk)).toBeDefined();
    const menuSettings = screen.getByLabelText('clickable-settings');
    await act(async () => {
      await userEventPendingTimers.click(menuSettings);
    });
    const settingsMenu = SettingsMenuItems;
    const menuItemsRendered = screen.getAllByLabelText(
      /menu-settings-button-/i,
    );
    expect(menuItemsRendered.length).toBe(settingsMenu.length);
    settingsMenu.forEach((item) => {
      expect(
        screen.queryByLabelText(`menu-settings-button-${item.icon}`),
      ).toBeInTheDocument();
    });
  });
  describe('dropdown arrow menu on hive tests:\n', () => {
    it.skip('Must open transfer funds page when clicking on send hive', async () => {
      customRender(<App />, {
        initialState: { mk: mk, accounts: accounts } as RootState,
      });
      expect(await screen.findByText(mk)).toBeDefined();
      const dropDownMenu = screen.getByLabelText(al.dropdown.arrow.hive);
      await act(async () => {
        await userEventPendingTimers.click(dropDownMenu);
      });
      expect(screen.getByText('yolo')).toBeDefined();
    });
    it.todo('Must open power up page when clicking on power up');
    it.todo('Must load buy HIVE options when clicking on buy');
    it.todo('Must show convert page when clicking convert');
    it.todo('Must show hive savings page when clicking on saving');
  });
  describe('dropdown arrow menu on hbd tests:\n', () => {
    it.todo('Must open transfer funds page when clicking on send hbd');
    it.todo('Must load buy HBD options when clicking on buy');
    it.todo('Must show convert page when clicking convert');
    it.todo('Must show hbd savings page when clicking savings');
  });
  describe('dropdown arrow menu on hp tests:\n', () => {
    it.todo('Must show delegations page when clicking convert');
    it.todo('Must show power down page when clicking power down');
  });
  describe('action buttons menu tests:\n', () => {
    it.todo('Must open transfer funds page when clicking on send');
    it.todo('Must show wallet history when clicking on history');
    it.todo('Must show tokens page when clicking on tokens');
    it.todo('Must show governance page when clicking on governance');
  });
});
