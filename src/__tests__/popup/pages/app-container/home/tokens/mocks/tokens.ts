import { ReactElement } from 'react';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import tokensList from 'src/__tests__/utils-for-testing/data/tokens/tokens-list';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import { EventType } from 'src/__tests__/utils-for-testing/enums/enums';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { MocksToUse } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  clickAwait,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

const i18n = {
  get: (key: string, extra?: any) =>
    mocksImplementation.i18nGetMessageCustom(key, [extra]),
};

const constants = {
  username: mk.user.one,
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
  messages: {
    tokens: {
      disclaimer: i18n.get('popup_view_tokens_balance'),
      noTokens: i18n.get('popup_html_tokens_no_tokens'),
    },
    tokenFilter: {
      disclaimer: i18n.get('popup_html_tokens_settings_text'),
    },
  },
  data: {
    userTokens: {
      length: tokensUser.balances.length,
      leoToken: tokensUser.balances.filter(
        (token) => token.symbol === 'LEO',
      )[0],
      palToken: tokensUser.balances.filter(
        (token) => token.symbol === 'PAL',
      )[0],
    },
    tokensFilter: {
      list: {
        asDisplayed: tokensList.alltokens.map((token) => {
          return {
            name: token.name,
            issuedBy:
              token.symbol +
              ' ' +
              i18n.get('popup_token_issued_by', [token.issuer]),
            supply:
              i18n.get('popup_token_supply') +
              ' : ' +
              FormatUtils.nFormatter(parseFloat(token.supply), 3) +
              '/' +
              FormatUtils.nFormatter(parseFloat(token.maxSupply), 3),
          };
        }),
      },
    },
  },
  typeValue: {
    token: {
      keyChain: 'keyChainToken',
    },
    tokenFilter: {
      toFind: 'LEO',
      nonExistent: 'keyChain Token',
    },
  },
};

const beforeEach = async (
  component: ReactElement,
  toUse?: {
    noUserTokens?: boolean;
  },
) => {
  let remock: MocksToUse = {};
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  if (toUse?.noUserTokens) {
    remock = {
      tokens: { getUserBalance: [] },
    };
  }
  mockPreset.setOrDefault(remock);
  renders.wInitialState(component, constants.stateAs);
  await assertion.awaitMk(constants.username);
  await clickAwait([alButton.actionBtn.tokens]);
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
  typeOnFilter: async (text: string) => {
    await clickTypeAwait([
      {
        ariaLabel: alInput.filter.token,
        event: EventType.TYPE,
        text: text,
      },
    ]);
  },
  clickOnFilter: async () => await clickAwait([alIcon.tokens.openFilter]),
  spyLocalStorage: () =>
    jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage'),
};

export default {
  beforeEach,
  methods,
  constants,
};
