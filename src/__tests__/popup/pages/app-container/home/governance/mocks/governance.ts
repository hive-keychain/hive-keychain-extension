import { screen } from '@testing-library/react';
import { ReactElement } from 'react';
import ProposalUtils from 'src/utils/proposal.utils';
import ProxyUtils from 'src/utils/proxy.utils';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import proposal from 'src/__tests__/utils-for-testing/data/proposal';
import witness from 'src/__tests__/utils-for-testing/data/witness';
import { Tab } from 'src/__tests__/utils-for-testing/enums/enums';
import mocks from 'src/__tests__/utils-for-testing/helpers/mocks';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import afterTests from 'src/__tests__/utils-for-testing/setups/afterTests';
import {
  actAdvanceTime,
  actRunAllTimers,
  userEventPendingTimers,
} from 'src/__tests__/utils-for-testing/setups/events';
import renders from 'src/__tests__/utils-for-testing/setups/renders';

const beforeEach = async (component: ReactElement) => {
  jest.useFakeTimers('legacy');
  actAdvanceTime(4300);
  mockPreset.setOrDefault({
    keyChainApiGet: {
      customData: { witnessRanking: witness.rankingWInactive },
    },
  });
  extraMocks();
  renders.wInitialState(component, initialStates.iniStateAs.defaultExistent);
  await assertion.awaitMk(mk.user.one);
  await methods.clickGovernance();
  actRunAllTimers();
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
};

const extraMocks = () => {
  ProxyUtils.findUserProxy = jest.fn().mockResolvedValue(null);
  ProposalUtils.getProposalList = jest
    .fn()
    .mockResolvedValue(proposal.expectedResponse);
  ProxyUtils.findUserProxy = jest.fn().mockResolvedValue('keychain');
};

mocks.helper();

export default {
  beforeEach,
  methods,
  extraMocks,
};
