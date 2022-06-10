import { Asset, AuthorityType, ExtendedAccount } from '@hiveio/dhive';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Rpc } from '@interfaces/rpc.interface';
import App from '@popup/App';
import { act, cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import HiveUtils from 'src/utils/hive.utils';
import mocks from 'src/__tests__/utils-for-testing/end-to-end-mocks';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import { customRender } from 'src/__tests__/utils-for-testing/renderSetUp';

const chrome = require('chrome-mock');
global.chrome = chrome;
jest.setTimeout(10000);

describe('add-account-main.component tests:\n', () => {
  const mk = utilsT.userData.username;
  const userEventCustom = userEvent.setup({
    advanceTimers: () => jest.runOnlyPendingTimers(),
  });
  const rpc = { uri: 'https://fake.rpc.io/', testnet: false } as Rpc;
  const accounts = [
    utilsT.secondAccountOnState,
    {
      name: utilsT.userData.username,
      keys: utilsT.keysUserData1,
    },
  ] as LocalAccount[];
  const fakeExtendedAccountResponse = [
    {
      name: utilsT.userData.username,
      reputation: 100,
      reward_hbd_balance: '100 HBD',
      reward_hive_balance: '100 HIVE',
      reward_vesting_balance: new Asset(1000, 'VESTS'),
      delegated_vesting_shares: new Asset(100, 'VESTS'),
      received_vesting_shares: new Asset(20000, 'VESTS'),
      balance: new Asset(1000, 'HIVE'),
      savings_balance: new Asset(10000, 'HBD'),
      proxy: '',
      witness_votes: ['aggroed', 'blocktrades'],
      posting: {
        weight_threshold: 1,
        account_auths: [],
        key_auths: [[utilsT.userData.encryptKeys.posting, 1]],
      } as AuthorityType,
      active: {
        weight_threshold: 1,
        account_auths: [],
        key_auths: [[utilsT.userData.encryptKeys.active, 1]],
      } as AuthorityType,
      owner: {
        weight_threshold: 1,
        account_auths: [],
        key_auths: [[utilsT.userData.encryptKeys.owner, 1]],
      } as AuthorityType,
      memo_key: utilsT.userData.encryptKeys.memo,
    } as ExtendedAccount,
  ];
  const fakeManaBarResponse = {
    current_mana: 1000,
    max_mana: 10000,
    percentage: 100,
  };
  const fakeGetPricesResponse = {
    data: {
      bitcoin: { usd: 79999, usd_24h_change: -9.025 },
      hive: { usd: 0.638871, usd_24h_change: -13.1 },
      hive_dollar: { usd: 0.972868, usd_24h_change: -0.69 },
    },
  };
  const addByKeysButtonAL = 'add-by-keys-button';
  const inputUsernameAL = 'input-username';
  const inputPrivateKeyAL = 'input-private-key';
  const submitButtonAL = 'submit-button';
  const homePageComponentAL = 'home-page-component';
  const selectPageComponentAL = 'select-keys-page';
  const missingFieldsMessage = 'Please fill the fields.';
  const menuButtonAL = 'clickable-settings';
  const menuSettingButtonPeopleAL = 'menu-settings-button-people';
  const menuSettingsButtonPersonAddAL = 'menu-settings-button-person_add';
  const accountExistsMessage = 'Account already existing';
  const publicKeyMessageError =
    'This is a public key! Please enter a private key or your master key.';
  const incorrectKeyMessage = 'Incorrect private key or password.';
  const incorrectUserMessage = 'Please check the username and try again.';

  beforeEach(() => {
    mocks.mocksApp({
      fixPopupOnMacOs: jest.fn(),
      getValueFromLocalStorage: jest
        .fn()
        .mockImplementation(mocks.getValuefromLS),
      getCurrentRpc: rpc,
      activeAccountUsername: mk,
      getRCMana: fakeManaBarResponse,
      getAccounts: fakeExtendedAccountResponse,
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
      getPrices: fakeGetPricesResponse,
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
  it('Must add valid posting key and load homepage', async () => {
    customRender(<App />, {
      initialState: { mk: mk, accounts: [], activeRpc: rpc } as RootState,
    });
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    const addByKeysButton = await screen.findByLabelText(addByKeysButtonAL);
    expect(addByKeysButton).toBeDefined();
    await act(async () => {
      await userEventCustom.click(addByKeysButton);
    });
    const inputUsername = screen.getByLabelText(inputUsernameAL);
    const inputPrivateKey = screen.getByLabelText(inputPrivateKeyAL);
    const submitButton = screen.getByLabelText(submitButtonAL);
    await act(async () => {
      await userEventCustom.type(inputUsername, mk);
      await userEventCustom.type(
        inputPrivateKey,
        utilsT.userData.nonEncryptKeys.posting,
      );
      await userEventCustom.click(submitButton);
    });
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    await waitFor(() => {
      expect(screen.getByLabelText(homePageComponentAL)).toBeDefined();
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
    const addByKeysButton = await screen.findByLabelText(addByKeysButtonAL);
    expect(addByKeysButton).toBeDefined();
    await act(async () => {
      await userEventCustom.click(addByKeysButton);
    });
    const inputUsername = screen.getByLabelText(inputUsernameAL);
    const inputPrivateKey = screen.getByLabelText(inputPrivateKeyAL);
    const submitButton = screen.getByLabelText(submitButtonAL);
    await act(async () => {
      await userEventCustom.type(inputUsername, mk);
      await userEventCustom.type(
        inputPrivateKey,
        utilsT.userData.nonEncryptKeys.memo,
      );
      await userEventCustom.click(submitButton);
    });
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    await waitFor(() => {
      expect(screen.getByLabelText(homePageComponentAL)).toBeDefined();
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
    const addByKeysButton = await screen.findByLabelText(addByKeysButtonAL);
    expect(addByKeysButton).toBeDefined();
    await act(async () => {
      await userEventCustom.click(addByKeysButton);
    });
    const inputUsername = screen.getByLabelText(inputUsernameAL);
    const inputPrivateKey = screen.getByLabelText(inputPrivateKeyAL);
    const submitButton = screen.getByLabelText(submitButtonAL);
    await act(async () => {
      await userEventCustom.type(inputUsername, mk);
      await userEventCustom.type(
        inputPrivateKey,
        utilsT.userData.nonEncryptKeys.active,
      );
      await userEventCustom.click(submitButton);
    });
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    await waitFor(() => {
      expect(screen.getByLabelText(homePageComponentAL)).toBeDefined();
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
    const addByKeysButton = await screen.findByLabelText(addByKeysButtonAL);
    expect(addByKeysButton).toBeDefined();
    await act(async () => {
      await userEventCustom.click(addByKeysButton);
    });
    const inputUsername = screen.getByLabelText(inputUsernameAL);
    const inputPrivateKey = screen.getByLabelText(inputPrivateKeyAL);
    const submitButton = screen.getByLabelText(submitButtonAL);
    await act(async () => {
      await userEventCustom.type(inputUsername, mk);
      await userEventCustom.type(
        inputPrivateKey,
        utilsT.userData.nonEncryptKeys.master,
      );
      await userEventCustom.click(submitButton);
    });
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    await waitFor(() => {
      expect(screen.getByLabelText(selectPageComponentAL)).toBeDefined();
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
    const addByKeysButton = await screen.findByLabelText(addByKeysButtonAL);
    expect(addByKeysButton).toBeDefined();
    await act(async () => {
      await userEventCustom.click(addByKeysButton);
    });
    const submitButton = screen.getByLabelText(submitButtonAL);
    await act(async () => {
      await userEventCustom.click(submitButton);
    });
    await waitFor(() => {
      expect(screen.getByText(missingFieldsMessage)).toBeDefined();
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
    const menuButton = await screen.findByLabelText(menuButtonAL);
    expect(menuButton).toBeDefined();
    await act(async () => {
      await userEventCustom.click(menuButton);
    });
    const menuSettingButtonPeople = screen.getByLabelText(
      menuSettingButtonPeopleAL,
    );
    await act(async () => {
      await userEventCustom.click(menuSettingButtonPeople);
    });
    const menuSettingsButtonPersonAdd = screen.getByLabelText(
      menuSettingsButtonPersonAddAL,
    );
    await act(async () => {
      await userEventCustom.click(menuSettingsButtonPersonAdd);
    });
    const addByKeysButton = screen.getByLabelText(addByKeysButtonAL);
    await act(async () => {
      await userEventCustom.click(addByKeysButton);
    });
    const inputUsername = screen.getByLabelText(inputUsernameAL);
    const inputPrivateKey = screen.getByLabelText(inputPrivateKeyAL);
    const submitButton = screen.getByLabelText(submitButtonAL);
    await act(async () => {
      await userEventCustom.type(inputUsername, mk);
      await userEventCustom.type(
        inputPrivateKey,
        utilsT.userData.nonEncryptKeys.active,
      );
      await userEventCustom.click(submitButton);
    });
    await waitFor(() => {
      expect(screen.getByText(accountExistsMessage)).toBeDefined();
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
    const addByKeysButton = await screen.findByLabelText(addByKeysButtonAL);
    expect(addByKeysButton).toBeDefined();
    await act(async () => {
      await userEventCustom.click(addByKeysButton);
    });
    const inputUsername = screen.getByLabelText(inputUsernameAL);
    const inputPrivateKey = screen.getByLabelText(inputPrivateKeyAL);
    const submitButton = screen.getByLabelText(submitButtonAL);
    await act(async () => {
      await userEventCustom.type(inputUsername, mk);
      await userEventCustom.type(
        inputPrivateKey,
        utilsT.userData.encryptKeys.active,
      );
      await userEventCustom.click(submitButton);
    });
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    await waitFor(() => {
      expect(screen.getByText(publicKeyMessageError)).toBeDefined();
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
    const addByKeysButton = await screen.findByLabelText(addByKeysButtonAL);
    expect(addByKeysButton).toBeDefined();
    await act(async () => {
      await userEventCustom.click(addByKeysButton);
    });
    const inputUsername = screen.getByLabelText(inputUsernameAL);
    const inputPrivateKey = screen.getByLabelText(inputPrivateKeyAL);
    const submitButton = screen.getByLabelText(submitButtonAL);
    await act(async () => {
      await userEventCustom.type(inputUsername, mk);
      await userEventCustom.type(
        inputPrivateKey,
        utilsT.userData.nonEncryptKeys.randomStringKey51,
      );
      await userEventCustom.click(submitButton);
    });
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    await waitFor(() => {
      expect(screen.getByText(incorrectKeyMessage)).toBeDefined();
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
    const addByKeysButton = await screen.findByLabelText(addByKeysButtonAL);
    expect(addByKeysButton).toBeDefined();
    await act(async () => {
      await userEventCustom.click(addByKeysButton);
    });
    const inputUsername = screen.getByLabelText(inputUsernameAL);
    const inputPrivateKey = screen.getByLabelText(inputPrivateKeyAL);
    const submitButton = screen.getByLabelText(submitButtonAL);
    await act(async () => {
      await userEventCustom.type(inputUsername, 'invalid_username');
      await userEventCustom.type(
        inputPrivateKey,
        utilsT.userData.nonEncryptKeys.randomStringKey51,
      );
      await userEventCustom.click(submitButton);
    });
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    await waitFor(() => {
      expect(screen.getByText(incorrectUserMessage)).toBeDefined();
    });
  });
});
