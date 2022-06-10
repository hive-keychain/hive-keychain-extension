import { Asset, AuthorityType, ExtendedAccount } from '@hiveio/dhive';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Rpc } from '@interfaces/rpc.interface';
import App from '@popup/App';
import { act, cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import mocks from 'src/__tests__/utils-for-testing/end-to-end-mocks';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import { customRender } from 'src/__tests__/utils-for-testing/renderSetUp';

const chrome = require('chrome-mock');
global.chrome = chrome;
jest.setTimeout(10000);

describe('reset-password.component tests:\n', () => {
  const mk = '';
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
  const confirmButtonAL = 'reset-password-confirm-button';
  const resetPasswordLinkAL = 'reset-password-link';
  const SignUpComponentAL = 'signup-page';
  const arrowBackIconAL = 'arrow-back-icon';
  const introductionText =
    'If you forgot your password, you can clear your data but will have to enter all your keys again.';
  beforeEach(async () => {
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
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    cleanup();
  });
  it.skip('Must clear all user data and navigate to sign up page', async () => {
    //TODO
    //waiting for modifications on AccountUtils.clearAllData() in store.dispatch to be handled from the component not from file;
    let divResetPassword: HTMLElement;
    let confirmResetPasswordButton: HTMLElement;
    customRender(<App />, {
      initialState: initialEmptyStateStore,
    });
    divResetPassword = (await screen.findByLabelText(
      resetPasswordLinkAL,
    )) as HTMLElement;
    expect(divResetPassword).toBeDefined();
    await act(async () => {
      await userEventCustom.click(divResetPassword);
    });
    confirmResetPasswordButton = screen.getByLabelText(
      confirmButtonAL,
    ) as HTMLElement;
    await act(async () => {
      await userEventCustom.click(confirmResetPasswordButton);
    });
    await waitFor(() => {
      expect(screen.getByLabelText(SignUpComponentAL)).toBeDefined();
    });
  });
  it('Must cancel and return to previous window', async () => {
    let divResetPassword: HTMLElement;
    let arrowBackSpan: HTMLElement;
    customRender(<App />, {
      initialState: initialEmptyStateStore,
    });
    await waitFor(() => {
      divResetPassword = screen.getByLabelText(
        resetPasswordLinkAL,
      ) as HTMLElement;
    });
    expect(divResetPassword!).toBeDefined();
    await act(async () => {
      await userEventCustom.click(divResetPassword);
    });
    expect(screen.getByText(introductionText)).toBeDefined();
    arrowBackSpan = screen.getByLabelText(arrowBackIconAL) as HTMLElement;
    await act(async () => {
      await userEventCustom.click(arrowBackSpan);
    });
    await waitFor(() => {
      expect(screen.getByLabelText(resetPasswordLinkAL)).toBeDefined();
    });
  });
});
