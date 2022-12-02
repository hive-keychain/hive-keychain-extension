import { act, screen } from '@testing-library/react';
import { ReactElement } from 'react';
import BlockchainTransactionUtils from 'src/utils/blockchain.utils';
import ProxyUtils from 'src/utils/proxy.utils';
import WitnessUtils from 'src/utils/witness.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alIcon from 'src/__tests__/utils-for-testing/aria-labels/al-icon';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import witness from 'src/__tests__/utils-for-testing/data/witness';
import { EventType } from 'src/__tests__/utils-for-testing/enums/enums';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { MocksToUse } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  actRunAllTimers,
  clickAwait,
  clickTypeAwait,
  userEventPendingTimers,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

const i18n = {
  get: (key: string, extra?: any) =>
    mocksImplementation.i18nGetMessageCustom(key, extra),
};

const constants = {
  stateAs: initialStates.iniStateAs.defaultExistent,
  rankingError: i18n.get('popup_html_error_retrieving_witness_ranking').trim(),
  rankingErrors: 2,
  voted: accounts.extended.witness_votes.length,
  witnessData: {
    data: [
      ...witness.ranking.data,
      {
        name: 'theghost1980',
        rank: '200',
        votes: '1000',
        votes_count: 1000,
        signing_key: witness.inactiveKey,
        url: 'https://saturnoman.com',
      },
    ],
  },
  infoMessage: i18n.get('html_popup_link_to_witness_website').trim(),
  spy: {
    chromeTabs: () => jest.spyOn(chrome.tabs, 'create'),
  },
  urlArcange: { url: witness.arcangeLink },
  errorUnvote: i18n.get('popup_error_unvote_wit', ['blocktrades']).trim(),
  successUnVote: i18n.get('popup_success_unvote_wit', ['blocktrades']),
  errorVote: i18n.get('popup_error_wit', [witness.ranking.data[4].name]),
  successVote: i18n.get('popup_success_wit', [witness.ranking.data[4].name]),
};

const beforeEach = async (
  component: ReactElement,
  errorWitnessData: boolean = false,
  findUserProxy: string | null,
) => {
  let remock: MocksToUse = {
    keyChainApiGet: { customData: { witnessRanking: constants.witnessData } },
  };
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  if (errorWitnessData === true) {
    remock = {
      keyChainApiGet: {
        customData: { witnessRanking: { data: '' } },
      },
    };
  }
  mockPreset.setOrDefault(remock);
  extraMocks({ findUserProxy: findUserProxy });
  renders.wInitialState(component, constants.stateAs);
  await assertion.awaitMk(mk.user.one);
  await methods.clickGovernance();
  actRunAllTimers();
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
  clickGovernance: async () => {
    await clickAwait([alButton.menu, alButton.menuPreFix + alIcon.governance]);
  },
  filterBox: async (toSearch: string) => {
    await clickTypeAwait([
      {
        ariaLabel: alInput.filter.ranking,
        event: EventType.TYPE,
        text: toSearch,
      },
    ]);
  },
  clickOneBy: async (ariaLabel: string, index: number) => {
    await act(async () => {
      await userEventPendingTimers.click(
        screen.getAllByLabelText(ariaLabel)[index],
      );
    });
  },
  getData: (index: number) => {
    return constants.witnessData.data[index];
  },
};

const extraMocks = (toUse: {
  unvoteWitness?: boolean;
  findUserProxy?: string | null;
  voteWitness?: boolean;
}) => {
  BlockchainTransactionUtils.delayRefresh = jest.fn();
  WitnessUtils.unvoteWitness = jest
    .fn()
    .mockResolvedValueOnce(toUse.unvoteWitness);
  ProxyUtils.findUserProxy = jest.fn().mockResolvedValue(toUse.findUserProxy);
  WitnessUtils.voteWitness = jest.fn().mockResolvedValueOnce(toUse.voteWitness);
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};
