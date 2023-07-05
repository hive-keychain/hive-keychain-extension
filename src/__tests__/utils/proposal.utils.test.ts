import { Asset } from '@hiveio/dhive';
import { FundedOption } from '@interfaces/proposal.interface';
import moment from 'moment';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import proposal from 'src/__tests__/utils-for-testing/data/proposal';
import rpc from 'src/__tests__/utils-for-testing/data/rpc';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import ProposalUtils from 'src/utils/proposal.utils';

describe('proposal.utils tests:\n', () => {
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
        totalVotes: '33.43M HP',
        link: 'https://peakd.com/proposals/216',
        proposalId: 216,
        voted: true,
        funded: 'totally_funded',
      },
    ],
  };
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  });
  beforeEach(async () => {
    await HiveTxUtils.setRpc(rpc.fake);
  });
  describe('hasVotedForProposal tests:\n', () => {
    test('Must return true if voted', async () => {
      jest
        .spyOn(HiveTxUtils, 'getData')
        .mockResolvedValue(proposal.fakeVotedAccountResponse);
      const result = await ProposalUtils.hasVotedForProposal('theghost1980');
      expect(result).toBe(true);
    });

    test('Must return true if voted on specified proposalId', async () => {
      jest
        .spyOn(HiveTxUtils, 'getData')
        .mockResolvedValue(proposal.fakeVotedAccountResponse);

      const result = await ProposalUtils.hasVotedForProposal(
        'theghost1980',
        proposal.fakeListProposalVotesResponse[0].id,
      );
      expect(result).toBe(true);
    });

    test('Must return false if not voted', async () => {
      jest
        .spyOn(HiveTxUtils, 'getData')
        .mockResolvedValue(proposal.fakeVotedAccountResponse);

      const result = await ProposalUtils.hasVotedForProposal('no_voted_acount');
      expect(result).toBe(false);
    });
  });

  describe('getProposalList tests:\n', () => {
    test('Passing a user that hasnt voted on any proposal, must return a list of proposal with a field false on each one', async () => {
      jest
        .spyOn(ProposalUtils, 'getProposalDailyBudget')
        .mockResolvedValue(proposal.fakeDailyBudgetResponse);
      mocksImplementation.hiveTxUtils.getData({
        listProposals: proposal.fakeProposalListResponseHiveTx.proposals,
        listProposalVotes: proposal.fakeListProposalVotesResponse,
      });
      const result = await ProposalUtils.getProposalList(
        'theghost1980',
        dynamic.globalProperties,
      );
      expect(result).toEqual(proposal.expectedResultProposal);
    });

    test('Passing a user that has voted on the keychain proposal, must return a list of proposal with one voted proposal', async () => {
      jest
        .spyOn(ProposalUtils, 'getProposalDailyBudget')
        .mockResolvedValue(proposal.fakeDailyBudgetResponse);
      mocksImplementation.hiveTxUtils.getData({
        listProposals: constants.withKeyChainProposal.proposals,
        listProposalVotes: proposal.fakeListProposalVotesResponse,
      });

      const result = await ProposalUtils.getProposalList(
        'theghost1980',
        dynamic.globalProperties,
      );
      expect(result).toEqual(constants.expectedResultProposalWithkeyChain);
    });
  });

  describe('getFundedOption cases:\n', () => {
    it('Must return TOTALLY_FUNDED', () => {
      expect(ProposalUtils.getFundedOption(1, 10)).toBe(
        FundedOption.TOTALLY_FUNDED,
      );
    });

    it('Must return PARTIALLY_FUNDED', () => {
      expect(ProposalUtils.getFundedOption(10, 1)).toBe(
        FundedOption.PARTIALLY_FUNDED,
      );
    });

    it('Must return NOT_FUNDED', () => {
      expect(ProposalUtils.getFundedOption(10, -1)).toBe(
        FundedOption.NOT_FUNDED,
      );
    });
  });
});
