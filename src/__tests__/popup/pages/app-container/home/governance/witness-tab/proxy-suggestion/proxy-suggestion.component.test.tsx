import App from '@popup/App';
import '@testing-library/jest-dom';
import React from 'react';
import proxySuggestion from 'src/__tests__/popup/pages/app-container/home/governance/witness-tab/proxy-suggestion/mocks/proxy-suggestion';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
//TODO unskip if proxy-suggestion.component gets enabled.
describe.skip('Proxy suggestion tests:\n', () => {
  const { constants, extraMocks } = proxySuggestion;
  beforeEach(async () => {
    await proxySuggestion.beforeEach(<App />);
  });
  proxySuggestion.methods.afterEach;
  it('Must show proxy suggestion after homepage loads', () => {
    assertion.getByLabelText(alComponent.proxySuggestion);
    assertion.getOneByText(constants.message.suggestion);
  });
  it('Must set @keychain as proxy', async () => {
    extraMocks(true);
    await clickAwait([alButton.operation.proxySuggestion.ok]);
    await assertion.awaitFor(constants.message.success, QueryDOM.BYTEXT);
  });
  it('Must close suggestion after clicking close', async () => {
    await clickAwait([alButton.panel.close]);
    await assertion.toHaveClass(alComponent.proxySuggestion, constants.closed);
  });
  it('Must show error if suggestion operations fails by HIVE', async () => {
    extraMocks(false);
    await clickAwait([alButton.operation.proxySuggestion.ok]);
    await assertion.awaitFor(constants.message.error, QueryDOM.BYTEXT);
  });
});
