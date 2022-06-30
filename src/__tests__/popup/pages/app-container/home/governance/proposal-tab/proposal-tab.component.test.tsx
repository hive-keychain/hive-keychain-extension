import App from '@popup/App';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import React from 'react';
import proposal from 'src/__tests__/popup/pages/app-container/home/governance/proposal-tab/mocks/proposal';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  clickAwait,
  userEventPendingTimers,
} from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
jest.setTimeout(10000);
//const mk = fakeData.mk.userData1;
//const accounts = fakeData.accounts.twoAccounts;
// const onlyActiveWitnesses = fakeWitnessesRankingWInactive.data.filter(
//   (item) => item.signing_key !== inactiveKey,
// );

describe('Proposal tab:\n', () => {
  const { constants, methods, spy } = proposal;
  beforeEach(async () => {
    // jest.useFakeTimers('legacy');
    // act(() => {
    //   jest.advanceTimersByTime(4300);
    // });
    // proposalResponse = utilsT.expectedResultProposal as Proposal[];
    // proposalResponse[0].voted = true;
    // selectedProposal = proposalResponse[0];
    // mockPreset.load(MockPreset.HOMEDEFAULT, mk, accounts).preset;
    // //just overwrited for now
    // chrome.i18n.getMessage = jest
    //   .fn()
    //   .mockImplementation(mocks.i18nGetMessageCustom);
    // KeychainApi.get = jest
    //   .fn()
    //   .mockResolvedValue(fakeWitnessesRankingWInactive);
    // ProxyUtils.findUserProxy = jest.fn().mockResolvedValue('');
    // ProposalUtils.getProposalList = jest
    //   .fn()
    //   .mockResolvedValue(proposalResponse);
    // //end overwrited
    // spyChromeTabs = jest.spyOn(chrome.tabs, 'create');
    // customRender(<App />, {
    //   initialState: { mk: mk, accounts: accounts } as RootState,
    // });
    // expect(await screen.findByText(mk)).toBeDefined();
    // await gotoTab(Tab.GOVERNANCE);
    await proposal.beforeEach(<App />);
  });
  methods.afterEach;
  it('Must show actual proposals when clicking on tab', () => {
    methods.assertProposals();
  });
  it('Must show proposal details when clicking on dropdown icon', async () => {
    await clickAwait([constants.selectedProposal.ariaLabel.id]);
    expect(
      screen.queryByLabelText(alDiv.proposal.extraInfo.value),
    ).toHaveTextContent(constants.selectedProposal.data.totalVotes);
  });
  it('Must show tooltip as funded when proposal is funded', async () => {
    await clickAwait([constants.selectedProposal.ariaLabel.id]);
    expect(
      screen.queryByLabelText(alDiv.proposal.extraInfo.totallyFunded),
    ).toHaveTextContent(constants.fundedToolTip);
  });
  it('Must open a new window when clicking on image', async () => {
    await clickAwait([constants.selectedProposal.ariaLabel.id]);
    await userEventPendingTimers.click(
      screen.getAllByLabelText(alDiv.proposal.item.imageGoToCreator)[0],
    );
    expect(spy.chromeTabs()).toBeCalledWith(constants.url);
  });
  // it('Must opens a new windows tab when clicking on proposal item title', async () => {
  //   await act(async () => {
  //     await userEventPendingTimers.click(
  //       screen.getAllByLabelText(al.div.proposal.item.expandable)[0],
  //     );
  //     await userEventPendingTimers.click(
  //       screen.getAllByLabelText(al.div.proposal.item.spanGoToLink)[0],
  //     );
  //   });
  //   expect(spyChromeTabs).toBeCalledWith({ url: selectedProposal.link });
  // });
  // it('Must vote for proposal and show message', async () => {
  //   const voteMessage = mocks.i18nGetMessageCustom(
  //     'popup_html_proposal_vote_successful',
  //   );
  //   ProposalUtils.voteForProposal = jest.fn().mockResolvedValueOnce(true);
  //   await act(async () => {
  //     await userEventPendingTimers.click(
  //       screen.getAllByLabelText(al.div.proposal.item.expandable)[1],
  //     );
  //     await userEventPendingTimers.click(
  //       screen.getAllByLabelText(al.div.proposal.item.iconVoteUnvote)[1],
  //     );
  //   });
  //   await waitFor(() => {
  //     expect(screen.getByText(voteMessage)).toBeInTheDocument();
  //   });
  // });
  // it('Must unvote proposal and show message', async () => {
  //   const unvoteMessage = mocks.i18nGetMessageCustom(
  //     'popup_html_proposal_unvote_successful',
  //   );
  //   ProposalUtils.unvoteProposal = jest.fn().mockResolvedValueOnce(true);
  //   await act(async () => {
  //     await userEventPendingTimers.click(
  //       screen.getAllByLabelText(al.div.proposal.item.expandable)[0],
  //     );
  //     await userEventPendingTimers.click(
  //       screen.getAllByLabelText(al.div.proposal.item.iconVoteUnvote)[0],
  //     );
  //   });
  //   await waitFor(() => {
  //     expect(screen.getByText(unvoteMessage)).toBeInTheDocument();
  //   });
  // });
  // it('Must show message if unvote proposal fails', async () => {
  //   const errorMessage = mocks.i18nGetMessageCustom(
  //     'popup_html_proposal_unvote_fail',
  //   );
  //   ProposalUtils.unvoteProposal = jest.fn().mockResolvedValueOnce(false);
  //   await act(async () => {
  //     await userEventPendingTimers.click(
  //       screen.getAllByLabelText(al.div.proposal.item.expandable)[0],
  //     );
  //     await userEventPendingTimers.click(
  //       screen.getAllByLabelText(al.div.proposal.item.iconVoteUnvote)[0],
  //     );
  //   });
  //   await waitFor(() => {
  //     expect(screen.getByText(errorMessage)).toBeInTheDocument();
  //   });
  // });
  // it('Must show error if voting fails', async () => {
  //   const errorMessage = mocks.i18nGetMessageCustom(
  //     'popup_html_proposal_vote_fail',
  //   );
  //   ProposalUtils.voteForProposal = jest.fn().mockResolvedValueOnce(false);
  //   await act(async () => {
  //     await userEventPendingTimers.click(
  //       screen.getAllByLabelText(al.div.proposal.item.expandable)[2],
  //     );
  //     await userEventPendingTimers.click(
  //       screen.getAllByLabelText(al.div.proposal.item.iconVoteUnvote)[2],
  //     );
  //   });
  //   await waitFor(() => {
  //     expect(screen.getByText(errorMessage)).toBeInTheDocument();
  //   });
  // });
});
