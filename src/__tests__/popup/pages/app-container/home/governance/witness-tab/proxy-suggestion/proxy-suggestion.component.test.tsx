//TODO fix and finish
// import KeychainApi from '@api/keychain';
// import { ExtendedAccount } from '@hiveio/dhive';
// import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
// import App from '@popup/App';
// import { Proposal } from '@popup/pages/app-container/home/governance/proposal-tab/proposal-tab.component';
// import '@testing-library/jest-dom';
// import { act, cleanup, screen, waitFor } from '@testing-library/react';
// import React from 'react';
// import HiveUtils from 'src/utils/hive.utils';
// import LocalStorageUtils from 'src/utils/localStorage.utils';
// import ProposalUtils from 'src/utils/proposal.utils';
// import ProxyUtils from 'src/utils/proxy.utils';
// import BlockchainTransactionUtils from 'src/utils/tokens.utils';
// import WitnessUtils from 'src/utils/witness.utils';
// import al from 'src/__tests__/utils-for-testing/end-to-end-aria-labels';
// import fakeData from 'src/__tests__/utils-for-testing/end-to-end-data';
// import { userEventPendingTimers } from 'src/__tests__/utils-for-testing/end-to-end-events';
// import mocks from 'src/__tests__/utils-for-testing/end-to-end-mocks';
// import mockPreset, {
//   MockPreset,
// } from 'src/__tests__/utils-for-testing/end-to-end-mocks-presets';
// import { Tab } from 'src/__tests__/utils-for-testing/enums/enums';
// import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
// import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
// import { customRender } from 'src/__tests__/utils-for-testing/renderSetUp';

// // TODO: create an arrow function as await userClicks([al1, al2, ...]) so you can reduce this kind of calls
// //            -> place this on e2e-events.

// //separate into each file for each.
// //  try to separate the main cases, in example:
// //    - load with errors
// //    - load no errors
// //    -> separate each section to its own file,
// //      -> subfolder
// //    -> then load that into the place it should be, making the code smaller + more readable.

// const chrome = require('chrome-mock');
// global.chrome = chrome;
// jest.setTimeout(10000);
// const mk = fakeData.mk.userData1;
// const accounts = fakeData.accounts.twoAccounts;
// const arcangeLink = 'https://hive.arcange.eu/witnesses/';
// const inactiveKey = 'STM1111111111111111111111111111111114T1Anm';
// const fakeWitnessesRankingWInactive = {
//   data: [
//     ...utilsT.fakeWitnessesRankingResponse.data,
//     {
//       name: 'theghost1980',
//       rank: '200',
//       votes: '1000',
//       votes_count: 1000,
//       signing_key: inactiveKey,
//       url: 'https://saturnoman.com',
//     },
//   ],
// };
// const extendedAccountFullNoProxy = [
//   {
//     ...fakeData.accounts.extendedAccountFull[0],
//     proxy: '',
//     witnesses_voted_for: 0,
//   } as ExtendedAccount,
// ];
// const extendedAccountFullWProxy = [
//   {
//     ...fakeData.accounts.extendedAccountFull[0],
//     proxy: 'keychain',
//   },
// ];
// const onlyActiveWitnesses = fakeWitnessesRankingWInactive.data.filter(
//   (item) => item.signing_key !== inactiveKey,
// );

// let customRerender: (
//   ui: React.ReactElement<any, string | React.JSXElementConstructor<any>>,
// ) => void;
// let containerRender: HTMLElement;
// let spyChromeTabs: jest.SpyInstance;
// // beforeEach(() => {
// //   // jest.useFakeTimers('legacy');
// //   // act(() => {
// //   //   jest.advanceTimersByTime(4300);
// //   // });
// // });
// afterEach(() => {
//   jest.runOnlyPendingTimers();
//   jest.useRealTimers();
//   cleanup();
//   spyChromeTabs.mockClear();
//   spyChromeTabs.mockReset();
// });
// describe('governance.component tests:\n', () => {
//   const gotoTab = async (tab: Tab) => {
//     await userEventPendingTimers.click(
//       screen.getByLabelText(al.button.actionBtn.governance),
//     );
//     await userEventPendingTimers.click(screen.getAllByRole('tab')[tab]);
//   };

