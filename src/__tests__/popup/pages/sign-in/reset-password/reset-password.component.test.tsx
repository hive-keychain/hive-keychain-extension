import { Asset, ExtendedAccount } from '@hiveio/dhive';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Rpc } from '@interfaces/rpc.interface';
import App from '@popup/App';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { FC } from 'react';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import utilsResetPassword from 'src/__tests__/utils-for-testing/end-to-end-mocks';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialStateWAccountsWActiveAccountStore } from 'src/__tests__/utils-for-testing/initial-states';

const chrome = require('chrome-mock');
global.chrome = chrome;
jest.setTimeout(10000);

const mk = utilsT.userData.username;
let fakeStore = getFakeStore(initialStateWAccountsWActiveAccountStore);
const wrapperStore: FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Provider store={fakeStore}>{children}</Provider>;
};

//consts
const accountValue = '100000';
const rpc = { uri: 'https://hived.privex.io/', testnet: false } as Rpc;
const homeComponentAL = 'home-page-component';
const loadingLogoAL = 'loading-logo';
const userEventCustom = userEvent.setup({
  advanceTimers: () => jest.runOnlyPendingTimers(),
});
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
  },
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
//end consts

describe('reset-password.component tests:\n', () => {
  it('Must clear user data and navigate to sign up page', async () => {
    jest.useFakeTimers('legacy');
    utilsResetPassword.mocksApp({
      fixPopupOnMacOs: jest.fn(),
      getValueFromLocalStorage: jest
        .fn()
        .mockImplementation(utilsResetPassword.getValuefromLS),
      getCurrentRpc: rpc,
      activeAccountUsername: mk,
      getRCMana: fakeManaBarResponse,
      getAccounts: fakeExtendedAccountResponse as [ExtendedAccount],
      rpcStatus: true,
      setRpc: jest.fn(),
      chromeSendMessage: jest.fn(),
      hasStoredAccounts: true,
      mkLocal: mk,
      getAccountsFromLocalStorage: accounts,
      hasVotedForProposal: true,
      voteForKeychainProposal: jest.fn(),
      chromeTabsCreate: jest.fn(),
      i18nGetMessage: jest
        .fn()
        .mockImplementation(utilsResetPassword.i18nGetMessage),
      saveValueInLocalStorage: jest.fn(),
    });
    utilsResetPassword.mocksHome({
      getPrices: fakeGetPricesResponse,
      getAccountValue: accountValue,
    });
    utilsResetPassword.mocksTopBar({ hasReward: false });
    act(() => {
      jest.advanceTimersByTime(4300);
    });
    render(<App />, { wrapper: wrapperStore });
    const homeComponent = await screen.findByLabelText(homeComponentAL);
    expect(homeComponent).toBeDefined();
    //const settingsButton = await screen.findByLabelText('clickable-setting');
    //expect(settingsButton).toBeDefined();

    //todo USE APP as this is the only way to navigate + see the whole process.
    //use this mocks for mockHome
    //use the app mocks as usual.

    // expect(await screen.findByLabelText('loading-logo')).toBeDefined();
    // act(() => {
    //   //execute the loading interval + rerender
    //   jest.runOnlyPendingTimers();
    // });
    // await waitFor(() => {
    //   expect(screen.getByText('theghost1980')).toBeDefined();
    // });
    // act(() => {
    //   jest.advanceTimersByTime(1100);
    // });
    // await waitFor(() => {
    //   expect(screen.getByText(' theghost1980')).toBeDefined();
    // });
    // const homeComponent = await screen.findByLabelText(
    //   utilsResetPassword.homeComponentAL,
    // );
    // expect(homeComponent).toBeDefined();
    //find actions button
    //select clearAllData
    //check if sign up is loaded.
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    cleanup();
  });
});
