import { Asset } from '@hiveio/dhive';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Rpc } from '@interfaces/rpc.interface';
import App from '@popup/App';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { FC } from 'react';
import { Provider } from 'react-redux';
import FormatUtils from 'src/utils/format.utils';
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

describe('sign-in.component.tsx tests:\n', () => {
  const inputPasswordAL = 'password-input';
  const loginButtonAL = 'login-button';
  const wrongPasswordMessage = 'Wrong password!';
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
    fakeStore = getFakeStore(initialStateWAccountsWActiveAccountStore);
    //render(<App />, { wrapper: wrapperStore });
  });
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  describe('Using real timers:\n', () => {
    test('Incorrect password must show error message after pressing enter', async () => {
      //user types the password and press enter key
      const spyMkUtilsLogin = jest
        .spyOn(MkUtils, 'login')
        .mockResolvedValueOnce(false);
      render(<App />, { wrapper: wrapperStore });
      const inputPasswordComponent = (await screen.findByLabelText(
        inputPasswordAL,
      )) as HTMLInputElement;
      await userEvent.type(inputPasswordComponent, 'incorrect_password{enter}');
      expect(inputPasswordComponent.value).toBe('incorrect_password');
      expect(spyMkUtilsLogin).toBeCalledTimes(1);
      await waitFor(() => {
        expect(screen.getByText(wrongPasswordMessage)).toBeDefined();
      });
      spyMkUtilsLogin.mockClear();
      spyMkUtilsLogin.mockRestore();
      cleanup();
    });

    test('Incorrect password must show error message after clicking submit', async () => {
      //user types the password and click button
      //specifics for this case
      const spyMkUtilsLogin = jest
        .spyOn(MkUtils, 'login')
        .mockResolvedValueOnce(false);
      render(<App />, { wrapper: wrapperStore });
      const inputPasswordComponent = (await screen.findByLabelText(
        inputPasswordAL,
      )) as HTMLInputElement;
      const loginButtonComponent = (await screen.findByLabelText(
        loginButtonAL,
      )) as HTMLButtonElement;
      await userEvent.type(inputPasswordComponent, 'incorrect_password');
      expect(inputPasswordComponent.value).toBe('incorrect_password');
      expect(loginButtonComponent).toBeDefined();
      await userEvent.click(loginButtonComponent);
      expect(spyMkUtilsLogin).toBeCalledTimes(1);
      await waitFor(() => {
        expect(screen.getByText(wrongPasswordMessage)).toBeDefined();
        //screen.debug();
      });
      spyMkUtilsLogin.mockClear();
      spyMkUtilsLogin.mockRestore();
      cleanup();
    });

    test('Must navigate to home page when pressing enter key', async () => {
      //needed waiting times as:
      // - refreshActiveAccount                         3100
      // - input component, handleOnBlur                200 (just called when user click)
      // - home component, useEffect -> turn loader off 1000

      //user types the password and press enter key
      //specifics to this  case
      const accountValue = '100000';
      customMocks.mocks.mocksHome(fakeGetPricesResponse, accountValue);
      //customMocks.mocks.mocksTopBar(false);
      FormatUtils.toHP = jest.fn().mockReturnValue(10);

      const spyMkUtilsLogin = jest
        .spyOn(MkUtils, 'login')
        .mockResolvedValueOnce(true);
      render(<App />, { wrapper: wrapperStore });
      const inputPasswordComponent = (await screen.findByLabelText(
        inputPasswordAL,
      )) as HTMLInputElement;
      await userEvent.type(inputPasswordComponent, 'correct_password{enter}');
      expect(inputPasswordComponent.value).toBe('correct_password');
      expect(spyMkUtilsLogin).toBeCalledTimes(1);
      expect(screen.getByLabelText('loading-logo')).toBeDefined();
      await waitFor(
        async () => {
          expect(screen.getByText(`$ ${accountValue} USD`)).toBeDefined();
          //expect(await screen.findByLabelText('loading-logo')).toBeDefined();
        },
        {
          timeout: 5500,
        },
      );
      spyMkUtilsLogin.mockClear();
      spyMkUtilsLogin.mockRestore();
      cleanup();
    });
  });

  // describe('Using fake timers:\n', () => {
  //   beforeEach(() => {
  //     jest.useFakeTimers();
  //   });
  //   afterEach(() => {});
  // });
});
