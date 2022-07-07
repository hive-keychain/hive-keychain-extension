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

//   describe('Witness tab:\n', () => {
//     const tabNames = ['Witness', 'Proxy', 'Proposal'];
//     describe('No errors at loading:\n', () => {
//       //Mock all default
//       beforeEach(async () => {
//         jest.useFakeTimers('legacy');
//         act(() => {
//           jest.advanceTimersByTime(4300);
//         });
//         mockPreset.load(MockPreset.HOMEDEFAULT, mk, accounts).preset;
//         //just overwrited for now
//         chrome.i18n.getMessage = jest
//           .fn()
//           .mockImplementation(mocks.i18nGetMessageCustom);
//         KeychainApi.get = jest
//           .fn()
//           .mockResolvedValue(fakeWitnessesRankingWInactive);
//         ProxyUtils.findUserProxy = jest.fn().mockResolvedValue(null);
//         //end overwrited
//         spyChromeTabs = jest.spyOn(chrome.tabs, 'create');
//         customRender(<App />, {
//           initialState: { mk: mk, accounts: accounts } as RootState,
//         });
//         expect(await screen.findByText(mk)).toBeDefined();
//         await act(async () => {
//           await userEventPendingTimers.click(
//             screen.getByLabelText(al.button.actionBtn.governance),
//           );
//         });
//       });
//       it('Must load the governance component, displaying the correct data', async () => {
//         act(() => {
//           jest.runOnlyPendingTimers();
//         });
//         const governancePage = await screen.findByLabelText(
//           al.component.governancePage,
//         );
//         expect(governancePage).toBeInTheDocument();
//         expect(screen.getAllByRole('tablist').length).toBe(1);
//         tabNames.map((tabName) => {
//           expect(screen.getByText(tabName)).toBeInTheDocument();
//         });
//       });
//       it('Must display more information message and opens a new page if clicked on', async () => {
//         //  => calling chrome.tabs.create
//         const informationMessage = mocks.i18nGetMessage(
//           'html_popup_link_to_witness_website',
//         );
//         expect(screen.getByText(informationMessage)).toBeInTheDocument();
//         const link = screen.getByLabelText(
//           al.link.linkToArcange,
//         ) as HTMLDivElement;
//         await act(async () => {
//           await userEventPendingTimers.click(link);
//         });
//         expect(spyChromeTabs).toBeCalledTimes(1);
//         expect(spyChromeTabs).toBeCalledWith({ url: arcangeLink });
//       });
//       it('Must display no witnesses when typying a non existing witness search filter box', async () => {
//         const inputRankingFilter = screen.getByLabelText(
//           al.input.filter.ranking,
//         );
//         await act(async () => {
//           await userEventPendingTimers.type(
//             inputRankingFilter,
//             'non_existentWITNESS',
//           );
//         });
//         const rankingDiv = screen.getByLabelText(
//           al.div.ranking,
//         ) as HTMLDivElement;
//         expect(rankingDiv).toBeInTheDocument();
//         expect(rankingDiv.childNodes.length).toBe(0);
//       });
//       it('Must display 1 witness when typying blocktrades on search filter box', async () => {
//         const inputRankingFilter = screen.getByLabelText(
//           al.input.filter.ranking,
//         );
//         await act(async () => {
//           await userEventPendingTimers.type(inputRankingFilter, 'blocktrades');
//         });
//         const rankingDiv = screen.getByLabelText(
//           al.div.ranking,
//         ) as HTMLDivElement;
//         expect(rankingDiv).toBeInTheDocument();
//         expect(screen.getAllByLabelText(al.div.rankingItem).length).toBe(1);
//       });
//       it('Must display all received active witnesses when typying one common letter, on search filter box', async () => {
//         const inputRankingFilter = screen.getByLabelText(
//           al.input.filter.ranking,
//         );
//         await act(async () => {
//           await userEventPendingTimers.type(inputRankingFilter, 'a');
//         });
//         const rankingDiv = screen.getByLabelText(
//           al.div.ranking,
//         ) as HTMLDivElement;
//         expect(rankingDiv).toBeInTheDocument();
//         expect(screen.getAllByLabelText(al.div.rankingItem).length).toBe(
//           onlyActiveWitnesses.length,
//         );
//       });
//       it('Must show the inactive witness when unchecking on hide inactive', async () => {
//         const checkEl = screen.getByLabelText(
//           al.switchesPanel.witness.hideInactive,
//         );
//         await act(async () => {
//           await userEventPendingTimers.click(checkEl);
//         });
//         await waitFor(() => {
//           expect(screen.getAllByLabelText(al.div.rankingItem).length).toBe(
//             fakeWitnessesRankingWInactive.data.length,
//           );
//           expect(screen.getByText('@theghost1980')).toBeInTheDocument();
//         });
//       });
//       it('Must show only voted witnesses when checking on voted only', async () => {
//         const checkEl = screen.getByLabelText(
//           al.switchesPanel.witness.votedOnly,
//         );
//         await act(async () => {
//           await userEventPendingTimers.click(checkEl);
//         });
//         await waitFor(() => {
//           expect(screen.getAllByLabelText(al.div.rankingItem).length).toBe(
//             fakeData.accounts.extendedAccountFull[0].witness_votes.length,
//           );
//         });
//       });
//       it('Must create a new tab when clicking on witness link', async () => {
//         let rankingItems: HTMLElement[];
//         await waitFor(() => {
//           rankingItems = screen.getAllByLabelText(al.icon.witness.linkToPage);
//         });
//         await act(async () => {
//           await userEventPendingTimers.click(rankingItems[0]);
//         });
//         expect(spyChromeTabs).toBeCalledWith({
//           url: fakeWitnessesRankingWInactive.data[0].url,
//         });
//       });
//       it('Must show error when unvoting fails', async () => {
//         const errorMessage = mocks.i18nGetMessageCustom(
//           'popup_error_unvote_wit',
//           ['blocktrades'],
//         );
//         BlockchainTransactionUtils.delayRefresh = jest.fn();
//         WitnessUtils.unvoteWitness = jest.fn().mockResolvedValueOnce(false);
//         await act(async () => {
//           await userEventPendingTimers.click(
//             (
//               await screen.findAllByLabelText(al.icon.witness.voting)
//             )[0],
//           );
//         });
//         await waitFor(() => {
//           expect(screen.getByText(errorMessage)).toBeInTheDocument();
//         });
//       });
//       it('Must show success message when unvoting', async () => {
//         const sucessMessage = mocks.i18nGetMessageCustom(
//           'popup_success_unvote_wit',
//           ['blocktrades'],
//         );
//         BlockchainTransactionUtils.delayRefresh = jest.fn();
//         WitnessUtils.unvoteWitness = jest.fn().mockResolvedValueOnce(true);
//         await act(async () => {
//           await userEventPendingTimers.click(
//             (
//               await screen.findAllByLabelText(al.icon.witness.voting)
//             )[0],
//           );
//         });
//         await waitFor(() => {
//           expect(screen.getByText(sucessMessage)).toBeInTheDocument();
//         });
//       });
//       it('Must show error when voting fails', async () => {
//         const errorMessage = mocks.i18nGetMessageCustom('popup_error_wit', [
//           fakeWitnessesRankingWInactive.data[4].name,
//         ]);
//         BlockchainTransactionUtils.delayRefresh = jest.fn();
//         WitnessUtils.voteWitness = jest.fn().mockResolvedValueOnce(false);
//         await act(async () => {
//           await userEventPendingTimers.click(
//             (
//               await screen.findAllByLabelText(al.icon.witness.voting)
//             )[4],
//           );
//         });
//         await waitFor(() => {
//           expect(screen.getByText(errorMessage)).toBeInTheDocument();
//         });
//       });
//       it('Must show sucess message when voting', async () => {
//         const successMessage = mocks.i18nGetMessageCustom('popup_success_wit', [
//           fakeWitnessesRankingWInactive.data[4].name,
//         ]);
//         BlockchainTransactionUtils.delayRefresh = jest.fn();
//         WitnessUtils.voteWitness = jest.fn().mockResolvedValueOnce(true);
//         await act(async () => {
//           await userEventPendingTimers.click(
//             (
//               await screen.findAllByLabelText(al.icon.witness.voting)
//             )[4],
//           );
//         });
//         await waitFor(() => {
//           expect(screen.getByText(successMessage)).toBeInTheDocument();
//         });
//       });
//     });

