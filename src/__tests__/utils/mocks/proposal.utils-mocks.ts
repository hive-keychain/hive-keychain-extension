import { Asset } from '@hiveio/dhive';
import { store } from '@popup/store';
import moment from 'moment';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import ProposalUtils from 'src/utils/proposal.utils';
import proposal from 'src/__tests__/utils-for-testing/data/proposal';
import rpc from 'src/__tests__/utils-for-testing/data/rpc';

const constants = {
  withKeyChainProposal: {
    proposals: [
      ...proposal.fakeProposalListResponseHiveTx.proposals,
      proposal.fakeProposalKeyChainHiveTx,
    ],
  },
  expectedResultProposalWithkeyChain: [
    ...proposal.expectedResultProposal,
    {
      id: 216,
      creator: 'keychain',
      receiver: 'keychain',
      startDate: moment('2022-05-15T00:00:00'),
      endDate: moment('2023-05-15T00:00:00'),
      dailyPay: Asset.fromString('390.000 HBD'),
      subject: 'Hive Keychain development',
      totalVotes: '0 HP',
      link: 'https://peakd.com/proposals/216',
      proposalId: 216,
      voted: true,
      funded: 'totally_funded',
    },
  ],
};

const mocks = {
  getProposalDailyBudget: (dailyBudget: number) =>
    jest
      .spyOn(ProposalUtils, 'getProposalDailyBudget')
      .mockResolvedValue(dailyBudget),
  hiveTxUtils: {
    getData: (data: any) =>
      jest.spyOn(HiveTxUtils, 'getData').mockResolvedValue(data),
  },
  store: {
    getState: (data: any) =>
      jest.spyOn(store, 'getState').mockReturnValue(data),
  },
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
  beforeEach: beforeEach(() => {
    HiveTxUtils.setRpc(rpc.fake);
  }),
};

export default { mocks, methods, constants };
