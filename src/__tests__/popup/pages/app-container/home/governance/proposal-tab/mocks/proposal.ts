import KeychainApi from '@api/keychain';
import { Proposal } from '@popup/pages/app-container/home/governance/proposal-tab/proposal-tab.component';
import { screen } from '@testing-library/react';
import { ReactElement } from 'react';
import ProposalUtils from 'src/utils/proposal.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import proposal from 'src/__tests__/utils-for-testing/data/proposal';
import witness from 'src/__tests__/utils-for-testing/data/witness';
import { Tab } from 'src/__tests__/utils-for-testing/enums/enums';
import mocks from 'src/__tests__/utils-for-testing/helpers/mocks';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  actRunAllTimers,
  userEventPendingTimers,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

const i18n = {
  get: (key: string) => mocksImplementation.i18nGetMessageCustom(key),
};

const proposalUpdated = [...proposal.expectedResponse] as Proposal[];
proposalUpdated[0].voted = true;

const constants = {
  proposalResponse: proposalUpdated as Proposal[],
  selectedProposal: {
    data: proposalUpdated[0] as Proposal,
    ariaLabel: {
      id: `${alDiv.proposal.item.prefix}${proposalUpdated[0].id}`,
    },
  },
  proposalLength: proposalUpdated.length,
  fundedToolTip: i18n.get(
    `popup_html_proposal_funded_option_${proposalUpdated[0].funded}`,
  ),
  url: { url: `https://peakd.com/@${proposalUpdated[0].creator}` },
};

const spy = {
  chromeTabs: () => jest.spyOn(chrome.tabs, 'create'),
};

const beforeEach = async (
  component: ReactElement,
  //accounts: LocalAccount[],
) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({});
  extraMocks();
  renders.wInitialState(component, initialStates.iniStateAs.defaultExistent);
  await assertion.awaitMk(mk.user.one);
  await methods.clickGovernance();
  actRunAllTimers();
  await methods.gotoTab(Tab.PROPOSAL);
};

const methods = {
  afterEach: afterEach(() => {
    afterTests.clean();
  }),
  clickGovernance: async () => {
    await userEventPendingTimers.click(
      screen.getByLabelText(alButton.actionBtn.governance),
    );
  },
  gotoTab: async (tab: Tab) => {
    await userEventPendingTimers.click(screen.getAllByRole('tab')[tab]);
  },
  assertProposals: () => {
    constants.proposalResponse.forEach((proposal) => {
      assertion.getByLabelText(`${alDiv.proposal.item.prefix}${proposal.id}`);
    });
  },
};

const extraMocks = () => {
  KeychainApi.get = jest.fn().mockResolvedValue(witness.ranking);
  ProposalUtils.getProposalList = jest
    .fn()
    .mockResolvedValue(proposal.expectedResponse);
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
  spy,
};
