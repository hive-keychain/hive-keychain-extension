import { Asset } from '@hiveio/dhive';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Rpc } from '@interfaces/rpc.interface';
import App from '@popup/App';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { FC } from 'react';
import { Provider } from 'react-redux';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import MkUtils from 'src/utils/mk.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialStateWAccountsWActiveAccountStore } from 'src/__tests__/utils-for-testing/initial-states';
import customMocks from 'src/__tests__/utils-for-testing/mocks';

const chrome = require('chrome-mock');
global.chrome = chrome;
jest.setTimeout(10000);
let fakeStore = getFakeStore(initialStateWAccountsWActiveAccountStore);
const wrapperStore: FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Provider store={fakeStore}>{children}</Provider>;
};

const inputPasswordAL = 'password-input';
const loginButtonAL = 'login-button';
const wrongPasswordMessage = 'Wrong password!';
const loadingLogoAL = 'loading-logo';
const rpc = { uri: 'https://hived.privex.io/', testnet: false } as Rpc;
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
beforeEach(() => {
  customMocks.mocks.mocksApp(
    jest.fn(),
    customMocks.implementation.getValuefromLS,
    rpc,
    utilsT.userData.username,
    fakeManaBarResponse,
    fakeExtendedAccountResponse,
    true,
    jest.fn(),
    jest.fn(),
    true,
    '',
    accounts,
    false,
    jest.fn(),
    jest.fn(),
    customMocks.implementation.i18nGetMessage,
  );
  customMocks.mocks.mocksHome(fakeGetPricesResponse, '100000');
  fakeStore = getFakeStore(initialStateWAccountsWActiveAccountStore);
  //console.log(fakeStore.getState());
  //render(<App />, { wrapper: wrapperStore });
});
afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

describe('sign-in.component.tsx tests:\n', () => {
  describe('Using fake timers:\n', () => {
    let spyMkUtilsLogin: jest.SpyInstance;
    beforeEach(() => {
      jest.useFakeTimers('legacy'); //this way it handles native cleanUp of timers in code
      act(() => {
        jest.advanceTimersByTime(4300); //initially working with 4300(3100 + 100 + 1000 + 100)
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
      //duration test: 21, 20 seconds
      spyMkUtilsLogin = jest
        .spyOn(MkUtils, 'login')
        .mockResolvedValueOnce(false);
      render(<App />, { wrapper: wrapperStore });
      const inputPasswordComponent = (await screen.findByLabelText(
        inputPasswordAL,
      )) as HTMLInputElement;
      expect(inputPasswordComponent.value).toBe('');
      await act(async () => {
        await userEvent.type(
          inputPasswordComponent,
          'incorrect_password{enter}',
          {
            advanceTimers: () => jest.runOnlyPendingTimers(),
          },
        );
      });
      expect(spyMkUtilsLogin).toBeCalledTimes(1);
      expect(inputPasswordComponent.value).toBe('incorrect_password');
      await waitFor(() => {
        expect(screen.getByText(wrongPasswordMessage)).toBeDefined();
      });
    });

    it('Must show error message after clicking submit', async () => {
      //duration test: 21, 20 seconds.
      spyMkUtilsLogin = jest
        .spyOn(MkUtils, 'login')
        .mockResolvedValueOnce(false);
      render(<App />, { wrapper: wrapperStore });
      const inputPasswordComponent = (await screen.findByLabelText(
        inputPasswordAL,
      )) as HTMLInputElement;
      const loginButtonComponent = (await screen.findByLabelText(
        loginButtonAL,
      )) as HTMLButtonElement;
      expect(inputPasswordComponent.value).toBe('');
      await act(async () => {
        await userEvent.type(inputPasswordComponent, 'incorrect_password', {
          advanceTimers: () => jest.runOnlyPendingTimers(),
        });
        await userEvent.click(loginButtonComponent, {
          advanceTimers: () => jest.runOnlyPendingTimers(),
        });
      });
      expect(spyMkUtilsLogin).toBeCalledTimes(1);
      expect(inputPasswordComponent.value).toBe('incorrect_password');
      await waitFor(() => {
        expect(screen.getByText(wrongPasswordMessage)).toBeDefined();
      });
    });

    it('Must navigate to home page when pressing enter key', async () => {
      //duration: 20 seconds.
      customMocks.mocks.mocksTopBar(false);
      spyMkUtilsLogin = jest
        .spyOn(MkUtils, 'login')
        .mockResolvedValueOnce(true);
      render(<App />, { wrapper: wrapperStore });
      const inputPasswordComponent = (await screen.findByLabelText(
        inputPasswordAL,
      )) as HTMLInputElement;
      expect(inputPasswordComponent.value).toBe('');
      await act(async () => {
        await userEvent.type(
          inputPasswordComponent,
          'correct_password{enter}',
          {
            advanceTimers: () => jest.runOnlyPendingTimers(),
          },
        );
      });
      expect(spyMkUtilsLogin).toBeCalledTimes(1);
      expect(inputPasswordComponent.value).toBe('correct_password');
      await waitFor(() => {
        expect(screen.getByLabelText(loadingLogoAL)).toBeDefined();
      });
      //to look deeper after loading has finished.
      act(() => {
        //execute the loading interval + rerender
        jest.runOnlyPendingTimers();
      });
      await waitFor(() => {
        expect(screen.getByText(utilsT.userData.username)).toBeDefined();
      });
    });

    it('Must navigate to home page when clicking submit button', async () => {
      //duration: 20 seconds.
      customMocks.mocks.mocksTopBar(false);
      LocalStorageUtils.saveValueInLocalStorage = jest.fn(); //no implentation
      spyMkUtilsLogin = jest
        .spyOn(MkUtils, 'login')
        .mockResolvedValueOnce(true);
      render(<App />, { wrapper: wrapperStore });
      const inputPasswordComponent = (await screen.findByLabelText(
        inputPasswordAL,
      )) as HTMLInputElement;
      const loginButtonComponent = (await screen.findByLabelText(
        loginButtonAL,
      )) as HTMLButtonElement;
      expect(inputPasswordComponent.value).toBe('');
      await act(async () => {
        await userEvent.type(inputPasswordComponent, 'correct_password', {
          advanceTimers: () => jest.runOnlyPendingTimers(),
          skipAutoClose: true,
        });
      });
      await act(async () => {
        await userEvent.click(loginButtonComponent, {
          advanceTimers: () => jest.runOnlyPendingTimers(),
        });
      });
      expect(spyMkUtilsLogin).toBeCalledTimes(1);
      expect(inputPasswordComponent.value).toBe('correct_password');
      await waitFor(() => {
        expect(screen.getByLabelText(loadingLogoAL)).toBeDefined();
      });
      //to look deeper after loading has finished.
      act(() => {
        //execute the loading interval + rerender
        jest.runOnlyPendingTimers();
      });
      await waitFor(() => {
        expect(screen.getByText(utilsT.userData.username)).toBeDefined();
      });
    });
  });
});
