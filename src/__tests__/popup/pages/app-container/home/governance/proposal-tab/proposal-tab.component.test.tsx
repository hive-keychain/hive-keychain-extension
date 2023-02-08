import App from '@popup/App';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import React from 'react';
import proposal from 'src/__tests__/popup/pages/app-container/home/governance/proposal-tab/mocks/proposal';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  clickAwait,
  userEventPendingTimers,
} from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('Proposal tab:\n', () => {
  const { constants, methods, spy, extraMocks } = proposal;
  beforeEach(async () => {
    await proposal.beforeEach(<App />);
  });
  methods.afterEach;
  it('Must show actual proposals when clicking on tab', () => {
    methods.assertProposals();
  });
  it('Must show proposal details when clicking on dropdown icon', async () => {
    await clickAwait([methods.selectProposal(0).ariaLabel.id]);
    expect(
      screen.queryByLabelText(alDiv.proposal.extraInfo.value),
    ).toHaveTextContent(methods.selectProposal(0).data.totalVotes);
  });
  it('Must show tooltip as funded when proposal is funded', async () => {
    await clickAwait([methods.selectProposal(0).ariaLabel.id]);
    expect(
      screen.queryByLabelText(alDiv.proposal.extraInfo.totallyFunded),
    ).toHaveTextContent(methods.selectProposal(0).fundedToolTip);
  });
  it('Must navigate to creator profile when clicking on image', async () => {
    await clickAwait([methods.selectProposal(0).ariaLabel.id]);
    await userEventPendingTimers.click(
      screen.getAllByLabelText(alDiv.proposal.item.imageGoToCreator)[0],
    );
    expect(spy.chromeTabs()).toBeCalledWith(
      methods.selectProposal(0).creatorUrl,
    );
  });
  it('Must navigate to proposal link, when clicking on proposal item title', async () => {
    await clickAwait([methods.selectProposal(0).ariaLabel.id]);
    await userEventPendingTimers.click(
      screen.getAllByLabelText(alDiv.proposal.item.spanGoToLink)[0],
    );
    expect(spy.chromeTabs()).toBeCalledWith(
      methods.selectProposal(0).proposalUrl,
    );
  });
  it('Must vote for proposal and show message', async () => {
    extraMocks({ voteForProposal: true });
    await clickAwait([methods.selectProposal(1).ariaLabel.id]);
    await userEventPendingTimers.click(
      screen.getAllByLabelText(alDiv.proposal.item.iconVoteUnvote)[1],
    );
    await assertion.awaitFor(constants.voteMessage, QueryDOM.BYTEXT);
  });
  it('Must unvote proposal and show message', async () => {
    extraMocks({ unvoteForProposal: true });
    await clickAwait([methods.selectProposal(0).ariaLabel.id]);
    await userEventPendingTimers.click(
      screen.getAllByLabelText(alDiv.proposal.item.iconVoteUnvote)[0],
    );
    await assertion.awaitFor(constants.unvoteMessage, QueryDOM.BYTEXT);
  });
  it('Must show error if unvote proposal fails', async () => {
    proposal.constants.proposalResponse[0].voted = true;
    extraMocks({ unvoteForProposal: false });
    await clickAwait([methods.selectProposal(0).ariaLabel.id]);
    await userEventPendingTimers.click(
      screen.getAllByLabelText(alDiv.proposal.item.iconVoteUnvote)[0],
    );
    await assertion.awaitFor(constants.unvoteMessageFails, QueryDOM.BYTEXT);
  });
  it('Must show error if voting fails', async () => {
    extraMocks({ voteForProposal: false });
    await clickAwait([methods.selectProposal(2).ariaLabel.id]);
    await userEventPendingTimers.click(
      screen.getAllByLabelText(alDiv.proposal.item.iconVoteUnvote)[2],
    );
    await assertion.awaitFor(constants.voteMessageFails, QueryDOM.BYTEXT);
  });
});
