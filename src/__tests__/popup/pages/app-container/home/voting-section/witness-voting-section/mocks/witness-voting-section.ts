import { ExtendedAccount } from '@hiveio/dhive';
import { ReactElement } from 'react';
import WitnessUtils from 'src/utils/witness.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { MocksToUse } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

const i18n = {
  get: (message: string, options?: string[]) =>
    mocksImplementation.i18nGetMessageCustom(message, options),
};

const constants = {
  username: mk.user.one,
  stateAs: { ...initialStates.iniStateAs.defaultExistent } as RootState,
  maxVotesExtended: {
    ...accounts.extended,
    witnesses_voted_for: 30,
  } as ExtendedAccount,
  textMessage: i18n.get('html_popup_made_with_love_by_stoodkev'),
  voting: {
    success: i18n.get('html_popup_vote_stoodkev_witness_success'),
    noMoreVotes: i18n.get('html_popup_vote_stoodkev_witness_error_30_votes'),
  },
  missingKey: i18n.get('popup_missing_key', ['active']),
};

const beforeEach = async (
  component: ReactElement,
  toUse?: {
    noVotesleft?: boolean;
    removeActiveKey?: boolean;
  },
) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  let remock: MocksToUse = {};
  if (toUse?.noVotesleft) {
    remock = { app: { getExtendedAccount: constants.maxVotesExtended } };
  }
  mockPreset.setOrDefault(remock);
  if (toUse?.removeActiveKey) {
    delete constants.stateAs.accounts[0].keys.active;
    delete constants.stateAs.accounts[0].keys.activePubKey;
  }
  renders.wInitialState(component, constants.stateAs);
  await assertion.awaitMk(constants.username);
  await clickAwait([alButton.menu]);
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
};

const extraMocks = {
  vote: (vote: boolean) => {
    WitnessUtils.voteWitness = jest.fn().mockResolvedValue(vote);
  },
};

export default {
  beforeEach,
  methods,
  constants,
  extraMocks,
};
