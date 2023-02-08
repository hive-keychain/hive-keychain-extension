import { TokenOperationType } from '@popup/pages/app-container/home/tokens/token-operation/token-operation.component';
import { ReactElement } from 'react';
import tokenOperationConstants from 'src/__tests__/popup/pages/app-container/home/tokens/token-operation/mocks/constants';
import tokenOperationExtraMocks from 'src/__tests__/popup/pages/app-container/home/tokens/token-operation/mocks/token-operation-extra-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import { EventType } from 'src/__tests__/utils-for-testing/enums/enums';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  clickAwait,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';
import { PreFixTokens } from 'src/__tests__/utils-for-testing/types/tokens-types';

const operationResult = {
  confirmed: { confirmed: true, error: null },
  error: { confirmed: true, error: 'error_token_transaction' },
  timeOut: undefined,
};

const leoTokenData = tokensUser.balances.filter(
  (token) => token.symbol === 'LEO',
)[0];

const selectPreFix = (symbol: string, preFix: PreFixTokens) =>
  alIcon.tokens.prefix[preFix] + symbol;

const constants = tokenOperationConstants.constants;

const beforeEach = async (
  component: ReactElement,
  removeActiveKey: boolean = false,
) => {
  const initialState = constants.stateAs;
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({
    tokens: {
      getUserBalance: tokensUser.balances.filter(
        (token) => token.symbol === 'LEO',
      ),
    },
  });
  extraMocks.saveTransferRecipient();
  if (removeActiveKey) {
    delete initialState.accounts[0].keys.active;
    delete initialState.accounts[0].keys.activePubkey;
  }
  renders.wInitialState(component, initialState);
  await assertion.awaitMk(constants.username);
  await clickAwait([alButton.actionBtn.tokens]);
  await clickAwait([selectPreFix('LEO', 'expandMore')]);
  await assertion.toHaveClass(
    alDiv.token.user.tokenInfo.expandablePanel,
    'expandable-panel opened',
  );
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
  userInteraction: async (
    inputAmount: string,
    buttonOperation: TokenOperationType,
    confirmTransaction: boolean = false,
    addDelegateTo: boolean = false,
  ) => {
    if (addDelegateTo) {
      await clickTypeAwait([
        {
          ariaLabel: alInput.username,
          event: EventType.TYPE,
          text: mk.user.two,
        },
      ]);
    }
    await clickTypeAwait([
      { ariaLabel: alInput.amount, event: EventType.TYPE, text: inputAmount },
      {
        ariaLabel: alButton.operation.tokens.preFix + buttonOperation,
        event: EventType.CLICK,
      },
    ]);
    if (confirmTransaction) {
      await clickAwait([alButton.dialog.confirm]);
    }
  },
};

const extraMocks = tokenOperationExtraMocks.mocks;

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
  leoTokenData,
  operationResult,
};
