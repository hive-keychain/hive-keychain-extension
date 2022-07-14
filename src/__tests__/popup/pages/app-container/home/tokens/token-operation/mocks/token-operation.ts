import { TokenOperationType } from '@popup/pages/app-container/home/tokens/token-operation/token-operation.component';
import { ReactElement } from 'react';
import AccountUtils from 'src/utils/account.utils';
import HiveEngineUtils from 'src/utils/hive-engine.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';
import { PreFixTokens } from 'src/__tests__/utils-for-testing/types/tokens-types';

const leoTokenData = tokensUser.balances.filter(
  (token) => token.symbol === 'LEO',
)[0];

const selectPreFix = (symbol: string, preFix: PreFixTokens) =>
  alIcon.tokens.prefix[preFix] + symbol;

const i18n = {
  get: (key: string, options?: string[] | undefined) =>
    mocksImplementation.i18nGetMessageCustom(key, options),
};

const constants = {
  username: mk.user.one,
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
  message: {
    disclaimer: i18n.get('popup_html_tokens_operation_text'),
    confirmation: {
      stake: i18n.get(
        `popup_html_${TokenOperationType.STAKE}_tokens_confirm_text`,
      ),
    },
    error: {
      noSuchAccount: i18n.get('popup_no_such_account'),
    },
  },
  title: {
    stake: i18n.get(`popup_html_${TokenOperationType.STAKE}_tokens`),
    unstake: i18n.get(`popup_html_${TokenOperationType.UNSTAKE}_tokens`),
    delegate: i18n.get(`popup_html_${TokenOperationType.DELEGATE}_tokens`),
  },
  leoToken: {
    screenInfo: {
      stake: [
        `${leoTokenData.balance} LEO`,
        i18n.get('popup_html_balance'),
        i18n.get('popup_html_token_stake'),
      ],
      unstake: '', //TODO
      delegate: '', //TODO
    },
  },
};

const beforeEach = async (component: ReactElement) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({});
  extraMocks.incomingOutcoming();
  renders.wInitialState(component, constants.stateAs);
  await assertion.awaitMk(constants.username);
  await clickAwait([
    alButton.actionBtn.tokens,
    selectPreFix('LEO', 'expandMore'),
  ]);
  await assertion.toHaveClass(
    alDiv.token.user.tokenInfo.expandablePanel,
    'expandable-panel opened',
  );
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
};

const extraMocks = {
  incomingOutcoming: () => {
    HiveEngineUtils.getIncomingDelegations = jest
      .fn()
      .mockResolvedValue(tokensUser.incomingDelegations);
    HiveEngineUtils.getOutgoingDelegations = jest
      .fn()
      .mockResolvedValue(tokensUser.outcomingDelegations);
  },
  doesAccountExist: (exist: boolean) =>
    (AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(exist)),
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};
