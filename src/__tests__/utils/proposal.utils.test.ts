import * as hive from '@hiveio/hive-js';
import { ActiveAccount } from '@interfaces/active-account.interface';
import moment from 'moment';
import HiveUtils from 'src/utils/hive.utils';
import ProposalUtils from 'src/utils/proposal.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';

afterEach(() => {
  jest.clearAllMocks();
});
describe('proposal.utils tests:\n', () => {
  describe('hasVotedForProposal tests:\n', () => {
    test('Passing an account which voted for keychain proposal, must return true', async () => {
      hive.api.listProposalVotesAsync = jest
        .fn()
        .mockResolvedValueOnce(utilsT.fakeVotedAccountResponse);
      const account = { name: 'theghost1980' } as ActiveAccount;
      const result = await ProposalUtils.hasVotedForProposal(account);
      expect(result).toBe(true);
    });
    test('Passing an account which has not voted for keychain proposal, must return false', async () => {
      hive.api.listProposalVotesAsync = jest
        .fn()
        .mockResolvedValueOnce(utilsT.fakeVotedAccountResponse);
      const account = { name: 'no_voted_acount' } as ActiveAccount;
      const result = await ProposalUtils.hasVotedForProposal(account);
      expect(result).toBe(false);
    });
  });

  describe('getProposalList tests:\n', () => {
    test('Passing a user that hasnt voted on any proposal, must return a list of proposal with a field false on each one', async () => {
      const showResult = false;
      const mockHiveApi = (hive.api.callAsync = jest
        .fn()
        .mockResolvedValueOnce(utilsT.fakeProposalListResponse)
        .mockResolvedValueOnce(utilsT.fakeListProposalVotesResponse));

      const mockDailyBudgetApi = (HiveUtils.getProposalDailyBudget = jest
        .fn()
        .mockResolvedValueOnce(utilsT.fakeDailyBudgetResponse));

      const result = await ProposalUtils.getProposalList(
        'theghost1980',
        utilsT.dynamicPropertiesObj,
      );
      if (showResult) {
        console.log(result);
      }
      expect(result).toEqual(utilsT.expectedResultProposal);
      expect(mockHiveApi).toBeCalledTimes(2);
      expect(mockDailyBudgetApi).toBeCalledTimes(1);
    });
    test('Passing a user that has voted on the keychain proposal, must return a list of proposal with one voted proposal', async () => {
      const withKeyChainProposal = {
        proposals: [
          ...utilsT.fakeProposalListResponse.proposals,
          utilsT.fakeProposalKeyChain,
        ],
      };
      const expectedResultProposalWithkeyChain = [
        ...utilsT.expectedResultProposal,
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
      const showResult = false;
      const mockHiveApi = (hive.api.callAsync = jest
        .fn()
        .mockResolvedValueOnce(withKeyChainProposal)
        .mockResolvedValueOnce(utilsT.fakeListProposalVotesResponse));

      const mockDailyBudgetApi = (HiveUtils.getProposalDailyBudget = jest
        .fn()
        .mockResolvedValueOnce(utilsT.fakeDailyBudgetResponse));

      const result = await ProposalUtils.getProposalList(
        'theghost1980',
        utilsT.dynamicPropertiesObj,
      );
      if (showResult) {
        console.log(result);
      }
      expect(result).toEqual(expectedResultProposalWithkeyChain);
      expect(mockHiveApi).toBeCalledTimes(2);
      expect(mockDailyBudgetApi).toBeCalledTimes(1);
    });
  });
});
