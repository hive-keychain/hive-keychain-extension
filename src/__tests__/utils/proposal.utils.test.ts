import { ActiveAccount } from '@interfaces/active-account.interface';
import ProposalUtils from 'src/utils/proposal.utils';

describe('proposal.utils tests:\n', () => {
  describe('hasVotedForProposal tests:\n', () => {
    test('should ', async () => {
      const account = { name: 'theghost1980' } as ActiveAccount;
      const result = await ProposalUtils.hasVotedForProposal(account);
      expect(result).toBe(true);
    });
  });
});
