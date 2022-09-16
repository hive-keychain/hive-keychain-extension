import App from '@popup/App';
import React from 'react';
import topBar from 'src/__tests__/popup/pages/app-container/home/top-bar/mocks/top-bar';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  actAdvanceTime,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('top-bar.component tests:/n', () => {
  const { constants, methods, extraMocks } = topBar;
  methods.afterEach;
  describe('has rewards to claim:\n', () => {
    beforeEach(async () => {
      await topBar.beforeEach(<App />);
    });
    it('Must show claim button', () => {
      assertion.getByLabelText(alIcon.reward);
    });
    it('Must show settings and log out button', () => {
      methods.assertButtons();
    });
    it('Must claim reward ans show updated balance', async () => {
      extraMocks.claimRewards();
      extraMocks.getAccount();
      await clickAwait([alIcon.reward]);
      actAdvanceTime(3300);
      await assertion.awaitFor(constants.updatedBalance, QueryDOM.BYTEXT);
    });
  });
  describe('no rewards to claim:\n', () => {
    beforeEach(async () => {
      await topBar.beforeEach(<App />, { noRewards: true });
    });
    it('Must not show claim button', () => {
      assertion.queryByLabel(alIcon.reward, false);
    });
    it('Must show settings and log out button', () => {
      methods.assertButtons();
    });
  });
  describe('no posting key', () => {
    beforeEach(async () => {
      await topBar.beforeEach(<App />, { removePostingKey: true });
    });
    it('Must show error trying to claim', async () => {
      await clickAwait([alIcon.reward]);
      await assertion.awaitFor(constants.noPostingKey, QueryDOM.BYTEXT);
    });
  });
});
