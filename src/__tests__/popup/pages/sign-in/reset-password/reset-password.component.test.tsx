import { Asset, ExtendedAccount } from '@hiveio/dhive';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Rpc } from '@interfaces/rpc.interface';
import App from '@popup/App';
import { act, cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import mocks from 'src/__tests__/utils-for-testing/end-to-end-mocks';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import { initialStateFull } from 'src/__tests__/utils-for-testing/initial-states';
import { customRender } from 'src/__tests__/utils-for-testing/renderSetUp';

const chrome = require('chrome-mock');
global.chrome = chrome;
jest.setTimeout(10000);

const userEventCustom = userEvent.setup({
  advanceTimers: () => jest.runOnlyPendingTimers(),
});

//TODO component: src/popup/pages/sign-in/reset-password/reset-password.component.tsx
// keep the convention: add-account-component always for ALs
// case 4 no password, yes accounts
//steps:
// - sign in page loads
// - find the forgot password.
// - click it
// - wait for results.
// after finishing that one
// src/popup/pages/add-account/add-account-main/add-account-main.component.tsx
//  - add-by-auth
//  - add-by-keys
//  - TRY if you can for about 1 hour top, import-keys
//    - if not possible, write down every solution.
//  - select-keys
// after finishing those, move to homepage.

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
const confirmButtonAL = 'confirm-clear-button';

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

  it('aslkdjlaksd', () => {});
  it('Must clear all user data and navigate to sign up page', async () => {
    //question on src/popup/pages/app-container/home/top-bar/top-bar.component.tsx
    //solution applied: pass an initial state will all data needed.

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

    customRender(<App />, { initialState: initialStateFull });
    expect(await screen.findByLabelText(/home-page-component/i)).toBeDefined();
    const settingsButton = await screen.findByLabelText(/clickable-settings/i); //find menu icon
    await act(async () => {
      await userEventCustom.click(settingsButton); //fire click div
    });
    let buttonSettings: HTMLElement; //find the div settings
    await waitFor(() => {
      buttonSettings = screen.getByLabelText(
        /menu-settings-button-settings/i,
      ) as HTMLElement;
      expect(buttonSettings).toBeDefined();
    });
    await act(async () => {
      await userEventCustom.click(buttonSettings); //click on it
    });
    let buttonClearAllData: HTMLElement; //find the menu-settings-button-clear
    await waitFor(() => {
      buttonClearAllData = screen.getByLabelText(/menu-settings-button-clear/i);
    });
    await act(async () => {
      await userEventCustom.click(buttonClearAllData); //click on div
    });
    let confirmClearButton: HTMLButtonElement; //find the button
    let cancelClearButton: HTMLButtonElement;
    await waitFor(() => {
      confirmClearButton = screen.getByLabelText(
        confirmButtonAL,
      ) as HTMLButtonElement;
      cancelClearButton = screen.getByLabelText(
        cancelButtonAL,
      ) as HTMLButtonElement;
    });
    //click to confirm
    await act(async () => {
      //debug();
      //await userEventCustom.click(cancelClearButton); //it works and should render the AL: "menu-settings-button-clear";
      await userEventCustom.click(confirmClearButton); //it works and should render the AL: "menu-settings-button-clear";
    });
    await waitFor(async () => {
      screen.debug();
      //expect(screen.getByLabelText(/yolo/i)).toBeDefined();
    });

    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    cleanup();
  });

  // it('asdasd', async () => {
  //   mocks.mocksApp({
  //     fixPopupOnMacOs: jest.fn(),
  //     getValueFromLocalStorage: jest
  //       .fn()
  //       .mockImplementation(mocks.getValuefromLS),
  //     getCurrentRpc: rpc,
  //     activeAccountUsername: mk,
  //     getRCMana: fakeManaBarResponse,
  //     getAccounts: fakeExtendedAccountResponse,
  //     rpcStatus: true,
  //     setRpc: jest.fn(),
  //     chromeSendMessage: jest.fn(),
  //     hasStoredAccounts: true,
  //     mkLocal: mk,
  //     getAccountsFromLocalStorage: accounts,
  //     hasVotedForProposal: false,
  //     voteForKeychainProposal: jest.fn(),
  //     chromeTabsCreate: jest.fn(),
  //     i18nGetMessage: jest.fn().mockImplementation(mocks.i18nGetMessage),
  //     saveValueInLocalStorage: jest.fn(),
  //     clearLocalStorage: jest.fn(),
  //     removeFromLocalStorage: jest.fn(),
  //   });
  //   mocks.mocksHome({
  //     getPrices: fakeGetPricesResponse,
  //     getAccountValue: '100000',
  //   });
  //   mocks.mocksTopBar({
  //     hasReward: false,
  //   });
  //   jest.useFakeTimers('legacy');
  //   act(() => {
  //     jest.advanceTimersByTime(4300);
  //   });
  //   customRender(<App />, { initialState: initialStateFull });
  //   const logOutButton = (await screen.findByText('logout')) as HTMLElement;
  //   expect(logOutButton).toBeDefined();
  //   userEvent.click(logOutButton);
  //   jest.runOnlyPendingTimers();
  //   expect(await screen.findByText('yolo')).toBeDefined();
  //   // act(() => {
  //   //   userEvent.click(logOutButton);
  //   // });
  //   // expect(screen.getByText('yolo')).toBeDefined();
  //   // await waitFor(() => {
  //   //   expect(screen.getByText('yolo')).toBeDefined();
  //   // });
  // });
});
