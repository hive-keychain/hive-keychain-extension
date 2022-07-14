import App from '@popup/App';
import React from 'react';
import tokenDelegations from 'src/__tests__/popup/pages/app-container/home/tokens/token-delegations/mocks/token-delegations';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
const { methods, constants } = tokenDelegations;
const { values } = constants;
describe('token-incoming-outgoing-page.component tests:\n', () => {
  methods.afterEach;
  beforeEach(async () => {
    await tokenDelegations.beforeEach(<App />);
    await clickAwait([methods.preFixExpandMore('PAL')]);
  });
  it('Must load incoming delegation page and show header', async () => {
    await clickAwait([alButton.token.delegations.goto.incoming]);
    assertion.getByLabelText(alComponent.incomingOutgoingPage);
    assertion.getOneByText(constants.message.header.incoming);
  });
  it('Must load outgoing delegation page, show header and message', async () => {
    await clickAwait([alButton.token.delegations.goto.outgoing]);
    assertion.getByLabelText(alComponent.incomingOutgoingPage);
    assertion.getOneByText(constants.message.cooldown);
    assertion.getOneByText(constants.message.header.outgoing);
  });
  it('Must show values for incoming', async () => {
    await clickAwait([alButton.token.delegations.goto.incoming]);
    assertion.getManyByText(values.totalValue.incoming);
  });
  it('Must show values for outgoing', async () => {
    await clickAwait([alButton.token.delegations.goto.outgoing]);
    assertion.getManyByText(values.totalValue.outgoing);
  });
  it('Must go back when clicking arrow', async () => {
    await clickAwait([alButton.token.delegations.goto.incoming]);
    assertion.getByLabelText(alComponent.incomingOutgoingPage);
    await clickAwait([alIcon.arrowBack]);
    assertion.getByLabelText(alComponent.userTokens);
  });
});
