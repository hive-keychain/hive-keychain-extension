import { ReactElement } from 'react';
import Config from 'src/config';
import ProposalUtils from 'src/utils/proposal.utils';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { RootState } from 'src/__tests__/utils-for-testing/fake-store';
import mocks from 'src/__tests__/utils-for-testing/helpers/mocks';
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
  urlProposal: {
    url: `https://peakd.com/me/proposals/${Config.KEYCHAIN_PROPOSAL}`,
  },
  textRequest: i18n.get('popup_html_proposal_request'),
  voting: {
    success: i18n.get('popup_html_kc_proposal_vote_successful'),
    failed: i18n.get('popup_html_proposal_vote_fail'),
  },
  missingKey: i18n.get('popup_missing_key', ['active']),
};

const beforeEach = async (
  component: ReactElement,
  toUse?: {
    hasVoted?: boolean;
    removeActiveKey?: boolean;
  },
) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  let remock: MocksToUse = {};
  if (toUse?.hasVoted) {
    remock = { proposal: { hasVotedForProposal: toUse?.hasVoted } };
  }
  mockPreset.setOrDefault(remock);
  if (toUse?.removeActiveKey) {
    delete constants.stateAs.accounts[0].keys.active;
    delete constants.stateAs.accounts[0].keys.activePubkey;
  }
  renders.wInitialState(component, constants.stateAs);
  await assertion.awaitMk(constants.username);
  await clickAwait([alDiv.proposalVotingSection]);
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
  spyChromeTabs: () => jest.spyOn(chrome.tabs, 'create'),
};

const extraMocks = {
  hasVoted: (voted: boolean) => {
    ProposalUtils.hasVotedForProposal = jest.fn().mockResolvedValue(voted);
  },
  vote: (vote: boolean) => {
    ProposalUtils.voteForKeychainProposal = jest.fn().mockResolvedValue(vote);
  },
};

/**
 * Conveniently to add data to be checked on home page, as text or aria labels.
 */
const userInformation = () => {};

mocks.helper();

export default {
  beforeEach,
  userInformation,
  methods,
  constants,
  extraMocks,
};
