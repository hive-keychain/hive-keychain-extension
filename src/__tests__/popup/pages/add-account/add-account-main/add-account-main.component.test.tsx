import App from '@popup/App';
import { act, cleanup, screen, waitFor } from '@testing-library/react';
import React from 'react';
import AccountUtils from 'src/utils/account.utils';
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

describe('add-account-main.component tests:\n', () => {
  const mk = fakeData.mk.userData1;
  const rpc = fakeData.rpc.fake;
  const accounts = fakeData.accounts.twoAccounts;

  beforeEach(() => {
    mocks.mocksApp({
      fixPopupOnMacOs: jest.fn(),
      getValueFromLocalStorage: jest
        .fn()
        .mockImplementation(mocks.getValuefromLS),
      getCurrentRpc: rpc,
      activeAccountUsername: mk,
      getRCMana: fakeData.manabar.manabarMin,
      getAccounts: fakeData.accounts.extendedAccountFull,
      rpcStatus: true,
      setRpc: jest.fn(),
      chromeSendMessage: jest.fn(),
      hasStoredAccounts: false,
      mkLocal: mk,
      getAccountsFromLocalStorage: accounts,
      hasVotedForProposal: false,
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
    jest.useFakeTimers('legacy');
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    cleanup();
  });
  describe('add-by-keys tests:\n', () => {
    it('Must add valid posting key and load homepage', async () => {
      customRender(<App />, {
        initialState: { mk: mk, accounts: [], activeRpc: rpc } as RootState,
      });
      await act(async () => {
        jest.runOnlyPendingTimers();
      });
      const addByKeysButton = await screen.findByLabelText(al.button.addByKeys);
      expect(addByKeysButton).toBeDefined();
      await act(async () => {
        await userEventPendingTimers.click(addByKeysButton);
      });
      const inputUsername = screen.getByLabelText(al.input.username);
      const inputPrivateKey = screen.getByLabelText(al.input.privateKey);
      const submitButton = screen.getByLabelText(al.button.submit);
      await act(async () => {
        await userEventPendingTimers.type(inputUsername, mk);
        await userEventPendingTimers.type(
          inputPrivateKey,
          utilsT.userData.nonEncryptKeys.posting,
        );
        await userEventPendingTimers.click(submitButton);
      });
      await act(async () => {
        jest.runOnlyPendingTimers();
      });
      await waitFor(() => {
        expect(screen.getByLabelText(al.component.homePage)).toBeDefined();
        expect(screen.getByText(mk)).toBeDefined();
      });
    });
    it('Must add valid memo key and load homepage', async () => {
      customRender(<App />, {
        initialState: { mk: mk, accounts: [], activeRpc: rpc } as RootState,
      });
      await act(async () => {
        jest.runOnlyPendingTimers();
      });
      const addByKeysButton = await screen.findByLabelText(al.button.addByKeys);
      expect(addByKeysButton).toBeDefined();
      await act(async () => {
        await userEventPendingTimers.click(addByKeysButton);
      });
      const inputUsername = screen.getByLabelText(al.input.username);
      const inputPrivateKey = screen.getByLabelText(al.input.privateKey);
      const submitButton = screen.getByLabelText(al.button.submit);
      await act(async () => {
        await userEventPendingTimers.type(inputUsername, mk);
        await userEventPendingTimers.type(
          inputPrivateKey,
          utilsT.userData.nonEncryptKeys.memo,
        );
        await userEventPendingTimers.click(submitButton);
      });
      await act(async () => {
        jest.runOnlyPendingTimers();
      });
      await waitFor(() => {
        expect(screen.getByLabelText(al.component.homePage)).toBeDefined();
        expect(screen.getByText(mk)).toBeDefined();
      });
    });
    it('Must add valid active key and load homepage', async () => {
      customRender(<App />, {
        initialState: { mk: mk, accounts: [], activeRpc: rpc } as RootState,
      });
      await act(async () => {
        jest.runOnlyPendingTimers();
      });
      const addByKeysButton = await screen.findByLabelText(al.button.addByKeys);
      expect(addByKeysButton).toBeDefined();
      await act(async () => {
        await userEventPendingTimers.click(addByKeysButton);
      });
      const inputUsername = screen.getByLabelText(al.input.username);
      const inputPrivateKey = screen.getByLabelText(al.input.privateKey);
      const submitButton = screen.getByLabelText(al.button.submit);
      await act(async () => {
        await userEventPendingTimers.type(inputUsername, mk);
        await userEventPendingTimers.type(
          inputPrivateKey,
          utilsT.userData.nonEncryptKeys.active,
        );
        await userEventPendingTimers.click(submitButton);
      });
      await act(async () => {
        jest.runOnlyPendingTimers();
      });
      await waitFor(() => {
        expect(screen.getByLabelText(al.component.homePage)).toBeDefined();
        expect(screen.getByText(mk)).toBeDefined();
      });
    });
    it('Must derivate all keys from master, and navigate to select keys page', async () => {
      customRender(<App />, {
        initialState: { mk: mk, accounts: [], activeRpc: rpc } as RootState,
      });
      await act(async () => {
        jest.runOnlyPendingTimers();
      });
      const addByKeysButton = await screen.findByLabelText(al.button.addByKeys);
      expect(addByKeysButton).toBeDefined();
      await act(async () => {
        await userEventPendingTimers.click(addByKeysButton);
      });
      const inputUsername = screen.getByLabelText(al.input.username);
      const inputPrivateKey = screen.getByLabelText(al.input.privateKey);
      const submitButton = screen.getByLabelText(al.button.submit);
      await act(async () => {
        await userEventPendingTimers.type(inputUsername, mk);
        await userEventPendingTimers.type(
          inputPrivateKey,
          utilsT.userData.nonEncryptKeys.master,
        );
        await userEventPendingTimers.click(submitButton);
      });
      await act(async () => {
        jest.runOnlyPendingTimers();
      });
      await waitFor(() => {
        expect(screen.getByLabelText(al.component.selectPage)).toBeDefined();
        expect(screen.getByText('Posting Key')).toBeDefined();
        expect(screen.getByText('Active Key')).toBeDefined();
        expect(screen.getByText('Memo Key')).toBeDefined();
      });
    });
    it.skip('Must show error if empty username and empty password', async () => {
      //TODO: waiting for fixes on dispatcher.
      customRender(<App />, {
        initialState: {
          mk: mk,
          accounts: [],
        } as RootState,
      });
      await act(async () => {
        jest.runOnlyPendingTimers();
      });
      const addByKeysButton = await screen.findByLabelText(al.button.addByKeys);
      expect(addByKeysButton).toBeDefined();
      await act(async () => {
        await userEventPendingTimers.click(addByKeysButton);
      });
      const submitButton = screen.getByLabelText(al.button.submit);
      await act(async () => {
        await userEventPendingTimers.click(submitButton);
      });
      await waitFor(() => {
        expect(screen.getByText(fakeData.messages.missingFields)).toBeDefined();
      });
    });
    it('Must show error if existing key', async () => {
      customRender(<App />, {
        initialState: {
          mk: mk,
          accounts: accounts,
        } as RootState,
      });
      await act(async () => {
        jest.runOnlyPendingTimers();
      });
      const menuButton = await screen.findByLabelText(al.button.menu);
      expect(menuButton).toBeDefined();
      await act(async () => {
        await userEventPendingTimers.click(menuButton);
      });
      const menuSettingButtonPeople = screen.getByLabelText(
        al.button.menuSettingsPeople,
      );
      await act(async () => {
        await userEventPendingTimers.click(menuSettingButtonPeople);
      });
      const menuSettingsButtonPersonAdd = screen.getByLabelText(
        al.button.menuSettingsPersonAdd,
      );
      await act(async () => {
        await userEventPendingTimers.click(menuSettingsButtonPersonAdd);
      });
      const addByKeysButton = screen.getByLabelText(al.button.addByKeys);
      await act(async () => {
        await userEventPendingTimers.click(addByKeysButton);
      });
      const inputUsername = screen.getByLabelText(al.input.username);
      const inputPrivateKey = screen.getByLabelText(al.input.privateKey);
      const submitButton = screen.getByLabelText(al.button.submit);
      await act(async () => {
        await userEventPendingTimers.type(inputUsername, mk);
        await userEventPendingTimers.type(
          inputPrivateKey,
          utilsT.userData.nonEncryptKeys.active,
        );
        await userEventPendingTimers.click(submitButton);
      });
      await waitFor(() => {
        expect(
          screen.getByText(fakeData.messages.existingAccount),
        ).toBeDefined();
      });
    });
    it.skip('Must show error when using a public key', async () => {
      //TODO: waiting for fixes on dispatcher.
      customRender(<App />, {
        initialState: { mk: mk, accounts: [], activeRpc: rpc } as RootState,
      });
      await act(async () => {
        jest.runOnlyPendingTimers();
      });
      const addByKeysButton = await screen.findByLabelText(al.button.addByKeys);
      expect(addByKeysButton).toBeDefined();
      await act(async () => {
        await userEventPendingTimers.click(addByKeysButton);
      });
      const inputUsername = screen.getByLabelText(al.input.username);
      const inputPrivateKey = screen.getByLabelText(al.input.privateKey);
      const submitButton = screen.getByLabelText(al.button.submit);
      await act(async () => {
        await userEventPendingTimers.type(inputUsername, mk);
        await userEventPendingTimers.type(
          inputPrivateKey,
          utilsT.userData.encryptKeys.active,
        );
        await userEventPendingTimers.click(submitButton);
      });
      await act(async () => {
        jest.runOnlyPendingTimers();
      });
      await waitFor(() => {
        expect(
          screen.getByText(fakeData.messages.error.publicKey),
        ).toBeDefined();
      });
    });
    it.skip('Must show error when using an incorrect key', async () => {
      //TODO: waiting for fixes on dispatcher.
      customRender(<App />, {
        initialState: { mk: mk, accounts: [], activeRpc: rpc } as RootState,
      });
      await act(async () => {
        jest.runOnlyPendingTimers();
      });
      const addByKeysButton = await screen.findByLabelText(al.button.addByKeys);
      expect(addByKeysButton).toBeDefined();
      await act(async () => {
        await userEventPendingTimers.click(addByKeysButton);
      });
      const inputUsername = screen.getByLabelText(al.input.username);
      const inputPrivateKey = screen.getByLabelText(al.input.privateKey);
      const submitButton = screen.getByLabelText(al.button.submit);
      await act(async () => {
        await userEventPendingTimers.type(inputUsername, mk);
        await userEventPendingTimers.type(
          inputPrivateKey,
          utilsT.userData.nonEncryptKeys.randomStringKey51,
        );
        await userEventPendingTimers.click(submitButton);
      });
      await act(async () => {
        jest.runOnlyPendingTimers();
      });
      await waitFor(() => {
        expect(
          screen.getByText(fakeData.messages.error.incorrectKeyOrPassword),
        ).toBeDefined();
      });
    });
    it.skip('Must show error when using an incorrect username', async () => {
      //TODO: waiting for fixes on dispatcher.
      HiveUtils.getClient().database.getAccounts = jest
        .fn()
        .mockResolvedValueOnce([]);
      customRender(<App />, {
        initialState: { mk: mk, accounts: [], activeRpc: rpc } as RootState,
      });
      await act(async () => {
        jest.runOnlyPendingTimers();
      });
      const addByKeysButton = await screen.findByLabelText(al.button.addByKeys);
      expect(addByKeysButton).toBeDefined();
      await act(async () => {
        await userEventPendingTimers.click(addByKeysButton);
      });
      const inputUsername = screen.getByLabelText(al.input.username);
      const inputPrivateKey = screen.getByLabelText(al.input.privateKey);
      const submitButton = screen.getByLabelText(al.button.submit);
      await act(async () => {
        await userEventPendingTimers.type(inputUsername, 'invalid_username');
        await userEventPendingTimers.type(
          inputPrivateKey,
          utilsT.userData.nonEncryptKeys.randomStringKey51,
        );
        await userEventPendingTimers.click(submitButton);
      });
      await act(async () => {
        jest.runOnlyPendingTimers();
      });
      await waitFor(() => {
        expect(
          screen.getByText(fakeData.messages.error.incorrectUser),
        ).toBeDefined();
      });
    });
  });

  describe('add-by-auth tests:\n', () => {
    let menuSettings: HTMLElement;
    let accountsMenu: HTMLElement;
    let addPersonMenu: HTMLElement;
    let addByAuthButton: HTMLElement;
    beforeEach(async () => {
      AccountUtils.hasStoredAccounts = jest.fn().mockResolvedValue(true);
      customRender(<App />, {
        initialState: { mk: mk, accounts: accounts } as RootState,
      });
      await act(async () => {
        jest.runOnlyPendingTimers();
      });
      menuSettings = await screen.findByLabelText(al.button.menu);
      await act(async () => {
        await userEventPendingTimers.click(menuSettings);
      });
      accountsMenu = screen.getByLabelText(al.button.menuSettingsPeople);
      await act(async () => {
        await userEventPendingTimers.click(accountsMenu);
      });
      addPersonMenu = screen.getByLabelText(al.button.menuSettingsPersonAdd);
      await act(async () => {
        await userEventPendingTimers.click(addPersonMenu);
      });
    });
    it('Must show error trying to add existing account', async () => {
      addByAuthButton = screen.getByLabelText(al.button.addByAuth);
      await act(async () => {
        await userEventPendingTimers.click(addByAuthButton);
      });
      const inputUsername = screen.getByLabelText(al.input.username);
      const inputAuthorizedAccount = screen.getByLabelText(
        al.input.authorizedAccount,
      );
      const submitButton = screen.getByLabelText(al.button.submit);
      await act(async () => {
        await userEventPendingTimers.type(
          inputUsername,
          utilsT.userData.username,
        );
        await userEventPendingTimers.type(
          inputAuthorizedAccount,
          'theghost1980',
        );
        await userEventPendingTimers.click(submitButton);
      });
      await waitFor(() => {
        expect(
          screen.getByText(fakeData.messages.existingAccount),
        ).toBeDefined();
      });
    });
    it('Must show error with empty username and authorized account', async () => {
      addByAuthButton = screen.getByLabelText(al.button.addByAuth);
      await act(async () => {
        await userEventPendingTimers.click(addByAuthButton);
      });
      const submitButton = screen.getByLabelText(al.button.submit);
      await act(async () => {
        await userEventPendingTimers.click(submitButton);
      });
      await waitFor(() => {
        expect(screen.getByText(fakeData.messages.missingFields)).toBeDefined();
      });
    });
    it('Must show error if account not present in local accounts', async () => {
      addByAuthButton = screen.getByLabelText(al.button.addByAuth);
      await act(async () => {
        await userEventPendingTimers.click(addByAuthButton);
      });
      const inputUsername = screen.getByLabelText(al.input.username);
      const inputAuthorizedAccount = screen.getByLabelText(
        al.input.authorizedAccount,
      );
      const submitButton = screen.getByLabelText(al.button.submit);
      await act(async () => {
        await userEventPendingTimers.type(inputUsername, 'theghost1980');
        await userEventPendingTimers.type(
          inputAuthorizedAccount,
          'no_auth_account',
        );
        await userEventPendingTimers.click(submitButton);
      });
      await waitFor(() => {
        expect(screen.getByText(fakeData.messages.addToAuth)).toBeDefined();
      });
    });
    it('Must show error if account not found on hive', async () => {
      HiveUtils.getClient().database.getAccounts = jest
        .fn()
        .mockResolvedValue([]);
      addByAuthButton = screen.getByLabelText(al.button.addByAuth);
      await act(async () => {
        await userEventPendingTimers.click(addByAuthButton);
      });
      const inputUsername = screen.getByLabelText(al.input.username);
      const inputAuthorizedAccount = screen.getByLabelText(
        al.input.authorizedAccount,
      );
      const submitButton = screen.getByLabelText(al.button.submit);
      await act(async () => {
        await userEventPendingTimers.type(inputUsername, 'theghost1980');
        await userEventPendingTimers.type(
          inputAuthorizedAccount,
          utilsT.userData.username,
        );
        await userEventPendingTimers.click(submitButton);
      });
      await waitFor(() => {
        expect(
          screen.getByText(fakeData.messages.error.incorrectUser),
        ).toBeDefined();
      });
    });
    it('Must show error if account is not authorized', async () => {
      addByAuthButton = screen.getByLabelText(al.button.addByAuth);
      await act(async () => {
        await userEventPendingTimers.click(addByAuthButton);
      });
      const inputUsername = screen.getByLabelText(al.input.username);
      const inputAuthorizedAccount = screen.getByLabelText(
        al.input.authorizedAccount,
      );
      const submitButton = screen.getByLabelText(al.button.submit);
      await act(async () => {
        await userEventPendingTimers.type(inputUsername, 'theghost1980');
        await userEventPendingTimers.type(
          inputAuthorizedAccount,
          utilsT.userData.username,
        );
        await userEventPendingTimers.click(submitButton);
      });
      await waitFor(() => {
        expect(screen.getByText(fakeData.messages.accountNoAuth)).toBeDefined();
      });
    });
    it('Must add account auth and navigate to settings main page', async () => {
      addByAuthButton = screen.getByLabelText(al.button.addByAuth);
      await act(async () => {
        await userEventPendingTimers.click(addByAuthButton);
      });
      HiveUtils.getClient().database.getAccounts = jest
        .fn()
        .mockResolvedValueOnce(fakeData.accounts.extendedAccountJustAuth)
        .mockResolvedValue(fakeData.accounts.extendedAccountFull);
      const inputUsername = screen.getByLabelText(al.input.username);
      const inputAuthorizedAccount = screen.getByLabelText(
        al.input.authorizedAccount,
      );
      const submitButton = screen.getByLabelText(al.button.submit);
      await act(async () => {
        await userEventPendingTimers.type(inputUsername, 'theghost1980');
        await userEventPendingTimers.type(
          inputAuthorizedAccount,
          utilsT.userData.username,
        );
        await userEventPendingTimers.click(submitButton);
      });
      await waitFor(() => {
        expect(
          screen.getByLabelText(al.component.settingsMainPage),
        ).toBeDefined();
      });
    });
  });
});
