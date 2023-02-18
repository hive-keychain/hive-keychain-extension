import App from '@popup/App';
import { TokenOperationType } from '@popup/pages/app-container/home/tokens/token-operation/token-operation.component';
import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import TokensUtils from 'src/utils/tokens.utils';
import tokenOperation from 'src/__tests__/popup/pages/app-container/home/tokens/token-operation/mocks/token-operation';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
const { methods, constants, extraMocks } = tokenOperation;
const { message, title, leoToken, displayedCommon } = constants;
const { typeValues } = leoToken;
const { balance } = typeValues;
describe('token-operation Staking tests:\n', () => {
  methods.afterEach;
  beforeEach(async () => {
    await tokenOperation.beforeEach(<App />);
    await clickAwait([alButton.token.action.stake]);
  });
  const operationType = TokenOperationType.STAKE;
  it('Must load operation as stake', () => {
    assertion.getByLabelText(alComponent.tokensOperationPage);
    assertion.getOneByText(title(operationType));
  });
  it('Must display stake info and input element', () => {
    assertion.getManyByText(leoToken.screenInfo.stake);
    assertion.getByLabelText(alInput.amount);
  });
  it('Must show confirmation page', async () => {
    extraMocks.doesAccountExist(true);
    await methods.userInteraction(balance.min, operationType);
    assertion.getByLabelText(alComponent.confirmationPage);
    assertion.getManyByText([
      message.confirmation(operationType),
      ...displayedCommon,
    ]);
  });
  it('Must go back from confirmation when cancelling', async () => {
    extraMocks.doesAccountExist(true);
    await methods.userInteraction(balance.min, operationType);
    assertion.getByLabelText(alComponent.confirmationPage);
    await clickAwait([alButton.dialog.cancel]);
    assertion.queryByText('Confirm', false);
    assertion.getByLabelText(alComponent.tokensOperationPage);
  });
  it('Must show error if unexistent account', async () => {
    extraMocks.doesAccountExist(false);
    await methods.userInteraction(balance.min, operationType);
    await assertion.awaitFor(message.error.noSuchAccount, QueryDOM.BYTEXT);
  });
  it('Must show error if not enough balance', async () => {
    extraMocks.doesAccountExist(true);
    await methods.userInteraction(balance.exceeded, operationType);
    await assertion.awaitFor(message.error.notEnoughBalance, QueryDOM.BYTEXT);
  });
  it('Must show loading stake transaction', async () => {
    extraMocks.doesAccountExist(true);
    TokensUtils.stakeToken = jest.fn();
    await methods.userInteraction(balance.min, operationType, true);
    await waitFor(() => {
      const elementsFound = screen.getAllByText('Staking token', {
        exact: false,
      });
      expect(elementsFound.length).toBeGreaterThan(1);
    });
  });
  it('Must show error if staking fails', async () => {
    extraMocks.doesAccountExist(true);
    extraMocks.stakeToken({ confirmed: false, broadcasted: false });
    await methods.userInteraction(balance.min, operationType, true);
    await assertion.awaitFor(
      message.error.transactionFailed(operationType),
      QueryDOM.BYTEXT,
    );
  });
  it('Must show timeout error', async () => {
    extraMocks.doesAccountExist(true);
    extraMocks.stakeToken(undefined, new Error('Network timeout.'));
    await methods.userInteraction(balance.min, operationType, true);
    await assertion.awaitFor('Network timeout.', QueryDOM.BYTEXT);
  });
  it('Must stake and show message', async () => {
    extraMocks.doesAccountExist(true);
    extraMocks.stakeToken({ confirmed: true, broadcasted: true });
    await methods.userInteraction(balance.min, operationType, true);
    await assertion.awaitFor(
      message.operationConfirmed(operationType),
      QueryDOM.BYTEXT,
    );
  });
});
