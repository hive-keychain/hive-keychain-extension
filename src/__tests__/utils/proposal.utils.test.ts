import { ActiveAccount } from '@interfaces/active-account.interface';
import moment from 'moment';
import HiveUtils from 'src/utils/hive.utils';
import ProposalUtils from 'src/utils/proposal.utils';
import proposal from 'src/__tests__/utils-for-testing/data/proposal';
import rpc from 'src/__tests__/utils-for-testing/data/rpc';

afterEach(() => {
  jest.clearAllMocks();
});
describe('proposal.utils tests:\n', () => {
  beforeEach(() => {
    HiveUtils.setRpc(rpc.fake);
  });
  describe('hasVotedForProposal tests:\n', () => {
    test('Must return true if voted', async () => {
      HiveUtils.getClient().database.call = jest
        .fn()
        .mockResolvedValue(proposal.fakeVotedAccountResponse);
      const account = { name: 'theghost1980' } as ActiveAccount;
      const result = await ProposalUtils.hasVotedForProposal(account);
      expect(result).toBe(true);
    });

    test('Must return false if not voted', async () => {
      HiveUtils.getClient().database.call = jest
        .fn()
        .mockResolvedValue(proposal.fakeVotedAccountResponse);
      const account = { name: 'no_voted_acount' } as ActiveAccount;
      const result = await ProposalUtils.hasVotedForProposal(account);
      expect(result).toBe(false);
    });
  });

  describe('getProposalList tests:\n', () => {
    test('Passing a user that hasnt voted on any proposal, must return a list of proposal with a field false on each one', async () => {
      HiveUtils.getClient().database.call = jest
        .fn()
        .mockResolvedValueOnce(proposal.fakeProposalListResponse)
        .mockResolvedValueOnce(proposal.fakeListProposalVotesResponse);

      ProposalUtils.getProposalDailyBudget = jest
        .fn()
        .mockResolvedValueOnce(proposal.fakeDailyBudgetResponse);

      const result = await ProposalUtils.getProposalList('theghost1980');
      expect(result).toEqual(proposal.expectedResultProposal);
    });
    test('Passing a user that has voted on the keychain proposal, must return a list of proposal with one voted proposal', async () => {
      const withKeyChainProposal = {
        proposals: [
          ...proposal.fakeProposalListResponse.proposals,
          proposal.fakeProposalKeyChain,
        ],
      };
      const expectedResultProposalWithkeyChain = [
        ...proposal.expectedResultProposal,
        {
          id: 216,
          creator: 'keychain',
          receiver: 'keychain',
          startDate: moment('2022-05-15T00:00:00'),
          endDate: moment('2023-05-15T00:00:00'),
          dailyPay: '390 HBD',
          subject: 'Hive Keychain development',
          totalVotes: '0 HP',
          link: 'https://peakd.com/proposals/216',
          proposalId: 216,
          voted: true,
          funded: 'totally_funded',
        },
      ];

      HiveUtils.getClient().database.call = jest
        .fn()
        .mockResolvedValueOnce(withKeyChainProposal)
        .mockResolvedValueOnce(proposal.fakeListProposalVotesResponse);

      ProposalUtils.getProposalDailyBudget = jest
        .fn()
        .mockResolvedValueOnce(proposal.fakeDailyBudgetResponse);

      const result = await ProposalUtils.getProposalList('theghost1980');
      expect(result).toEqual(expectedResultProposalWithkeyChain);
    });
  });
});
