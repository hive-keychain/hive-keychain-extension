import { Asset, AuthorityType, ExtendedAccount } from '@hiveio/dhive';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Rpc } from '@interfaces/rpc.interface';
import App from '@popup/App';
import { act, cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import mocks from 'src/__tests__/utils-for-testing/end-to-end-mocks';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import { customRender } from 'src/__tests__/utils-for-testing/renderSetUp';

const chrome = require('chrome-mock');
global.chrome = chrome;
jest.setTimeout(10000);

const userEventCustom = userEvent.setup({
  advanceTimers: () => jest.runOnlyPendingTimers(),
});

//consts to move to componentName-data
const mk = utilsT.userData.username;
const accountValue = '100000';
const rpc = { uri: 'https://fake.rpc.io/', testnet: false } as Rpc;
const homeComponentAL = 'home-page-component';
const loadingLogoAL = 'loading-logo';
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
//end //consts to move to componentName-data

const cancelButtonAL = 'cancel-clear-button';
const confirmButtonAL = 'reset-password-confirm-button';
const resetPasswordLinkAL = 'reset-password-link';

describe('reset-password.component tests:\n', () => {
  // it('Must clear user data and navigate to sign up page', async () => {
  //   jest.useFakeTimers('legacy');
  //   utilsResetPassword.mocksApp({
  //     fixPopupOnMacOs: jest.fn(),
  //     getValueFromLocalStorage: jest
  //       .fn()
  //       .mockImplementation(utilsResetPassword.getValuefromLS),
  //     getCurrentRpc: rpc,
  //     activeAccountUsername: mk,
  //     getRCMana: fakeManaBarResponse,
  //     getAccounts: fakeExtendedAccountResponse as [ExtendedAccount],
  //     rpcStatus: true,
  //     setRpc: jest.fn(),
  //     chromeSendMessage: jest.fn(),
  //     hasStoredAccounts: true,
  //     mkLocal: mk,
  //     getAccountsFromLocalStorage: accounts,
  //     hasVotedForProposal: true,
  //     voteForKeychainProposal: jest.fn(),
  //     chromeTabsCreate: jest.fn(),
  //     i18nGetMessage: jest
  //       .fn()
  //       .mockImplementation(utilsResetPassword.i18nGetMessage),
  //     saveValueInLocalStorage: jest.fn(),
  //   });
  //   utilsResetPassword.mocksHome({
  //     getPrices: fakeGetPricesResponse,
  //     getAccountValue: accountValue,
  //   });
  //   utilsResetPassword.mocksTopBar({ hasReward: false });
  //   act(() => {
  //     jest.advanceTimersByTime(4300);
  //   });
  //   render(<App />, { wrapper: wrapperStore });
  //   const homeComponent = await screen.findByLabelText(homeComponentAL);
  //   expect(homeComponent).toBeDefined();
  //   //const settingsButton = await screen.findByLabelText('clickable-setting');
  //   //expect(settingsButton).toBeDefined();

  //   //todo USE APP as this is the only way to navigate + see the whole process.
  //   //use this mocks for mockHome
  //   //use the app mocks as usual.

  //   // expect(await screen.findByLabelText('loading-logo')).toBeDefined();
  //   // act(() => {
  //   //   //execute the loading interval + rerender
  //   //   jest.runOnlyPendingTimers();
  //   // });
  //   // await waitFor(() => {
  //   //   expect(screen.getByText('theghost1980')).toBeDefined();
  //   // });
  //   // act(() => {
  //   //   jest.advanceTimersByTime(1100);
  //   // });
  //   // await waitFor(() => {
  //   //   expect(screen.getByText(' theghost1980')).toBeDefined();
  //   // });
  //   // const homeComponent = await screen.findByLabelText(
  //   //   utilsResetPassword.homeComponentAL,
  //   // );
  //   // expect(homeComponent).toBeDefined();
  //   //find actions button
  //   //select clearAllData
  //   //check if sign up is loaded.
  //   jest.runOnlyPendingTimers();
  //   jest.useRealTimers();
  //   cleanup();
  // });

  //pass: 1234567890qwertyu

  it('Must clear all user data and navigate to sign up page', async () => {
    //TODO same issue as it seems, for some reason
    //the tests cannot get the action happening inside those files as
    //store.dispatch(resetAccount());
    //store.dispatch(forgetMk());
    //store.dispatch(resetActiveAccount());
    const mk = '';
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
      hasStoredAccounts: true,
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
    act(() => {
      jest.advanceTimersByTime(4300);
    });

    customRender(<App />, {
      initialState: initialEmptyStateStore,
    });
    const divResetPassword = (await screen.findByLabelText(
      resetPasswordLinkAL,
    )) as HTMLElement;
    expect(divResetPassword).toBeDefined();
    await act(async () => {
      await userEventCustom.click(divResetPassword);
    });
    let confirmResetPasswordButton = screen.getByLabelText(
      confirmButtonAL,
    ) as HTMLElement;
    await act(async () => {
      await userEventCustom.click(confirmResetPasswordButton);
    });

    await waitFor(() => {
      expect(screen.getByText('yolo')).toBeDefined();
    });

    // await waitFor(() => {
    //   expect(screen.getByText('yolo')).toBeDefined();
    // });

    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    cleanup();
  });

  describe.skip('add-account-main.component tests:\n', () => {
    const mk = utilsT.userData.username;
    //to add here same fake data as above.
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
      const addByKeysButton = await screen.findByLabelText(
        'add-by-keys-button',
      );
      expect(addByKeysButton).toBeDefined();
      await act(async () => {
        await userEventCustom.click(addByKeysButton);
      });
      const inputUsername = screen.getByLabelText('input-username');
      const inputPrivateKey = screen.getByLabelText('input-private-key');
      const submitButton = screen.getByLabelText('submit-button');
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
        expect(screen.getByLabelText('home-page-component')).toBeDefined();
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
      const addByKeysButton = await screen.findByLabelText(
        'add-by-keys-button',
      );
      expect(addByKeysButton).toBeDefined();
      await act(async () => {
        await userEventCustom.click(addByKeysButton);
      });
      const inputUsername = screen.getByLabelText('input-username');
      const inputPrivateKey = screen.getByLabelText('input-private-key');
      const submitButton = screen.getByLabelText('submit-button');
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
        expect(screen.getByLabelText('home-page-component')).toBeDefined();
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
      const addByKeysButton = await screen.findByLabelText(
        'add-by-keys-button',
      );
      expect(addByKeysButton).toBeDefined();
      await act(async () => {
        await userEventCustom.click(addByKeysButton);
      });
      const inputUsername = screen.getByLabelText('input-username');
      const inputPrivateKey = screen.getByLabelText('input-private-key');
      const submitButton = screen.getByLabelText('submit-button');
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
        expect(screen.getByLabelText('home-page-component')).toBeDefined();
        expect(screen.getByText(mk)).toBeDefined();
      });
    });
    it('Must derivate all keys from master, and navigate to select keys page', async () => {
      const selectPageComponentAL = 'select-keys-page';
      customRender(<App />, {
        initialState: { mk: mk, accounts: [], activeRpc: rpc } as RootState,
      });
      await act(async () => {
        jest.runOnlyPendingTimers();
      });
      const addByKeysButton = await screen.findByLabelText(
        'add-by-keys-button',
      );
      expect(addByKeysButton).toBeDefined();
      await act(async () => {
        await userEventCustom.click(addByKeysButton);
      });
      const inputUsername = screen.getByLabelText('input-username');
      const inputPrivateKey = screen.getByLabelText('input-private-key');
      const submitButton = screen.getByLabelText('submit-button');
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
    it.skip('Must show error if empty username', async () => {
      //failling only works when having the dispatcher at the same "level"
      //than the component renendering but no inside another call.
      customRender(<App />, {
        initialState: {
          mk: mk,
          accounts: [],
        } as RootState,
      });
      await act(async () => {
        jest.runOnlyPendingTimers();
      });
      const addByKeysButton = await screen.findByLabelText(
        'add-by-keys-button',
      );
      expect(addByKeysButton).toBeDefined();
      await act(async () => {
        await userEventCustom.click(addByKeysButton);
      });
      const inputUsername = screen.getByLabelText('input-username');
      const inputPrivateKey = screen.getByLabelText('input-private-key');
      const submitButton = screen.getByLabelText('submit-button');
      await act(async () => {
        await userEventCustom.click(submitButton);
      });
      await waitFor(() => {}).finally(() =>
        expect(screen.getByText('yolo')).toBeDefined(),
      );
    });
    it.skip('Must show error if empty password', async () => {
      //TODO when fixing previous.
    });
    it('Must show error if account exists', async () => {
      //TODO the only way i see it is comming from home
      customRender(<App />, {
        initialState: {
          mk: mk,
          accounts: accounts,
        } as RootState,
      });
      await act(async () => {
        jest.runOnlyPendingTimers();
      });
      const menuButton = await screen.findByLabelText('clickable-settings');
      expect(menuButton).toBeDefined();
      await act(async () => {
        await userEventCustom.click(menuButton);
      });
      const menuSettingButtonPeople = screen.getByLabelText(
        'menu-settings-button-people',
      );
      await act(async () => {
        await userEventCustom.click(menuSettingButtonPeople);
      });
      const menuSettingsButtonPersonAdd = screen.getByLabelText(
        'menu-settings-button-person_add',
      );
      await act(async () => {
        await userEventCustom.click(menuSettingsButtonPersonAdd);
      });
      const addByKeysButton = screen.getByLabelText('add-by-keys-button');
      await act(async () => {
        await userEventCustom.click(addByKeysButton);
      });
      const inputUsername = screen.getByLabelText('input-username');
      const inputPrivateKey = screen.getByLabelText('input-private-key');
      const submitButton = screen.getByLabelText('submit-button');
      await act(async () => {
        await userEventCustom.type(inputUsername, mk);
        await userEventCustom.type(
          inputPrivateKey,
          utilsT.userData.nonEncryptKeys.active,
        );
        await userEventCustom.click(submitButton);
      });
      await waitFor(() => {
        expect(screen.getByText('Account already existing')).toBeDefined();
      });
    });
    it('public ket case PASSWORD_IS_PUBLIC_KEY', () => {
      //same as the dispatcher is within another file.
    });
    it('INCORRECT_KEY using the random one', () => {
      //same as is inside the utils function.
    });
  });
});
