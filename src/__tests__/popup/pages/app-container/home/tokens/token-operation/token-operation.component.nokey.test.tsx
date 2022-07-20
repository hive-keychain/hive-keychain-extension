import App from '@popup/App';
import { TokenOperationType } from '@popup/pages/app-container/home/tokens/token-operation/token-operation.component';
import React from 'react';
import tokenOperation from 'src/__tests__/popup/pages/app-container/home/tokens/token-operation/mocks/token-operation';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
const { methods, constants, extraMocks } = tokenOperation;
const { message, leoToken } = constants;
const { typeValues } = leoToken;
const { balance } = typeValues;
describe.skip('token-operation No Active key tests:\n', () => {
  methods.afterEach;
  beforeEach(async () => {
    await tokenOperation.beforeEach(<App />, true);
  });
  it('Must show error trying to stake', async () => {
    await clickAwait([alButton.token.action.stake]);
    extraMocks.doesAccountExist(true);
    await methods.userInteraction(balance.min, TokenOperationType.STAKE);
    await assertion.awaitFor(message.error.noActivekey, QueryDOM.BYTEXT);
  });
  it('Must show error trying to unstake', async () => {
    await clickAwait([alButton.token.action.unstake]);
    await methods.userInteraction(balance.min, TokenOperationType.UNSTAKE);
    await assertion.awaitFor(message.error.noActivekey, QueryDOM.BYTEXT);
  });
  it('Must show error trying to delegate', async () => {
    await clickAwait([alButton.token.action.delegate]);
    extraMocks.doesAccountExist(true);
    await methods.userInteraction(
      balance.min,
      TokenOperationType.DELEGATE,
      false,
      true,
    );
    await assertion.awaitFor(message.error.noActivekey, QueryDOM.BYTEXT);
  });
});
