import { hsc } from '@api/hiveEngine';
import KeychainApi from '@api/keychain';
import App from '@popup/App';
import SettingsMenuItems from '@popup/pages/app-container/settings/settings-main-page/settings-main-page-menu-items';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
//import { createEvent } from '@testing-library/user-event/dist/types/event/createEvent';
import React from 'react';
import HiveEngineUtils from 'src/utils/hive-engine.utils';
import HiveUtils from 'src/utils/hive.utils';
import ProxyUtils from 'src/utils/proxy.utils';
import BlockchainTransactionUtils from 'src/utils/tokens.utils';
import TransactionUtils from 'src/utils/transaction.utils';
import WitnessUtils from 'src/utils/witness.utils';
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
    //TODO: maybe is a good idea to keep the conditional or just evaluate if that's really needed
    // as the position of the dropdown menu will always be set by its parent(span clickeable)
    it('Must open transfer funds page when clicking on send hive', async () => {
      customRender(<App />, {
        initialState: { mk: mk, accounts: accounts } as RootState,
      });
      expect(await screen.findByText(mk)).toBeDefined();
      let dropDownMenu = screen.getByLabelText(
        al.dropdown.arrow.hive,
      ) as HTMLImageElement;
      await act(async () => {
        await userEventPendingTimers.click(dropDownMenu);
      });
      let sendButton = screen.getByLabelText(al.dropdown.span.send);
      await act(async () => {
        await userEventPendingTimers.click(sendButton);
      });
      expect(
        screen.getByLabelText(al.component.transfersFundsPage),
      ).toBeDefined();
    });
    it('Must open power up page when clicking on power up', async () => {
      HiveUtils.getClient().database.getVestingDelegations = jest
        .fn()
        .mockResolvedValue(utilsT.fakeGetDelegateesResponse);
      customRender(<App />, {
        initialState: { mk: mk, accounts: accounts } as RootState,
      });
      expect(await screen.findByText(mk)).toBeDefined();
      let dropDownMenu = screen.getByLabelText(
        al.dropdown.arrow.hive,
      ) as HTMLImageElement;
      await act(async () => {
        await userEventPendingTimers.click(dropDownMenu);
      });
      let powerUpButton = screen.getByLabelText(al.dropdown.span.powerUp);
      await act(async () => {
        await userEventPendingTimers.click(powerUpButton);
      });
      expect(screen.getByLabelText(al.component.powerUpDownPage)).toBeDefined();
    });
    it('Must load buy HIVE options when clicking on buy', async () => {
      customRender(<App />, {
        initialState: { mk: mk, accounts: accounts } as RootState,
      });
      expect(await screen.findByText(mk)).toBeDefined();
      let dropDownMenu = screen.getByLabelText(
        al.dropdown.arrow.hive,
      ) as HTMLImageElement;
      await act(async () => {
        await userEventPendingTimers.click(dropDownMenu);
      });
      let buyButton = screen.getByLabelText(al.dropdown.span.buy);
      await act(async () => {
        await userEventPendingTimers.click(buyButton);
      });
      expect(screen.getByLabelText(al.component.buyCoinsPage)).toBeDefined();
    });
    it.todo('Must show convert page when clicking convert');
    it.todo('Must show hive savings page when clicking on saving');
  });
  describe.skip('dropdown arrow menu on hbd tests:\n', () => {
    it.todo('Must open transfer funds page when clicking on send hbd');
    it.todo('Must load buy HBD options when clicking on buy');
    it.todo('Must show convert page when clicking convert');
    it.todo('Must show hbd savings page when clicking savings');
  });
  describe.skip('dropdown arrow menu on hp tests:\n', () => {
    it.todo('Must show delegations page when clicking convert');
    it.todo('Must show power down page when clicking power down');
  });
  describe('action buttons menu tests:\n', () => {
    beforeEach(async () => {
      customRender(<App />, {
        initialState: { mk: mk, accounts: accounts } as RootState,
      });
      expect(await screen.findByText(mk)).toBeDefined();
    });
    it('Must open transfer funds page when clicking on send', async () => {
      let actionButtonSend = screen.getByLabelText(al.button.actionBtn.send);
      await act(async () => {
        await userEventPendingTimers.click(actionButtonSend);
      });
      expect(
        screen.getByLabelText(al.component.transfersFundsPage),
      ).toBeDefined();
    });
    it('Must show wallet history when clicking on history', async () => {
      let actionButtonHistory = screen.getByLabelText(
        al.button.actionBtn.history,
      );
      TransactionUtils.getAccountTransactions = jest
        .fn()
        .mockResolvedValue(utilsT.expectedDataGetAccountHistory);
      await act(async () => {
        await userEventPendingTimers.click(actionButtonHistory);
        jest.runAllTimers();
      });
      expect(
        await screen.findByLabelText(al.component.walletItemList),
      ).toBeDefined();
    });
    it('Must show tokens page when clicking on tokens', async () => {
      let actionButtonTokens = screen.getByLabelText(
        al.button.actionBtn.tokens,
      );
      hsc.find = jest.fn().mockResolvedValue(utilsT.fakeTokensResponse);
      HiveEngineUtils.getUserBalance = jest
        .fn()
        .mockResolvedValue(utilsT.fakeGetUserBalanceResponse);
      await act(async () => {
        await userEventPendingTimers.click(actionButtonTokens);
        jest.runAllTimers();
      });
      expect(
        await screen.findByLabelText(al.component.userTokens),
      ).toBeDefined();
    });
    it('Must show governance page when clicking on governance', async () => {
      let actionButtonGovernance = screen.getByLabelText(
        al.button.actionBtn.governance,
      );
      KeychainApi.get = jest
        .fn()
        .mockResolvedValue(utilsT.fakeWitnessesRankingResponse);
      ProxyUtils.findUserProxy = jest.fn();
      WitnessUtils.unvoteWitness = jest.fn();
      BlockchainTransactionUtils.delayRefresh = jest.fn();
      await act(async () => {
        await userEventPendingTimers.click(actionButtonGovernance);
        jest.runAllTimers();
      });
      expect(
        await screen.findByLabelText(al.component.governancePage),
      ).toBeDefined();
    });
  });
});
