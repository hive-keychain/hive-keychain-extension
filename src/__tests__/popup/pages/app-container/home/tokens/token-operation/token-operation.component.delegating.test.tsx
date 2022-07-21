import App from '@popup/App';
import { TokenOperationType } from '@popup/pages/app-container/home/tokens/token-operation/token-operation.component';
import { waitFor } from '@testing-library/react';
import React from 'react';
import HiveEngineUtils from 'src/utils/hive-engine.utils';
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
const { message, title, leoToken, displayedCommon, displayedDelegating } =
  constants;
const { typeValues } = leoToken;
const { balance } = typeValues;
describe('token-operation Delegating tests:\n', () => {
  methods.afterEach;
  beforeEach(async () => {
    await tokenOperation.beforeEach(<App />);
    await clickAwait([alButton.token.action.delegate]);
  });
  const operationType = TokenOperationType.DELEGATE;
  it('Must load operation as delegate', () => {
    assertion.getByLabelText(alComponent.tokensOperationPage);
    assertion.getManyByText([title(operationType)]);
  });
  it('Must display delegate info and inputs elements', () => {
    assertion.getManyByText(leoToken.screenInfo.delegate);
    assertion.getByText([
      { arialabelOrText: alInput.amount, query: QueryDOM.BYLABEL },
      { arialabelOrText: alInput.username, query: QueryDOM.BYLABEL },
    ]);
  });
  it('Must show confirmation page', async () => {
    extraMocks.doesAccountExist(true);
    await methods.userInteraction(balance.min, operationType, false, true);
    assertion.getByLabelText(alComponent.confirmationPage);
    assertion.getManyByText([
      message.confirmation(operationType),
      ...displayedCommon,
      ...displayedDelegating,
    ]);
  });
  it('Must go back from confirmation when cancelling', async () => {
    extraMocks.doesAccountExist(true);
    await methods.userInteraction(balance.min, operationType, false, true);
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
    await methods.userInteraction(balance.exceeded, operationType, false, true);
    await assertion.awaitFor(message.error.notEnoughBalance, QueryDOM.BYTEXT);
  });
  it('Must show loading delegating transaction', async () => {
    extraMocks.doesAccountExist(true);
    HiveEngineUtils.delegateToken = jest.fn();
    await methods.userInteraction(balance.min, operationType, true, true);
    await waitFor(() => {
      assertion.getManyByText([
        message.loading.text,
        message.loading.operation(operationType),
      ]);
    });
  });
  it('Must show error if delegating fails and navigate back', async () => {
    extraMocks.doesAccountExist(true);
    extraMocks.delegateToken();
    extraMocks.tryConfirmTransaction('error');
    await methods.userInteraction(balance.min, operationType, true, true);
    await assertion.awaitFor(message.error.transaction, QueryDOM.BYTEXT);
    assertion.getByLabelText(alComponent.tokensOperationPage);
  });
  it('Must show timeout error', async () => {
    extraMocks.doesAccountExist(true);
    extraMocks.delegateToken();
    extraMocks.tryConfirmTransaction('timeOut');
    await methods.userInteraction(balance.min, operationType, true, true);
    await assertion.awaitFor(message.error.timeOut, QueryDOM.BYTEXT);
  });
  it('Must delegate and show message', async () => {
    extraMocks.doesAccountExist(true);
    extraMocks.delegateToken();
    extraMocks.tryConfirmTransaction('confirmed');
    await methods.userInteraction(balance.min, operationType, true, true);
    await assertion.awaitFor(
      message.operationConfirmed(operationType),
      QueryDOM.BYTEXT,
    );
  });
});
