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
//       describe('Proxy tab tests:\n', () => {
//         beforeEach(async () => {
//           // await act(async () => {
//           //   await userEventPendingTimers.click(
//           //     screen.getByLabelText(al.button.actionBtn.governance),
//           //   );
//           //   await userEventPendingTimers.click(screen.getAllByRole('tab')[1]);
//           // });
//           await gotoTab(Tab.PROXY);
//         });
//         it('Must show intro message', () => {
//           const introMessage = mocks.i18nGetMessageCustom(
//             'html_popup_witness_proxy_definition',
//           );
//           expect(screen.getByText(introMessage.trim())).toBeInTheDocument();
//         });
//         it('Must change the input username when typying', async () => {
//           const usernameInput = screen.getByLabelText(
//             al.input.username,
//           ) as HTMLInputElement;
//           expect(usernameInput.value).toBe('');
//           await act(async () => {
//             await userEventPendingTimers.type(
//               screen.getByLabelText(al.input.username),
//               'keychain',
//             );
//           });
//           expect(usernameInput.value).toBe('keychain');
//         });
//         it('Must clear the input when clicking clear icon', async () => {
//           const usernameInput = screen.getByLabelText(
//             al.input.username,
//           ) as HTMLInputElement;
//           await act(async () => {
//             await userEventPendingTimers.type(
//               screen.getByLabelText(al.input.username),
//               'keychain',
//             );
//           });
//           expect(usernameInput.value).toBe('keychain');
//           await act(async () => {
//             await userEventPendingTimers.click(
//               screen.getByLabelText(al.icon.input.clear),
//             );
//           });
//           expect(usernameInput.value).toBe('');
//         });
//         it('Must set proxy and show message', async () => {
//           const successMessage = mocks.i18nGetMessageCustom(
//             'popup_success_proxy',
//             ['keychain'],
//           );
//           WitnessUtils.setAsProxy = jest.fn().mockResolvedValueOnce(true);
//           await act(async () => {
//             await userEventPendingTimers.type(
//               screen.getByLabelText(al.input.username),
//               'keychain',
//             );
//             await userEventPendingTimers.click(
//               screen.getByLabelText(al.button.operation.proxy.tab.setAsProxy),
//             );
//           });
//           await waitFor(() => {
//             expect(screen.getByText(successMessage)).toBeInTheDocument();
//           });
//         });
//         it('Must show error when set proxy fails', async () => {
//           const errorMessage = mocks.i18nGetMessageCustom(
//             'html_popup_clear_proxy_error',
//           );
//           WitnessUtils.setAsProxy = jest.fn().mockResolvedValueOnce(false);
//           await act(async () => {
//             await userEventPendingTimers.type(
//               screen.getByLabelText(al.input.username),
//               'keychain',
//             );
//             await userEventPendingTimers.click(
//               screen.getByLabelText(al.button.operation.proxy.tab.setAsProxy),
//             );
//           });
//           await waitFor(() => {
//             expect(screen.getByText(errorMessage)).toBeInTheDocument();
//           });
//         });
//       });
//     });
//     describe('Initial proxy', () => {
//       const accountProxy = 'keychain';
//       beforeEach(async () => {
//         jest.useFakeTimers('legacy');
//         act(() => {
//           jest.advanceTimersByTime(4300);
//         });
//         mocksDefault();
//         ProxyUtils.findUserProxy = jest.fn().mockResolvedValue(accountProxy);
//         HiveUtils.getClient().database.getAccounts = jest
//           .fn()
//           .mockResolvedValue(extendedAccountFullWProxy);
//         const { rerender, container } = customRender(<App />, {
//           initialState: { mk: mk, accounts: accounts } as RootState,
//         });
//         //customRerender = rerender;
//         containerRender = container;
//         expect(await screen.findByText(mk)).toBeDefined();
//         await gotoTab(Tab.PROXY);
//       });
//       it('Must show intro message and current proxy account', () => {
//         const introMessage = mocks.i18nGetMessageCustom(
//           'html_popup_witness_has_proxy',
//         );
//         expect(screen.getByText(introMessage.trim())).toBeInTheDocument();
//         const divProxyName = screen.getByLabelText(
//           al.div.proxy.name,
//         ) as HTMLDivElement;
//         expect(divProxyName).toHaveTextContent(accountProxy);
//       });
//       it('Must remove proxy and show message', async () => {
//         const successMessage = mocks.i18nGetMessageCustom('bgd_ops_unproxy', [
//           `@${accountProxy}`,
//         ]);
//         WitnessUtils.removeProxy = jest.fn().mockResolvedValueOnce(true);
//         await act(async () => {
//           await userEventPendingTimers.click(
//             screen.getByLabelText(al.button.operation.proxy.tab.clear),
//           );
//         });
//         await waitFor(() => {
//           expect(screen.getByText(successMessage)).toBeInTheDocument();
//         });
//       });
//       it('Must show error trying to clear the proxy', async () => {
//         const errorMessage = mocks.i18nGetMessageCustom(
//           'html_popup_clear_proxy_error',
//         );
//         WitnessUtils.removeProxy = jest.fn().mockResolvedValueOnce(false);
//         await act(async () => {
//           await userEventPendingTimers.click(
//             screen.getByLabelText(al.button.operation.proxy.tab.clear),
//           );
//         });
//         await waitFor(() => {
//           expect(screen.getByText(errorMessage)).toBeInTheDocument();
//         });
//       });
//     });
//   });

