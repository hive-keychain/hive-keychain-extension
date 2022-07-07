import App from '@popup/App';
import '@testing-library/jest-dom';
import React from 'react';
import delegations from 'src/__tests__/popup/pages/app-container/home/delegations/mocks/delegations';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  actPendingTimers,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
describe('delegations.component tests:\n', () => {
  const { message } = delegations.constants;
  const { onScreen } = delegations.userInformation;
  delegations.methods.after;
  describe('handling errors on load:\n', () => {
    beforeEach(async () => {
      await delegations.beforeEach(<App />, true);
    });
    it('Must load delegations page, and show error', async () => {
      await assertion.awaitFor(message.error.incomming, QueryDOM.BYTEXT);
    });
  });
  describe('no errors on load:\n', () => {
    beforeEach(async () => {
      await delegations.beforeEach(<App />, false);
    });
    it('Must navigate to delegations page', () => {
      assertion.getByLabelText(alComponent.delegationsPage);
    });
    it('Must navigate to INCOMING_PAGE when clicking incoming', async () => {
      await clickAwait([alButton.delegations.total.incoming]);
      delegations.methods.assertPageAnd(onScreen.total.incoming);
    });
    it('Must navigate to INCOMING_OUTGOING_PAGE when clicking outcomming', async () => {
      await clickAwait([alButton.delegations.total.outgoing]);
      delegations.methods.assertPageAnd(onScreen.total.outgoing);
    });
    it('Must navigate to INCOMING_OUTGOING_PAGE, and go back when clicking on back icon', async () => {
      await clickAwait([alButton.delegations.total.outgoing]);
      assertion.getByLabelText(alComponent.incomingOutgoingPage);
      await clickAwait([alIcon.arrowBack]);
      assertion.getByLabelText(alComponent.delegationsPage);
    });
    it('Must set delegation amount to max when pressing max button', async () => {
      await clickAwait([alButton.setToMax]);
      assertion.getByDisplay(delegations.userInformation.delegation.maxAmount);
    });
    it('Must show error if wrong requested value', async () => {
      await delegations.methods.typeNClick('theghost1980', '1000', false);
      await assertion.awaitFor(message.error.powerUpDown, QueryDOM.BYTEXT);
    });
    it('Must show error when delegation fails', async () => {
      delegations.extraMocks(false);
      await delegations.methods.typeNClick('theghost1980', '0.1', true);
      await assertion.awaitFor(message.error.delegation, QueryDOM.BYTEXT);
    });
    it('Must navigate to confirmation page and go back when pressing cancel', async () => {
      await delegations.methods.typeNClick('theghost1980', '0.1', false);
      assertion.getByLabelText(alComponent.confirmationPage);
      await clickAwait([alButton.dialog.cancel]);
      assertion.getByLabelText(alComponent.delegationsPage);
    });
    it('Must make a delegation, show message and go home page', async () => {
      delegations.extraMocks(true);
      await delegations.methods.typeNClick('theghost1980', '0.1', true);
      await actPendingTimers();
      await assertion.awaitFor(message.success.delegation, QueryDOM.BYTEXT);
      assertion.getByLabelText(alComponent.homePage);
    });
    it('Must cancel a delegation, show message and navigate to home', async () => {
      delegations.extraMocks(true);
      await delegations.methods.typeNClick('theghost1980', '', true, true);
      await actPendingTimers();
      await assertion.awaitFor(message.success.cancelation, QueryDOM.BYTEXT);
      assertion.getByLabelText(alComponent.homePage);
    });
    it('Must show error message if cancellation fails', async () => {
      delegations.extraMocks(false);
      await delegations.methods.typeNClick('theghost1980', '', true, true);
      await actPendingTimers();
      await assertion.awaitFor(message.error.cancellation, QueryDOM.BYTEXT);
    });
  });
});
