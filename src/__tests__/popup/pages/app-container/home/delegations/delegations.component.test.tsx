//TODO fix and finish.
// import App from '@popup/App';
// import '@testing-library/jest-dom';
// import { act, cleanup, screen } from '@testing-library/react';
// import React from 'react';
// import HiveUtils from 'src/utils/hive.utils';
// import al from 'src/__tests__/utils-for-testing/end-to-end-aria-labels';
// import fakeData from 'src/__tests__/utils-for-testing/end-to-end-data';
// import { userEventPendingTimers } from 'src/__tests__/utils-for-testing/end-to-end-events';
// import mockPreset, {
//   MockPreset,
// } from 'src/__tests__/utils-for-testing/end-to-end-mocks-presets';
// import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
// import { customRender } from 'src/__tests__/utils-for-testing/renderSetUp';

// const chrome = require('chrome-mock');
// global.chrome = chrome;
// jest.setTimeout(10000);
// const mk = fakeData.mk.userData1;
// const accounts = fakeData.accounts.twoAccounts;

// describe('delegations.component tests:\n', () => {
//   afterEach(() => {
//     jest.runOnlyPendingTimers();
//     jest.useRealTimers();
//     cleanup();
//   });
//   describe('handling errors on load:\n', () => {
//     beforeEach(async () => {
//       jest.useFakeTimers('legacy');
//       act(() => {
//         jest.advanceTimersByTime(4300);
//       });
//       mockPreset.load(MockPreset.ERRORDELEGATIONS, mk, accounts).preset;
//       customRender(<App />, {
//         initialState: { mk: mk, accounts: accounts } as RootState,
//       });
//       expect(await screen.findByText(mk)).toBeDefined();
//       await act(async () => {
//         await userEventPendingTimers.click(
//           screen.getByLabelText(al.dropdown.arrow.hp),
//         );
//       });
//       await act(async () => {
//         await userEventPendingTimers.click(
//           screen.getByLabelText(al.dropdown.span.delegations),
//         );
//       });

