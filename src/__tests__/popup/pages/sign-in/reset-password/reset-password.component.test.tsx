//TODO fix and finish.
// import App from '@popup/App';
// import { act, cleanup, screen, waitFor } from '@testing-library/react';
// import React from 'react';
// import al from 'src/__tests__/utils-for-testing/end-to-end-aria-labels';
// import fakeData from 'src/__tests__/utils-for-testing/end-to-end-data';
// import { userEventPendingTimers } from 'src/__tests__/utils-for-testing/end-to-end-events';
// import mocks from 'src/__tests__/utils-for-testing/end-to-end-mocks';
// import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
// import { customRender } from 'src/__tests__/utils-for-testing/renderSetUp';

// const chrome = require('chrome-mock');
// global.chrome = chrome;
// jest.setTimeout(10000);

// describe('reset-password.component tests:\n', () => {
//   beforeEach(async () => {
//     mocks.mocksApp({
//       fixPopupOnMacOs: jest.fn(),
//       getValueFromLocalStorage: jest
//         .fn()
//         .mockImplementation(mocks.getValuefromLS),
//       getCurrentRpc: fakeData.rpc.fake,
//       activeAccountUsername: fakeData.mk.empty,
//       getRCMana: fakeData.manabar.manabarMin,
//       getAccounts: fakeData.accounts.extendedAccountMin,
//       rpcStatus: true,
//       setRpc: jest.fn(),
//       chromeSendMessage: jest.fn(),
//       hasStoredAccounts: true,
//       mkLocal: fakeData.mk.empty,
//       getAccountsFromLocalStorage: fakeData.accounts.twoAccounts,
//       hasVotedForProposal: false,
//       voteForKeychainProposal: jest.fn(),
//       chromeTabsCreate: jest.fn(),
//       i18nGetMessage: jest.fn().mockImplementation(mocks.i18nGetMessage),
//       saveValueInLocalStorage: jest.fn(),
//       clearLocalStorage: jest.fn(),
//       removeFromLocalStorage: jest.fn(),
//     });
//     mocks.mocksHome({
//       getPrices: fakeData.prices,
//       getAccountValue: '100000',
//     });
//     mocks.mocksTopBar({
//       hasReward: false,
//     });
//     jest.useFakeTimers('legacy');
//     act(() => {
//       jest.advanceTimersByTime(4300);
//     });
//   });
//   afterEach(() => {
//     jest.runOnlyPendingTimers();
//     jest.useRealTimers();
//     cleanup();
//   });
//   it.skip('Must clear all user data and navigate to sign up page', async () => {
//     //TODO waiting for modifications on AccountUtils.clearAllData() in store.dispatch
//     let divResetPassword: HTMLElement;
//     let confirmResetPasswordButton: HTMLElement;
//     customRender(<App />, {
//       initialState: initialEmptyStateStore,
//     });
//     divResetPassword = (await screen.findByLabelText(
//       al.link.resetPassword,
//     )) as HTMLElement;
//     expect(divResetPassword).toBeDefined();
//     await act(async () => {
//       await userEventPendingTimers.click(divResetPassword);
//     });
//     confirmResetPasswordButton = screen.getByLabelText(
//       al.button.confirmResetPassword,
//     ) as HTMLElement;
//     await act(async () => {
//       await userEventPendingTimers.click(confirmResetPasswordButton);
//     });
//     await waitFor(() => {
//       expect(screen.getByLabelText(al.component.signUp)).toBeDefined();
//     });
//   });
//   it('Must cancel and return to previous window', async () => {
//     let divResetPassword: HTMLElement;
//     let arrowBackSpan: HTMLElement;
//     customRender(<App />, {
//       initialState: initialEmptyStateStore,
//     });
//     await waitFor(() => {
//       divResetPassword = screen.getByLabelText(
//         al.link.resetPassword,
//       ) as HTMLElement;
//     });
//     expect(divResetPassword!).toBeDefined();
//     await act(async () => {
//       await userEventPendingTimers.click(divResetPassword);
//     });
//     expect(screen.getByText(fakeData.messages.introductionText)).toBeDefined();
//     arrowBackSpan = screen.getByLabelText(al.icon.arrowBack) as HTMLElement;
//     await act(async () => {
//       await userEventPendingTimers.click(arrowBackSpan);
//     });
//     await waitFor(() => {
//       expect(screen.getByLabelText(al.link.resetPassword)).toBeDefined();
//     });
//   });
// });

describe('To remove after fixing this file', () => {
  it('Must be removed after fixing', () => {});
});

export {};
