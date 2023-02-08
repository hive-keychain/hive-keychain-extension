import App from '@popup/App';
import React from 'react';
import proposalVotingSection from 'src/__tests__/popup/pages/app-container/home/voting-section/proposal-voting-section/mocks/proposal-voting-section';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
const { constants, methods, extraMocks } = proposalVotingSection;
describe('proposal-voting-section.component tests:\n', () => {
  methods.afterEach;
  describe('With Active key', () => {
    beforeEach(async () => {
      await proposalVotingSection.beforeEach(<App />, { hasVoted: false });
    });
    it('Must show keychain proposal', async () => {
      assertion.getOneByText(constants.textRequest);
    });
    it('Must show vote for keychain proposal', async () => {
      extraMocks.vote(true);
      await clickAwait([alButton.operation.voteProposal]);
      await assertion.awaitFor(constants.voting.success, QueryDOM.BYTEXT);
    });
    it('Must show error on voting failed', async () => {
      extraMocks.vote(false);
      await clickAwait([alButton.operation.voteProposal]);
      await assertion.awaitFor(constants.voting.failed, QueryDOM.BYTEXT);
    });
    it('Must open a new window when open to read', async () => {
      await clickAwait([alButton.readProposal]);
      expect(methods.spyChromeTabs()).toBeCalledWith(constants.urlProposal);
    });
  });
  describe('No Active key', () => {
    beforeEach(async () => {
      await proposalVotingSection.beforeEach(<App />, {
        hasVoted: false,
        removeActiveKey: true,
      });
    });
    it('Must show error trying to vote proposal', async () => {
      await clickAwait([alButton.operation.voteProposal]);
      await assertion.awaitFor(constants.missingKey, QueryDOM.BYTEXT);
    });
  });
});