//         //TODO here also try place all this part in a separate file and then load it here.
//     describe('With errors on load:\n', () => {
//       //Mock all default + overwrite KeychainApi.get to cause error
//       beforeEach(async () => {
//         jest.useFakeTimers('legacy');
//         act(() => {
//           jest.advanceTimersByTime(4300);
//         });
//         mockPreset.load(MockPreset.HOMEDEFAULT, mk, accounts).preset;
//         //just overwrited for now
//         chrome.i18n.getMessage = jest
//           .fn()
//           .mockImplementation(mocks.i18nGetMessageCustom);
//         KeychainApi.get = jest.fn().mockResolvedValue({ data: '' });
//         //end overwrited
//         //spyChromeTabs = jest.spyOn(chrome.tabs, 'create');
//         const { rerender } = customRender(<App />, {
//           initialState: { mk: mk, accounts: accounts } as RootState,
//         });
//         expect(await screen.findByText(mk)).toBeDefined();
//         //customRerender = rerender;
//         await act(async () => {
//           await userEventPendingTimers.click(
//             screen.getByLabelText(al.button.actionBtn.governance),
//           );
//         });
//       });
//       it('Must show error if data not received from HIVE', async () => {
//         const errorMessage = mocks.i18nGetMessage(
//           'popup_html_error_retrieving_witness_ranking',
//         );
//         const divEl = (await screen.findByLabelText(
//           al.div.error.witness.tab,
//         )) as HTMLDivElement;
//         expect(divEl).toBeInTheDocument();
//         await waitFor(() => {
//           expect(screen.getAllByText(errorMessage).length).toBe(2);
//         });
//       });
//     });
//   });
// });

describe('To remove after fixing this file', () => {
  it('Must be removed after fixing', () => {});
});

export {};
