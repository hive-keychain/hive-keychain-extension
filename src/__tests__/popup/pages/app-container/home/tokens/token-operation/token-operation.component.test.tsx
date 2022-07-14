import App from '@popup/App';
import { TokenOperationType } from '@popup/pages/app-container/home/tokens/token-operation/token-operation.component';
import React from 'react';
import tokenOperation from 'src/__tests__/popup/pages/app-container/home/tokens/token-operation/mocks/token-operation';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import {
  EventType,
  QueryDOM,
} from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import config from 'src/__tests__/utils-for-testing/setups/config';
import {
  clickAwait,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
config.byDefault();
const { methods, constants, extraMocks } = tokenOperation;
const { message, title, leoToken } = constants;
describe('token-operation.component tests:\n', () => {
  methods.afterEach;
  beforeEach(async () => {
    await tokenOperation.beforeEach(<App />);
  });
  describe('Staking', () => {
    beforeEach(async () => {
      await clickAwait([alButton.token.action.stake]);
    });
    it('Must load operation as stake', () => {
      assertion.getByLabelText(alComponent.tokensOperationPage);
      assertion.getOneByText(title.stake);
    });
    it('Must display stake info and input amount', () => {
      assertion.getManyByText(leoToken.screenInfo.stake);
      assertion.getByLabelText(alInput.amount);
    });
    it('Must show confirmation page', async () => {
      extraMocks.doesAccountExist(true);
      await clickTypeAwait([
        { ariaLabel: alInput.amount, event: EventType.TYPE, text: '1' },
        {
          ariaLabel:
            alButton.operation.tokens.preFix + TokenOperationType.STAKE,
          event: EventType.CLICK,
        },
      ]);
      assertion.getByLabelText(alComponent.confirmationPage);
      assertion.getManyByText([
        message.confirmation.stake,
        '1.00000000 LEO',
        'Amount',
        'Cancel',
        'Confirm',
      ]);
      assertion.getOneByText(message.confirmation.stake);
    });
    it('Must go back from confirmation when cancelling', async () => {
      extraMocks.doesAccountExist(true);
      await clickTypeAwait([
        { ariaLabel: alInput.amount, event: EventType.TYPE, text: '1' },
        {
          ariaLabel:
            alButton.operation.tokens.preFix + TokenOperationType.STAKE,
          event: EventType.CLICK,
        },
      ]);
      assertion.getByLabelText(alComponent.confirmationPage);
      await clickAwait([alButton.dialog.cancel]);
      assertion.queryByText('Confirm', false);
      assertion.getByLabelText(alComponent.tokensOperationPage);
    });
    it('Must show error if unexistent account', async () => {
      //popup_no_such_account
      extraMocks.doesAccountExist(false);
      await clickTypeAwait([
        { ariaLabel: alInput.amount, event: EventType.TYPE, text: '1' },
        {
          ariaLabel:
            alButton.operation.tokens.preFix + TokenOperationType.STAKE,
          event: EventType.CLICK,
        },
      ]);
      await assertion.awaitFor(message.error.noSuchAccount, QueryDOM.BYTEXT);
    });
    it.todo('Must show error if not enough balance'); //popup_html_power_up_down_error
    it.todo('Must show error if fails');
    it.todo('Must stake and show message');
  });
  describe('Unstaking', () => {
    it.todo('Must load operation as unstake and show message'); //popup_html_token_unstake_cooldown_disclaimer
    //common cases
  });
  describe('Delegating', () => {
    it.todo('Must load operation as delegation');
    //common cases
  });
  describe('No active key', () => {
    it.todo('Must show error trying to stake');
    it.todo('Must show error trying to unstake');
    it.todo('Must show error trying to delegate');
  });
});