//   describe('Proxy section:\n', () => {
//     const mocksDefault = () => {
//       mockPreset.load(MockPreset.HOMEDEFAULT, mk, accounts).preset;
//       //just overwrited for now
//       chrome.i18n.getMessage = jest
//         .fn()
//         .mockImplementation(mocks.i18nGetMessageCustom);
//       KeychainApi.get = jest
//         .fn()
//         .mockResolvedValue(fakeWitnessesRankingWInactive);
//       HiveUtils.getClient().database.getAccounts = jest
//         .fn()
//         .mockResolvedValue(extendedAccountFullNoProxy);
//       LocalStorageUtils.getValueFromLocalStorage = jest
//         .fn()
//         .mockResolvedValue(null);
//       //end overwrited
//       spyChromeTabs = jest.spyOn(chrome.tabs, 'create');
//     };
//     describe('Empty proxy', () => {
//       beforeEach(async () => {
//         jest.useFakeTimers('legacy');
//         act(() => {
//           jest.advanceTimersByTime(4300);
//         });
//         mocksDefault();
//         ProxyUtils.findUserProxy = jest.fn().mockResolvedValue(null);
//         const { rerender, container } = customRender(<App />, {
//           initialState: { mk: mk, accounts: accounts } as RootState,
//         });
//         //customRerender = rerender;
//         containerRender = container;
//         expect(await screen.findByText(mk)).toBeDefined();
//       });
//       describe('Proxy suggestion tests:\n', () => {
//         it('Must show proxy suggestion after homepage loads', async () => {
//           expect(
//             screen.getByLabelText(al.component.proxySuggestion),
//           ).toBeInTheDocument();
//         });
//         it('Must set @keychain as proxy', async () => {
//           const successMessage = mocks.i18nGetMessageCustom(
//             'popup_success_proxy',
//             ['keychain'],
//           );
//           WitnessUtils.setAsProxy = jest.fn().mockResolvedValue(true);
//           await act(async () => {
//             await userEventPendingTimers.click(
//               screen.getByLabelText(al.button.operation.proxySuggestion.ok),
//             );
//           });
//           await waitFor(() => {
//             expect(screen.getByText(successMessage)).toBeInTheDocument();
//           });
//         });
//         it('Must close suggestion after clicking close', async () => {
//           LocalStorageUtils.getValueFromLocalStorage = jest
//             .fn()
//             .mockResolvedValue({ 'keychain.tests': true });
//           LocalStorageUtils.saveValueInLocalStorage = jest.fn();
//           await act(async () => {
//             await userEventPendingTimers.click(
//               screen.getByLabelText(al.button.panel.close),
//             );
//           });
//           await waitFor(() => {
//             expect(
//               containerRender.getElementsByClassName('proxy-suggestion hide')
//                 .length,
//             ).toBe(1);
//           });
//         });
//         it('Must show error if suggestion operations fails by HIVE', async () => {
//           const errorMessage = mocks.i18nGetMessageCustom('popup_error_proxy', [
//             'keychain',
//           ]);
//           WitnessUtils.setAsProxy = jest.fn().mockResolvedValue(false);
//           await act(async () => {
//             await userEventPendingTimers.click(
//               screen.getByLabelText(al.button.operation.proxySuggestion.ok),
//             );
//           });
//           await waitFor(() => {
//             expect(screen.getByText(errorMessage)).toBeInTheDocument();
//           });
//         });
//       });
//     });
//   });
// });

describe('To remove after fixing this file', () => {
  it('Must be removed after fixing', () => {});
});

export {};
