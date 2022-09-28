import App from '@popup/App';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import React from 'react';
import witness from 'src/__tests__/popup/pages/app-container/home/governance/witness-tab/mocks/witness';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import alLink from 'src/__tests__/utils-for-testing/aria-labels/al-link';
import alSwitches from 'src/__tests__/utils-for-testing/aria-labels/al-switches';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('witness tab:\n', () => {
  const { constants, methods, extraMocks } = witness;
  witness.methods.afterEach;
  describe('no errors at loading:\n', () => {
    beforeEach(async () => {
      await witness.beforeEach(<App />, false, null);
    });
    it('Must display active witnesses', () => {
      expect(screen.getAllByLabelText(alDiv.rankingItem)).toHaveLength(
        constants.witnessData.data.length - 1,
      );
    });
    it('Must display more information message', () => {
      assertion.getOneByText(constants.infoMessage);
    });
    it('Must open link about more information', async () => {
      await clickAwait([alLink.linkToArcange]);
      expect(constants.spy.chromeTabs()).toBeCalledWith(constants.urlArcange);
    });
    it('Must display no witnesses when typying a non existing witness on filter box', async () => {
      await methods.filterBox('non_existentWITNESS');
      expect(screen.queryAllByLabelText(alDiv.rankingItem)).toHaveLength(0);
    });
    it('Must display 1 witness when typying blocktrades on filter box', async () => {
      await methods.filterBox('blocktrades');
      expect(screen.queryAllByLabelText(alDiv.rankingItem)).toHaveLength(1);
    });
    it('Must display all received active witnesses when typying one common letter, on search filter box', async () => {
      await methods.filterBox('a');
      expect(screen.queryAllByLabelText(alDiv.rankingItem)).toHaveLength(6);
    });
    it('Must show the inactive witness when unchecking on hide inactive', async () => {
      await clickAwait([alSwitches.panel.witness.hideInactive]);
      expect(await screen.findByText('@theghost1980')).toBeInTheDocument();
    });
    it('Must show only voted witnesses when checking on voted only', async () => {
      await clickAwait([alSwitches.panel.witness.votedOnly]);
      expect(screen.queryAllByLabelText(alDiv.rankingItem)).toHaveLength(
        constants.voted,
      );
    });
    it('Must create a new tab when clicking on witness link', async () => {
      await methods.clickOneBy(alIcon.witness.linkToPage, 0);
      expect(constants.spy.chromeTabs()).toBeCalledWith({
        url: methods.getData(0).url,
      });
    });
    it('Must show error when unvoting fails', async () => {
      extraMocks({ unvoteWitness: false });
      await methods.clickOneBy(alIcon.witness.voting, 0);
      await assertion.awaitFor(constants.errorUnvote, QueryDOM.BYTEXT);
    });
    it('Must show success message when unvoting', async () => {
      extraMocks({ unvoteWitness: true });
      await methods.clickOneBy(alIcon.witness.voting, 0);
      await assertion.awaitFor(constants.successUnVote, QueryDOM.BYTEXT);
    });
    it('Must show error when voting fails', async () => {
      extraMocks({ voteWitness: false });
      await methods.clickOneBy(alIcon.witness.voting, 4);
      await assertion.awaitFor(constants.errorVote, QueryDOM.BYTEXT);
    });
    it('Must show sucess message when voting', async () => {
      extraMocks({ voteWitness: true });
      await methods.clickOneBy(alIcon.witness.voting, 4);
      await assertion.awaitFor(constants.successVote, QueryDOM.BYTEXT);
    });
  });
  describe('With errors on load:\n', () => {
    beforeEach(async () => {
      await witness.beforeEach(<App />, true, null);
    });
    it('Must show 2 errors if request data fails', async () => {
      expect((await screen.findAllByText(constants.rankingError)).length).toBe(
        constants.rankingErrors,
      );
    });
  });
});
