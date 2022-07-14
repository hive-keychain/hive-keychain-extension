import { ReactElement } from 'react';
import { HiveEngineConfigUtils } from 'src/utils/hive-engine-config.utils';
import HiveEngineUtils from 'src/utils/hive-engine.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import tokensList from 'src/__tests__/utils-for-testing/data/tokens/tokens-list';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';
import { PreFixTokens } from 'src/__tests__/utils-for-testing/types/tokens-types';

const leoTokenRaw = tokensList.alltokens.filter(
  (token) => token.symbol === 'LEO',
)[0] as any;

const selectPreFix = (symbol: string, preFix: PreFixTokens) =>
  alIcon.tokens.prefix[preFix] + symbol;

const constants = {
  username: mk.user.one,
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
  userToken: {
    data: {
      length: tokensUser.balances.length,
      tokens: tokensUser.balances,
      leoUrl: JSON.parse(leoTokenRaw.metadata).url,
    },
    screenInfo: {
      leoToken: [
        'LEO tokens',
        '@leofinance',
        'Balance: 38.861',
        'Staking: 1.060',
        'Delegation in: 1',
        'Delegation out: 1',
      ],
    },
  },
  toFind: {
    ariaLabels: {
      leoToken: [
        alButton.token.action.delegate,
        alButton.token.action.stake,
        alButton.token.action.unstake,
      ],
      pages: [alComponent.tokensHistory, alComponent.tokensTransfer],
    },
    cssClasses: {
      expandablePanel: {
        opened: 'expandable-panel opened',
        closed: 'expandable-panel closed',
      },
    },
  },
  buttonsIcons: [selectPreFix('LEO', 'history'), selectPreFix('LEO', 'send')],
};

const beforeEach = async (component: ReactElement) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({});
  extraMocks();
  renders.wInitialState(component, constants.stateAs);
  await assertion.awaitMk(constants.username);
  await clickAwait([alButton.actionBtn.tokens]);
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
  selectPreFix: selectPreFix,
  spyOnTabs: () => jest.spyOn(chrome.tabs, 'create'),
};

const extraMocks = () => {
  HiveEngineUtils.getIncomingDelegations = jest
    .fn()
    .mockResolvedValue(tokensUser.incomingDelegations);
  HiveEngineUtils.getOutgoingDelegations = jest
    .fn()
    .mockResolvedValue(tokensUser.outcomingDelegations);
  HiveEngineConfigUtils.getAccountHistoryApi().get = jest
    .fn()
    .mockResolvedValue({ data: [] });
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};
