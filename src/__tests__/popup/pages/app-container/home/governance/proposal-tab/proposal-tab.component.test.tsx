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
//   describe('Proposal tab:\n', () => {
//     let proposalResponse: Proposal[];
//     let selectedProposal: Proposal;
//     beforeEach(async () => {
//       jest.useFakeTimers('legacy');
//       act(() => {
//         jest.advanceTimersByTime(4300);
//       });
//       proposalResponse = utilsT.expectedResultProposal as Proposal[];
//       proposalResponse[0].voted = true;
//       selectedProposal = proposalResponse[0];
//       mockPreset.load(MockPreset.HOMEDEFAULT, mk, accounts).preset;
//       //just overwrited for now
//       chrome.i18n.getMessage = jest
//         .fn()
//         .mockImplementation(mocks.i18nGetMessageCustom);
//       KeychainApi.get = jest
//         .fn()
//         .mockResolvedValue(fakeWitnessesRankingWInactive);
//       ProxyUtils.findUserProxy = jest.fn().mockResolvedValue('');
//       ProposalUtils.getProposalList = jest
//         .fn()
//         .mockResolvedValue(proposalResponse);
//       //end overwrited
//       spyChromeTabs = jest.spyOn(chrome.tabs, 'create');
//       customRender(<App />, {
//         initialState: { mk: mk, accounts: accounts } as RootState,
//       });
//       expect(await screen.findByText(mk)).toBeDefined();
//       await gotoTab(Tab.GOVERNANCE);
//     });
//     afterEach(() => {
//       cleanup();
//     });
//     it('Must show actual proposals when clicking on tab', async () => {
//       expect(
//         screen.getAllByLabelText(al.div.proposal.item.expandable).length,
//       ).toBe(utilsT.expectedResultProposal.length);
//     });
//     it('Must show proposal details when clicking on dropdown icon', async () => {
//       expect(
//         screen.queryAllByLabelText(al.div.proposal.extraInfo.value).length,
//       ).toBe(0);
//       await act(async () => {
//         await userEventPendingTimers.click(
//           screen.getAllByLabelText(al.div.proposal.item.expandable)[0],
//         );
//       });
//       const divExtraInfo = screen.queryByLabelText(
//         al.div.proposal.extraInfo.value,
//       ) as HTMLDivElement;
//       expect(divExtraInfo).toHaveTextContent(selectedProposal.totalVotes);
//     });
//     it('Must show tooltip as funded when proposal is funded', async () => {
//       const expectedValue = mocks.i18nGetMessageCustom(
//         `popup_html_proposal_funded_option_${selectedProposal.funded}`,
//       );
//       await act(async () => {
//         await userEventPendingTimers.click(
//           screen.getAllByLabelText(al.div.proposal.item.expandable)[0],
//         );
//       });
//       const divExtraInfoFunded = screen.queryByLabelText(
//         al.div.proposal.extraInfo.totallyFunded,
//       ) as HTMLDivElement;
//       expect(divExtraInfoFunded).toHaveTextContent(expectedValue);
//     });
//     it('Must open a new window when clicking on image', async () => {
//       const url = { url: `https://peakd.com/@${selectedProposal.creator}` };
//       await act(async () => {
//         await userEventPendingTimers.click(
//           screen.getAllByLabelText(al.div.proposal.item.expandable)[0],
//         );
//         await userEventPendingTimers.click(
//           screen.getAllByLabelText(al.div.proposal.item.imageGoToCreator)[0],
//         );
//       });
//       expect(spyChromeTabs).toBeCalledWith(url);
//     });
//     it('Must opens a new windows tab when clicking on proposal item title', async () => {
//       await act(async () => {
//         await userEventPendingTimers.click(
//           screen.getAllByLabelText(al.div.proposal.item.expandable)[0],
//         );
//         await userEventPendingTimers.click(
//           screen.getAllByLabelText(al.div.proposal.item.spanGoToLink)[0],
//         );
//       });
//       expect(spyChromeTabs).toBeCalledWith({ url: selectedProposal.link });
//     });
//     it('Must vote for proposal and show message', async () => {
//       const voteMessage = mocks.i18nGetMessageCustom(
//         'popup_html_proposal_vote_successful',
//       );
//       ProposalUtils.voteForProposal = jest.fn().mockResolvedValueOnce(true);
//       await act(async () => {
//         await userEventPendingTimers.click(
//           screen.getAllByLabelText(al.div.proposal.item.expandable)[1],
//         );
//         await userEventPendingTimers.click(
//           screen.getAllByLabelText(al.div.proposal.item.iconVoteUnvote)[1],
//         );
//       });
//       await waitFor(() => {
//         expect(screen.getByText(voteMessage)).toBeInTheDocument();
//       });
//     });
//     it('Must unvote proposal and show message', async () => {
//       const unvoteMessage = mocks.i18nGetMessageCustom(
//         'popup_html_proposal_unvote_successful',
//       );
//       ProposalUtils.unvoteProposal = jest.fn().mockResolvedValueOnce(true);
//       await act(async () => {
//         await userEventPendingTimers.click(
//           screen.getAllByLabelText(al.div.proposal.item.expandable)[0],
//         );
//         await userEventPendingTimers.click(
//           screen.getAllByLabelText(al.div.proposal.item.iconVoteUnvote)[0],
//         );
//       });
//       await waitFor(() => {
//         expect(screen.getByText(unvoteMessage)).toBeInTheDocument();
//       });
//     });
//     it('Must show message if unvote proposal fails', async () => {
//       const errorMessage = mocks.i18nGetMessageCustom(
//         'popup_html_proposal_unvote_fail',
//       );
//       ProposalUtils.unvoteProposal = jest.fn().mockResolvedValueOnce(false);
//       await act(async () => {
//         await userEventPendingTimers.click(
//           screen.getAllByLabelText(al.div.proposal.item.expandable)[0],
//         );
//         await userEventPendingTimers.click(
//           screen.getAllByLabelText(al.div.proposal.item.iconVoteUnvote)[0],
//         );
//       });
//       await waitFor(() => {
//         expect(screen.getByText(errorMessage)).toBeInTheDocument();
//       });
//     });
//     it('Must show error if voting fails', async () => {
//       const errorMessage = mocks.i18nGetMessageCustom(
//         'popup_html_proposal_vote_fail',
//       );
//       ProposalUtils.voteForProposal = jest.fn().mockResolvedValueOnce(false);
//       await act(async () => {
//         await userEventPendingTimers.click(
//           screen.getAllByLabelText(al.div.proposal.item.expandable)[2],
//         );
//         await userEventPendingTimers.click(
//           screen.getAllByLabelText(al.div.proposal.item.iconVoteUnvote)[2],
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