//   //TODO this specific piece of tests may be in another file
//   // a subfolder as cases: ./inactive
//   //                        ./actives
//   //                        and load it here bellow as an arrow function.
//   describe('No active key cases:\n', () => {
//     beforeEach(async () => {
//       jest.useFakeTimers('legacy');
//       act(() => {
//         jest.advanceTimersByTime(4300);
//       });
//       const accountsNoActiveKey = JSON.parse(JSON.stringify(accounts));
//       delete accountsNoActiveKey[1].keys.active;
//       delete accountsNoActiveKey[1].keys.activePubkey;
//       mockPreset.load(MockPreset.HOMEDEFAULT, mk, accountsNoActiveKey).preset;
//       //just overwrited for now
//       chrome.i18n.getMessage = jest
//         .fn()
//         .mockImplementation(mocks.i18nGetMessageCustom);
//       KeychainApi.get = jest
//         .fn()
//         .mockResolvedValue(fakeWitnessesRankingWInactive);
//       ProxyUtils.findUserProxy = jest.fn().mockResolvedValue(null);
//       HiveUtils.getClient().database.getAccounts = jest
//         .fn()
//         .mockResolvedValue(extendedAccountFullNoProxy);
//       LocalStorageUtils.getValueFromLocalStorage = jest
//         .fn()
//         .mockResolvedValue(null);
//       //end overwrited
//       spyChromeTabs = jest.spyOn(chrome.tabs, 'create');
//       const { rerender, container } = customRender(<App />, {
//         initialState: { mk: mk, accounts: accountsNoActiveKey } as RootState,
//       });
//       //customRerender = rerender;
//       containerRender = container;
//       expect(await screen.findByText(mk)).toBeDefined();
//     });
//     // const gotoProxyTab = async () => {
//     //   await userEventPendingTimers.click(
//     //     screen.getByLabelText(al.button.actionBtn.governance),
//     //   );
//     //   await userEventPendingTimers.click(screen.getAllByRole('tab')[1]);
//     // };
//     it('Must show error trying to set keychain as proxy', async () => {
//       const errorMessage = mocks.i18nGetMessageCustom('popup_missing_key', [
//         KeychainKeyTypesLC.active,
//       ]);
//       await act(async () => {
//         await userEventPendingTimers.click(
//           screen.getByLabelText(al.button.operation.proxySuggestion.ok),
//         );
//       });
//       await waitFor(() => {
//         expect(screen.getByText(errorMessage)).toBeInTheDocument();
//       });
//     });
//     it('Must show error trying to set proxy', async () => {
//       const errorMessage = mocks.i18nGetMessageCustom('popup_missing_key', [
//         KeychainKeyTypesLC.active,
//       ]);
//       await act(async () => {
//         await gotoTab(Tab.PROXY);
//         await userEventPendingTimers.type(
//           screen.getByLabelText(al.input.username),
//           'keychain',
//         );
//         await userEventPendingTimers.click(
//           screen.getByLabelText(al.button.operation.proxy.tab.setAsProxy),
//         );
//       });
//       await waitFor(() => {
//         expect(screen.getByText(errorMessage)).toBeInTheDocument();
//       });
//     });
//   });
// });

describe('To remove after fixing this file', () => {
  it('Must be removed after fixing', () => {});
});

export {};
