import App from '@popup/App';
import { screen } from '@testing-library/react';
import React from 'react';
import tokens from 'src/__tests__/popup/pages/app-container/home/tokens/mocks/tokens';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
const { methods, constants } = tokens;
const { messages, data, typeValue } = constants;
describe('tokens.component tests:\n', () => {
  methods.afterEach;
  describe('User has tokens:\n', () => {
    beforeEach(async () => {
      await tokens.beforeEach(<App />);
    });
    it('Must show disclaimer message', () => {
      assertion.getOneByText(messages.tokens.disclaimer);
    });
    it('Must show user tokens', async () => {
      await assertion.allToHaveLength(
        alDiv.token.user.item,
        data.userTokens.length,
      );
    });
    it('Must show filter box and settings', () => {
      assertion.getByLabelText(alInput.filter.token);
      assertion.getByLabelText(alIcon.tokens.settings.open);
    });
    it('Must set filter box value', async () => {
      await methods.typeOnFilter(typeValue.token.keyChain);
      expect(
        screen.getByDisplayValue(typeValue.token.keyChain),
      ).toBeInTheDocument();
    });
    it('Must display one token', async () => {
      await methods.typeOnFilter(data.userTokens.leoToken.symbol);
      assertion.getByLabelText(alDiv.token.user.item);
      assertion.getOneByText(data.userTokens.leoToken.balance);
    });
    it('Must display no value found', async () => {
      await methods.typeOnFilter(typeValue.token.keyChain);
      assertion.getOneByText(messages.tokens.noTokens);
    });
    it('Must show navigate to tokens settings', async () => {
      await clickAwait([alIcon.tokens.settings.open]);
      assertion.getByLabelText(alComponent.tokensSettings);
    });
    it('Must show navigate to tokens settings and go back', async () => {
      await clickAwait([alIcon.tokens.settings.open]);
      assertion.getByLabelText(alComponent.tokensSettings);
      await clickAwait([alIcon.arrowBack]);
      assertion.queryByLabel(alComponent.tokensSettings, false);
      assertion.getByLabelText(alComponent.userTokens);
    });
  });
  describe('User has no tokens', () => {
    beforeEach(async () => {
      await tokens.beforeEach(<App />, { noUserTokens: true });
    });
    it('Must show no tokens message', () => {
      assertion.getOneByText(messages.tokens.noTokens);
    });
  });
  describe('Having hidden tokens:\n', () => {
    beforeEach(async () => {
      await tokens.beforeEach(<App />, { reImplementGetLS: true });
    });
    it('Must not show hidden tokens', () => {
      assertion.getByLabelText(alDiv.token.user.item);
      assertion.getOneByText(data.userTokens.palToken.symbol);
    });
  });
});
