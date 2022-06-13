import App from '@popup/App';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import React, { FC } from 'react';
import { Provider } from 'react-redux';
import MkUtils from 'src/utils/mk.utils';
import al from 'src/__tests__/utils-for-testing/end-to-end-aria-labels';
import fakeData from 'src/__tests__/utils-for-testing/end-to-end-data';
import {
  userEventPendingNoAutoClose,
  userEventPendingTimers,
} from 'src/__tests__/utils-for-testing/end-to-end-events';
import mocks from 'src/__tests__/utils-for-testing/end-to-end-mocks';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialStateWAccountsWActiveAccountStore } from 'src/__tests__/utils-for-testing/initial-states';
const chrome = require('chrome-mock');
global.chrome = chrome;
jest.setTimeout(10000);
let fakeStore = getFakeStore(initialStateWAccountsWActiveAccountStore);
const wrapperStore: FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Provider store={fakeStore}>{children}</Provider>;
};
beforeEach(() => {
  mocks.mocksApp({
    fixPopupOnMacOs: jest.fn(),
    getValueFromLocalStorage: jest
      .fn()
      .mockImplementation(mocks.getValuefromLS),
    getCurrentRpc: fakeData.rpc.fake,
    activeAccountUsername: utilsT.userData.username,
    getRCMana: fakeData.manabar.manabarMin,
    getAccounts: fakeData.accounts.extendedAccountMin,
    rpcStatus: true,
    setRpc: jest.fn(),
    chromeSendMessage: jest.fn(),
    hasStoredAccounts: true,
    mkLocal: fakeData.mk.empty,
    getAccountsFromLocalStorage: fakeData.accounts.twoAccounts,
    hasVotedForProposal: false,
    voteForKeychainProposal: jest.fn(),
    chromeTabsCreate: jest.fn(),
    i18nGetMessage: jest.fn().mockImplementation(mocks.i18nGetMessage),
    saveValueInLocalStorage: jest.fn(),
    clearLocalStorage: jest.fn(),
    removeFromLocalStorage: jest.fn(),
  });
  mocks.mocksHome({
    getAccountValue: '100000',
    getPrices: fakeData.prices,
  });
  fakeStore = getFakeStore(initialStateWAccountsWActiveAccountStore);
});
afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

describe('sign-in.component.tsx tests:\n', () => {
  let spyMkUtilsLogin: jest.SpyInstance;
  beforeEach(() => {
    jest.useFakeTimers('legacy');
    act(() => {
      jest.advanceTimersByTime(4300);
    });
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    spyMkUtilsLogin.mockClear();
    spyMkUtilsLogin.mockRestore();
    cleanup();
  });
  it('Must show error message after pressing enter', async () => {
    spyMkUtilsLogin = jest.spyOn(MkUtils, 'login').mockResolvedValueOnce(false);
    render(<App />, { wrapper: wrapperStore });
    const inputPasswordComponent = (await screen.findByLabelText(
      al.input.password,
    )) as HTMLInputElement;
    expect(inputPasswordComponent.value).toBe('');
    await act(async () => {
      await userEventPendingTimers.type(
        inputPasswordComponent,
        'incorrect_password{enter}',
      );
    });
    expect(spyMkUtilsLogin).toBeCalledTimes(1);
    expect(inputPasswordComponent.value).toBe('incorrect_password');
    await waitFor(() => {
      expect(screen.getByText(fakeData.messages.wrongPassword)).toBeDefined();
    });
  });

  it('Must show error message after clicking submit', async () => {
    spyMkUtilsLogin = jest.spyOn(MkUtils, 'login').mockResolvedValueOnce(false);
    render(<App />, { wrapper: wrapperStore });
    const inputPasswordComponent = (await screen.findByLabelText(
      al.input.password,
    )) as HTMLInputElement;
    const loginButtonComponent = (await screen.findByLabelText(
      al.button.login,
    )) as HTMLButtonElement;
    expect(inputPasswordComponent.value).toBe('');
    await act(async () => {
      await userEventPendingTimers.type(
        inputPasswordComponent,
        'incorrect_password',
      );
      await userEventPendingTimers.click(loginButtonComponent);
    });
    expect(spyMkUtilsLogin).toBeCalledTimes(1);
    expect(inputPasswordComponent.value).toBe('incorrect_password');
    await waitFor(() => {
      expect(screen.getByText(fakeData.messages.wrongPassword)).toBeDefined();
    });
  });

  it('Must navigate to home page when pressing enter key', async () => {
    mocks.mocksTopBar({
      hasReward: false,
    });
    spyMkUtilsLogin = jest.spyOn(MkUtils, 'login').mockResolvedValueOnce(true);
    render(<App />, { wrapper: wrapperStore });
    const inputPasswordComponent = (await screen.findByLabelText(
      al.input.password,
    )) as HTMLInputElement;
    expect(inputPasswordComponent.value).toBe('');
    await act(async () => {
      await userEventPendingTimers.type(
        inputPasswordComponent,
        'correct_password{enter}',
      );
    });
    expect(spyMkUtilsLogin).toBeCalledTimes(1);
    expect(inputPasswordComponent.value).toBe('correct_password');
    await waitFor(() => {
      expect(screen.getByLabelText(al.logo.loading)).toBeDefined();
    });
    act(() => {
      jest.runOnlyPendingTimers();
    });
    await waitFor(() => {
      expect(screen.getByText(utilsT.userData.username)).toBeDefined();
    });
  });

  it('Must navigate to home page when clicking submit button', async () => {
    mocks.mocksTopBar({
      hasReward: false,
    });
    spyMkUtilsLogin = jest.spyOn(MkUtils, 'login').mockResolvedValueOnce(true);
    render(<App />, { wrapper: wrapperStore });
    const inputPasswordComponent = (await screen.findByLabelText(
      al.input.password,
    )) as HTMLInputElement;
    const loginButtonComponent = (await screen.findByLabelText(
      al.button.login,
    )) as HTMLButtonElement;
    expect(inputPasswordComponent.value).toBe('');
    await act(async () => {
      await userEventPendingNoAutoClose.type(
        inputPasswordComponent,
        'correct_password',
      );
    });
    await act(async () => {
      await userEventPendingTimers.click(loginButtonComponent);
    });
    expect(spyMkUtilsLogin).toBeCalledTimes(1);
    expect(inputPasswordComponent.value).toBe('correct_password');
    await waitFor(() => {
      expect(screen.getByLabelText(al.logo.loading)).toBeDefined();
    });
    act(() => {
      jest.runOnlyPendingTimers();
    });
    await waitFor(() => {
      expect(screen.getByText(utilsT.userData.username)).toBeDefined();
    });
  });
});
