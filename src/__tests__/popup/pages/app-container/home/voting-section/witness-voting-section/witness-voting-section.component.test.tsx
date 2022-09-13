import App from '@popup/App';
import React from 'react';
import witnessVotingSection from 'src/__tests__/popup/pages/app-container/home/voting-section/witness-voting-section/mocks/witness-voting-section';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
const { methods, constants, extraMocks } = witnessVotingSection;
describe('witness-voting-section.component tests:\n', () => {
  methods.afterEach;
  describe('With Active Key', () => {
    beforeEach(async () => {
      await witnessVotingSection.beforeEach(<App />);
    });
    it('Must show text message', () => {
      assertion.getOneByText(constants.textMessage);
    });
    it('Must show success after if voting', async () => {
      extraMocks.vote(true);
      await clickAwait([alButton.operation.voteStoodkevWitness]);
      await assertion.awaitFor(constants.voting.success, QueryDOM.BYTEXT);
    });
  });
  describe('No votes left', () => {
    beforeEach(async () => {
      await witnessVotingSection.beforeEach(<App />, { noVotesleft: true });
    });
    it('Must show error if not votes left', async () => {
      await clickAwait([alButton.operation.voteStoodkevWitness]);
      await assertion.awaitFor(constants.voting.noMoreVotes, QueryDOM.BYTEXT);
    });
  });
  describe('No Active Key', () => {
    beforeEach(async () => {
      await witnessVotingSection.beforeEach(<App />, { removeActiveKey: true });
    });
    it('Must show error trying to vote', async () => {
      await clickAwait([alButton.operation.voteStoodkevWitness]);
      await assertion.awaitFor(constants.missingKey, QueryDOM.BYTEXT);
    });
  });
});
