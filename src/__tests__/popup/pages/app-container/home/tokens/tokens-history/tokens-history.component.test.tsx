import App from '@popup/App';
import { screen } from '@testing-library/react';
import React from 'react';
import tokensHistory from 'src/__tests__/popup/pages/app-container/home/tokens/tokens-history/mocks/tokens-history';
import config from 'src/__tests__/utils-for-testing/setups/config';
config.byDefault();
const { methods } = tokensHistory;
describe('tokens-history.component tests:\n', () => {
  methods.afterEach;
  describe('With history to show', () => {
    beforeEach(async () => {
      await tokensHistory.beforeEach(<App />);
    });
    it('Must show LEO token history and equal snapshot', () => {
      screen.debug();
    });
  });
  describe('No history to show', () => {
    it.todo('Must show no transactions');
  });
});