//       const state = {
//         mk: '',
//         accounts: [],
//         activeAccount: {},
//         activeRpc: {},
//       } as RootState;
//     });
//     it('Must load delegations page, and show error', async () => {
//       expect(
//         await screen.findByLabelText(al.component.delegationsPage),
//       ).toBeInTheDocument();
//       expect(
//         await screen.findByText(fakeData.messages.error.delegations.incoming),
//       ).toBeInTheDocument();
//     });
//   });
//   describe('no errors on load:\n', () => {
//     beforeEach(async () => {
//       jest.useFakeTimers('legacy');
//       act(() => {
//         jest.advanceTimersByTime(4300);
//       });
//       mockPreset.load(MockPreset.HOMEDEFAULT, mk, accounts).preset;
//       customRender(<App />, {
//         initialState: { mk: mk, accounts: accounts } as RootState,
//       });
//       expect(await screen.findByText(mk)).toBeDefined();
//       await act(async () => {
//         await userEventPendingTimers.click(
//           screen.getByLabelText(al.dropdown.arrow.hp),
//         );
//       });
//       await act(async () => {
//         await userEventPendingTimers.click(
//           screen.getByLabelText(al.dropdown.span.delegations),
//         );
//       });
//     });
//     it('Must navigate to delegations page', () => {
//       expect(
//         screen.getByLabelText(al.component.delegationsPage),
//       ).toBeInTheDocument();
//     });
//     it('Must navigate to INCOMING_OUTGOING_PAGE when clicking incomming', async () => {
//       await act(async () => {
//         await userEventPendingTimers.click(
//           screen.getByLabelText(al.button.delegations.total.incoming),
//         );
//       });
//       expect(
//         screen.getByLabelText(al.component.incomingOutgoingPage),
//       ).toBeInTheDocument();
//       expect(screen.getByText('Total Incoming')).toBeInTheDocument();
//     });
//     it('Must navigate to INCOMING_OUTGOING_PAGE when clicking outcomming', async () => {
//       await act(async () => {
//         await userEventPendingTimers.click(
//           screen.getByLabelText(al.button.delegations.total.outgoing),
//         );
//       });
//       expect(
//         screen.getByLabelText(al.component.incomingOutgoingPage),
//       ).toBeInTheDocument();
//       expect(screen.getByText('Total Outgoing')).toBeInTheDocument();
//     });
//     it('Must navigate to INCOMING_OUTGOING_PAGE, and go back when clicking on back icon', async () => {
//       await act(async () => {
//         await userEventPendingTimers.click(
//           screen.getByLabelText(al.button.delegations.total.incoming),
//         );
//       });
//       expect(
//         screen.getByLabelText(al.component.incomingOutgoingPage),
//       ).toBeInTheDocument();
//       await act(async () => {
//         await userEventPendingTimers.click(
//           screen.getByLabelText(al.icon.arrowBack),
//         );
//       });
//       expect(
//         screen.getByLabelText(al.component.delegationsPage),
//       ).toBeInTheDocument();
//     });
//     it('Must set delegation amount to max when pressing max button', async () => {
//       await act(async () => {
//         await userEventPendingTimers.click(
//           screen.getByLabelText(al.button.setToMax),
//         );
//       });
//       const inputAmount = screen.getByLabelText(
//         al.input.amount,
//       ) as HTMLInputElement;
//       expect(inputAmount.value).toBe('0.459');
//     });
//     it('Must show error if wrong requested value', async () => {
//       await act(async () => {
//         await userEventPendingTimers.type(
//           screen.getByLabelText(al.input.username),
//           'theghost1980',
//         );
//         await userEventPendingTimers.type(
//           screen.getByLabelText(al.input.amount),
//           '1000',
//         );
//         await userEventPendingTimers.click(
//           screen.getByLabelText(al.button.operation.delegate.submit),
//         );
//       });
//       expect(
//         await screen.findByText(fakeData.messages.error.greaterThan),
//       ).toBeInTheDocument();
//     });
//     it('Must show error when delegation fails', async () => {
//       HiveUtils.delegateVestingShares = jest.fn().mockResolvedValue(false);
//       await act(async () => {
//         await userEventPendingTimers.type(
//           screen.getByLabelText(al.input.username),
//           'theghost1980',
//         );
//         await userEventPendingTimers.type(
//           screen.getByLabelText(al.input.amount),
//           '0.1',
//         );
//         await userEventPendingTimers.click(
//           screen.getByLabelText(al.button.operation.delegate.submit),
//         );
//       });
//       await act(async () => {
//         await userEventPendingTimers.click(
//           screen.getByLabelText(al.button.dialog.confirm),
//         );
//       });
//       expect(
//         await screen.findByText(fakeData.messages.error.delegations.failed),
//       ).toBeInTheDocument();
//     });
//     it('Must navigate to confirmation page and go back when pressing cancel', async () => {
//       await act(async () => {
//         await userEventPendingTimers.type(
//           screen.getByLabelText(al.input.username),
//           'theghost1980',
//         );
//         await userEventPendingTimers.type(
//           screen.getByLabelText(al.input.amount),
//           '0.1',
//         );
//         await userEventPendingTimers.click(
//           screen.getByLabelText(al.button.operation.delegate.submit),
//         );
//       });
//       expect(
//         screen.getByLabelText(al.component.confirmationPage),
//       ).toBeInTheDocument();
//       await act(async () => {
//         await userEventPendingTimers.click(
//           screen.getByLabelText(al.button.dialog.cancel),
//         );
//       });
//       expect(
//         screen.getByLabelText(al.component.delegationsPage),
//       ).toBeInTheDocument();
//     });
//     it('Must navigate to home page after successful delegation and show message', async () => {
//       HiveUtils.delegateVestingShares = jest.fn().mockResolvedValue(true);
//       await act(async () => {
//         await userEventPendingTimers.type(
//           screen.getByLabelText(al.input.username),
//           'theghost1980',
//         );
//         await userEventPendingTimers.type(
//           screen.getByLabelText(al.input.amount),
//           '0.1',
//         );
//         await userEventPendingTimers.click(
//           screen.getByLabelText(al.button.operation.delegate.submit),
//         );
//       });
//       await act(async () => {
//         await userEventPendingTimers.click(
//           screen.getByLabelText(al.button.dialog.confirm),
//         );
//       });
//       expect(
//         await screen.findByText(fakeData.messages.success.delegation),
//       ).toBeInTheDocument();
//       expect(
//         await screen.findByLabelText(al.component.homePage),
//       ).toBeInTheDocument();
//     });
//     it('Must cancel a delegation when submitting with 0 HP value, show message and navigate to home', async () => {
//       HiveUtils.delegateVestingShares = jest.fn().mockResolvedValue(true);
//       await act(async () => {
//         await userEventPendingTimers.type(
//           screen.getByLabelText(al.input.username),
//           'theghost1980',
//         );
//         await userEventPendingTimers.click(
//           screen.getByLabelText(al.button.operation.delegate.submit),
//         );
//       });
//       await act(async () => {
//         await userEventPendingTimers.click(
//           screen.getByLabelText(al.button.dialog.confirm),
//         );
//       });
//       expect(
//         await screen.findByText(fakeData.messages.success.delegationCanceled),
//       ).toBeInTheDocument();
//       expect(
//         await screen.findByLabelText(al.component.homePage),
//       ).toBeInTheDocument();
//     });
//     it('Must show message if cancellation fails', async () => {
//       HiveUtils.delegateVestingShares = jest.fn().mockResolvedValue(false);
//       await act(async () => {
//         await userEventPendingTimers.type(
//           screen.getByLabelText(al.input.username),
//           'theghost1980',
//         );
//         await userEventPendingTimers.click(
//           screen.getByLabelText(al.button.operation.delegate.submit),
//         );
//       });
//       await act(async () => {
//         await userEventPendingTimers.click(
//           screen.getByLabelText(al.button.dialog.confirm),
//         );
//       });
//       expect(
//         await screen.findByText(
//           fakeData.messages.error.delegations.failedCancelation,
//         ),
//       ).toBeInTheDocument();
//     });
//   });
// });

export {};
