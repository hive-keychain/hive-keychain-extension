//TODO fix and finish.
// import App from '@popup/App';
// import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
// import React, { FC } from 'react';
// import { Provider } from 'react-redux';
// import al from 'src/__tests__/utils-for-testing/end-to-end-aria-labels';
// import fakeData from 'src/__tests__/utils-for-testing/end-to-end-data';
// import { userEventPendingTimers } from 'src/__tests__/utils-for-testing/end-to-end-events';
// import mocks from 'src/__tests__/utils-for-testing/end-to-end-mocks';
// import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
// import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';

// const chrome = require('chrome-mock');
// global.chrome = chrome;
// jest.setTimeout(10000);
// let fakeStore = getFakeStore(initialEmptyStateStore);
// const wrapperStore: FC<{ children: React.ReactNode }> = ({ children }) => {
//   return <Provider store={fakeStore}>{children}</Provider>;
// };

// beforeEach(() => {
//   mocks.mocksApp({
//     fixPopupOnMacOs: jest.fn(),
//     getValueFromLocalStorage: jest
//       .fn()
//       .mockImplementation(mocks.getValuefromLS),
//     getCurrentRpc: fakeData.rpc.privex,
//     activeAccountUsername: fakeData.mk.empty,
//     getRCMana: fakeData.manabar.empty,
//     getAccounts: fakeData.accounts.emptyExtendedAccount,
//     rpcStatus: true,
//     setRpc: jest.fn(),
//     chromeSendMessage: jest.fn(),
//     hasStoredAccounts: false,
//     mkLocal: fakeData.mk.empty,
//     getAccountsFromLocalStorage: fakeData.accounts.emptyAccounts,
//     hasVotedForProposal: true,
//     voteForKeychainProposal: jest.fn(),
//     chromeTabsCreate: jest.fn(),
//     i18nGetMessage: jest.fn().mockImplementation(mocks.i18nGetMessage),
//     saveValueInLocalStorage: jest.fn(),
//     clearLocalStorage: jest.fn(),
//     removeFromLocalStorage: jest.fn(),
//   });
//   jest.useFakeTimers('legacy');
//   act(() => {
//     jest.advanceTimersByTime(4300);
//   });
// });
// afterEach(() => {
//   jest.runOnlyPendingTimers();
//   jest.useRealTimers();
//   cleanup();
// });
// describe('sign-up.component tests:\n', () => {
//   it('Must show sign-up page', async () => {
//     fakeStore = getFakeStore(initialEmptyStateStore);
//     render(<App />, { wrapper: wrapperStore });
//     const signUpComponent = (await screen.findByLabelText(
//       al.component.signUp,
//     )) as HTMLInputElement;
//     expect(signUpComponent).toBeDefined();
//   });
//   it('Must show error message when using different passwords and pressing enter', async () => {
//     fakeStore = getFakeStore(initialEmptyStateStore);
//     render(<App />, { wrapper: wrapperStore });
//     const passwordInputComponent = (await screen.findByLabelText(
//       al.input.password,
//     )) as HTMLInputElement;
//     const confirmationInputComponent = (await screen.findByLabelText(
//       al.component.inputConfirmation,
//     )) as HTMLInputElement;
//     await act(async () => {
//       await userEventPendingTimers.type(passwordInputComponent, '@1qEWqw!!');
//       await userEventPendingTimers.type(
//         confirmationInputComponent,
//         '@1qEWqw{enter}',
//       );
//     });
//     await waitFor(() => {
//       expect(screen.getByText(fakeData.messages.error.noMatch)).toBeDefined();
//     });
//   });
//   it('Must show error message when using different passwords and clicking button', async () => {
//     fakeStore = getFakeStore(initialEmptyStateStore);
//     render(<App />, { wrapper: wrapperStore });
//     const passwordInputComponent = (await screen.findByLabelText(
//       al.input.password,
//     )) as HTMLInputElement;
//     const confirmationInputComponent = (await screen.findByLabelText(
//       al.component.inputConfirmation,
//     )) as HTMLInputElement;
//     const signUpButtonComponent = (await screen.findByLabelText(
//       al.button.signUp,
//     )) as HTMLButtonElement;
//     await act(async () => {
//       await userEventPendingTimers.type(passwordInputComponent, '@1qEWqw!!');
//       await userEventPendingTimers.type(confirmationInputComponent, '@1qEWqw');
//       await userEventPendingTimers.click(signUpButtonComponent);
//     });
//     await waitFor(() => {
//       expect(screen.getByText(fakeData.messages.error.noMatch)).toBeDefined();
//     });
//   });
//   it('Must show error message when invalid password and pressing enter', async () => {
//     fakeStore = getFakeStore(initialEmptyStateStore);
//     render(<App />, { wrapper: wrapperStore });
//     const passwordInputComponent = (await screen.findByLabelText(
//       al.input.password,
//     )) as HTMLInputElement;
//     const confirmationInputComponent = (await screen.findByLabelText(
//       al.component.inputConfirmation,
//     )) as HTMLInputElement;
//     await act(async () => {
//       await userEventPendingTimers.type(passwordInputComponent, '1qEWqw');
//       await userEventPendingTimers.type(
//         confirmationInputComponent,
//         '1qEWqw{enter}',
//       );
//     });
//     await waitFor(() => {
//       expect(screen.getByText(fakeData.messages.error.invalid)).toBeDefined();
//     });
//   });
//   it('Must show error message when invalid password and clicking button', async () => {
//     fakeStore = getFakeStore(initialEmptyStateStore);
//     render(<App />, { wrapper: wrapperStore });
//     const passwordInputComponent = (await screen.findByLabelText(
//       al.input.password,
//     )) as HTMLInputElement;
//     const confirmationInputComponent = (await screen.findByLabelText(
//       al.component.inputConfirmation,
//     )) as HTMLInputElement;
//     const signUpButtonComponent = (await screen.findByLabelText(
//       al.button.signUp,
//     )) as HTMLButtonElement;
//     await act(async () => {
//       await userEventPendingTimers.type(passwordInputComponent, 'aAbcdswe');
//       await userEventPendingTimers.type(confirmationInputComponent, 'aAbcdswe');
//       await userEventPendingTimers.click(signUpButtonComponent);
//     });
//     await waitFor(() => {
//       expect(screen.getByText(fakeData.messages.error.invalid)).toBeDefined();
//     });
//   });
//   it('Must navigate to add_keys_page with valid password and pressing enter', async () => {
//     fakeStore = getFakeStore(initialEmptyStateStore);
//     render(<App />, { wrapper: wrapperStore });
//     const passwordInputComponent = (await screen.findByLabelText(
//       al.input.password,
//     )) as HTMLInputElement;
//     const confirmationInputComponent = (await screen.findByLabelText(
//       al.component.inputConfirmation,
//     )) as HTMLInputElement;
//     await act(async () => {
//       await userEventPendingTimers.type(passwordInputComponent, '1qEWqw23');
//       await userEventPendingTimers.type(
//         confirmationInputComponent,
//         '1qEWqw23{enter}',
//       );
//     });
//     await waitFor(() => {
//       expect(screen.getByLabelText(al.component.addAccountMain)).toBeDefined();
//     });
//   });
//   it('Must navigate to add_keys_page with valid password and clicking button', async () => {
//     fakeStore = getFakeStore(initialEmptyStateStore);
//     render(<App />, { wrapper: wrapperStore });
//     const passwordInputComponent = (await screen.findByLabelText(
//       al.input.password,
//     )) as HTMLInputElement;
//     const confirmationInputComponent = (await screen.findByLabelText(
//       al.component.inputConfirmation,
//     )) as HTMLInputElement;
//     const signUpButtonComponent = (await screen.findByLabelText(
//       al.button.signUp,
//     )) as HTMLButtonElement;
//     await act(async () => {
//       await userEventPendingTimers.type(passwordInputComponent, '1qEWqw23');
//       await userEventPendingTimers.type(confirmationInputComponent, '1qEWqw23');
//       await userEventPendingTimers.click(signUpButtonComponent);
//     });
//     await waitFor(() => {
//       expect(screen.getByLabelText(al.component.addAccountMain)).toBeDefined();
//     });
//   });
// });

describe('To remove after fixing this file', () => {
  it('Must be removed after fixing', () => {});
});

export {};
