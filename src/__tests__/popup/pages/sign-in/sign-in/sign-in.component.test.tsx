import { LocalAccount } from '@interfaces/local-account.interface';
import { Rpc } from '@interfaces/rpc.interface';
import App from '@popup/App';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { FC } from 'react';
import { Provider } from 'react-redux';
import MkUtils from 'src/utils/mk.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import {
  initialEmptyStateStore,
  initialStateWAccountsWActiveAccountStore,
} from 'src/__tests__/utils-for-testing/initial-states';
import customMocks from 'src/__tests__/utils-for-testing/mocks';

const chrome = require('chrome-mock');
global.chrome = chrome;

afterEach(() => {
  jest.clearAllMocks();
});

////Important NOTES
/// - wrapper, app, then test the components.
/////

//to export to it own file
// let fakeStore = getFakeStore(initialEmptyStateStore);
// const wrapperStore = (component: JSX.Element): JSX.Element => {
//   return <Provider store={fakeStore}>{component}</Provider>;
// };
//end
describe('sign-in.component.tsx tests:\n', () => {
  const inputPasswordAL = 'password-input';
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
    },
  ];
  const fakeManaBarResponse = {
    current_mana: 1000,
    max_mana: 10000,
    percentage: 100,
  };
  let fakeStore = getFakeStore(initialEmptyStateStore);
  const wrapperStore: FC<{ children: React.ReactNode }> = ({ children }) => (
    <Provider store={fakeStore}>{children}</Provider>
  );

  test('Incorrect password must show error message', async () => {
    //user types the password and press enter key
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
    const spyMkUtilsLogin = jest
      .spyOn(MkUtils, 'login')
      .mockResolvedValueOnce(false);
    fakeStore = getFakeStore(initialStateWAccountsWActiveAccountStore);
    const { debug } = render(<App />, { wrapper: wrapperStore });
    await waitFor(() => {});
    const inputPasswordComponent = screen.getByLabelText(
      inputPasswordAL,
    ) as HTMLInputElement;
    fireEvent.change(inputPasswordComponent, {
      target: { value: 'incorrent_password' },
    });
    expect(inputPasswordComponent.value).toBe('incorrent_password');
    fireEvent.keyPress(inputPasswordComponent, {
      key: 'Enter',
      code: 13,
      charCode: 13,
    });
    await waitFor(() => {
      expect(spyMkUtilsLogin).toBeCalledTimes(1);
      expect(screen.getByText(wrongPasswordMessage)).toBeDefined();
    });
    spyMkUtilsLogin.mockClear();
    spyMkUtilsLogin.mockRestore();
  });
  // test('should first', async () => {
  //   //mocks needed on component
  //   chrome.i18n.getMessage = jest
  //     .fn()
  //     .mockImplementation(customMocks.implementation.i18nGetMessage);
  //   //end mocks
  //   //spies
  //   const spyMkUtilsLogin = jest
  //     .spyOn(MkUtils, 'login')
  //     .mockResolvedValueOnce(false);
  //   //end spies

  //   const utils = render(wrapperStore(<SignInComponent />));
  //   //utils.debug();
  //   const inputPasswordComponent = utils.getByLabelText(
  //     inputPasswordAL,
  //   ) as HTMLInputElement;
  //   //console.log(inputPasswordComponent);
  //   fireEvent.change(inputPasswordComponent, {
  //     target: { value: password },
  //   });
  //   expect(inputPasswordComponent.value).toBe(password);
  //   fireEvent.keyPress(inputPasswordComponent, {
  //     key: 'Enter',
  //     code: 13,
  //     charCode: 13,
  //   });
  //   expect(spyMkUtilsLogin).toBeCalledWith(password);
  //   await waitFor(() => {
  //     console.log(fakeStore.getState());
  //   });
  // });

  // test('constructing the app process to move into sign-in later', async () => {
  //   fakeStore = getFakeStore({
  //     ...initialEmptyStateStore,
  //     accounts: accounts,
  //     activeAccount: {
  //       account: {
  //         name: utilsT.userData.username,
  //       } as ExtendedAccount,
  //       keys: utilsT.keysUserData1,
  //       rc: {} as Manabar,
  //     },
  //   });
  //   // const wrapperStore: FC<{ children: React.ReactNode }> = ({ children }) => (
  //   //   <Provider store={fakeStore}>{children}</Provider>
  //   // );

  //   customMocks.mocks.mocksApp(
  //     jest.fn(),
  //     customMocks.implementation.getValuefromLS,
  //     rpc,
  //     utilsT.userData.username,
  //     fakeManaBarResponse,
  //     fakeExtendedAccountResponse,
  //     true,
  //     jest.fn(),
  //     jest.fn(),
  //     true,
  //     '',
  //     accounts,
  //     false,
  //     jest.fn(),
  //     jest.fn(),
  //   );
  //   //specific mocks & spies for this case
  //   chrome.i18n.getMessage = jest
  //     .fn()
  //     .mockImplementation(customMocks.implementation.i18nGetMessage);
  //   const spyLogin = jest.spyOn(MkUtils, 'login').mockResolvedValueOnce(false);
  //   //end specific

  //   // const { debug, rerender } = render(<App />, { wrapper: wrapperStore});

  //   const { debug } = render(<App />, { wrapper: wrapperStore });
  //   await waitFor(() => {});
  //   const inputPasswordComponent = screen.getByLabelText(
  //     inputPasswordAL,
  //   ) as HTMLInputElement;
  //   expect(inputPasswordComponent).toBeDefined();
  //   fireEvent.change(inputPasswordComponent, {
  //     target: { value: 'invalid_password' },
  //   });
  //   expect(inputPasswordComponent.value).toBe('invalid_password');
  //   fireEvent.keyPress(inputPasswordComponent, {
  //     key: 'Enter',
  //     code: 13,
  //     charCode: 13,
  //   });
  //   expect(await screen.findByText('Wrong password!')); //will also works because it awaits.
  //   expect(spyLogin).toBeCalledTimes(1);
  //   //working block 1 "waiting after an event that affects hooks & rendering is fired"
  //   // await waitFor(async () => {
  //   //   //everything inside this block will wait after renders & hooks to be executed properly
  //   //   expect(spyLogin).toBeCalledTimes(1);
  //   //   //const errorMessage = await screen.findByText('Wrong password!');
  //   //   const errorMessage = screen.getByText('Wrong password');
  //   //   expect(errorMessage).toBeDefined();
  //   // });
  //   //end working block 1

  //   ////working block 2
  //   // await waitFor( () => {});
  //   // expect(spyLogin).toBeCalledTimes(1);
  //   // const errorMessage = await screen.findByText('Wrong password!'); //works because has its own await.
  //   // //console.log(errorMessage);
  //   // expect(errorMessage).toBeDefined();
  //   // debug();
  //   ////end working block 2

  //   //debug();
  //   // await waitFor(() => {
  //   //   const inputPasswordComponent = screen.getByLabelText(
  //   //     inputPasswordAL,
  //   //   ) as HTMLInputElement;
  //   //   fireEvent.change(inputPasswordComponent, {
  //   //     target: { value: 'invalid_password' },
  //   //   });
  //   // });
  //   //debug();
  //   // await waitFor(async () => {
  //   //   const inputPasswordComponent = screen.getByLabelText(
  //   //     inputPasswordAL,
  //   //   ) as HTMLInputElement;
  //   //   fireEvent.keyPress(inputPasswordComponent, {
  //   //     key: 'Enter',
  //   //     code: 13,
  //   //     charCode: 13,
  //   //   });
  //   //   await waitFor(() => {
  //   //     expect(spyLogin).toBeCalledTimes(10);
  //   //   });
  //   //   //console.log(fakeStore.getState());
  //   // });
  //   // render(wrapperStore(<App />));
  //   // await waitFor(() => {
  //   //   const inputPasswordComponent = screen.getByLabelText(
  //   //     inputPasswordAL,
  //   //   ) as HTMLInputElement;
  //   //   expect(inputPasswordComponent).toBeDefined();
  //   //   //write password on input
  //   //   fireEvent.change(inputPasswordComponent, {
  //   //     target: { value: 'invalid_password' },
  //   //   });
  //   //   //check for value as set
  //   //   expect(inputPasswordComponent.value).toBe('invalid_password');
  //   // });
  // });
});
