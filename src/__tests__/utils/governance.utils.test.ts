import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import governanceUtilsMocks from 'src/__tests__/utils/mocks/governance.utils-mocks';
import AccountUtils from 'src/utils/account.utils';
import { GovernanceUtils } from 'src/utils/governance.utils';

describe('governance utils test', () => {
  const { constants, mocks, spies, methods } = governanceUtilsMocks;
  methods.afterEach;
  describe('getGovernanceRenewalIgnored cases:\n', () => {
    test('getGovernanceReminderList tests', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2022/07/27'));
      AccountUtils.getExtendedAccounts = jest
        .fn()
        .mockResolvedValueOnce(constants.extendedAccountsResponse);
      mocks.getValueFromLocalStorage(constants.renewalIgnored);
      const accountsToRemind = await GovernanceUtils.getGovernanceReminderList(
        constants.reminderList,
      );
      expect(accountsToRemind).toEqual(['account3', 'account9']);
    });
  });

  describe('addToIgnoreRenewal cases:\n', () => {
    it('Must add to ignored', async () => {
      mocks.getValueFromLocalStorage(undefined);
      await GovernanceUtils.addToIgnoreRenewal([mk.user.one]);
      const { calls } = spies.saveValueInLocalStorage.mock;
      expect(calls[0][0]).toBe(LocalStorageKeyEnum.GOVERNANCE_RENEWAL_IGNORED);
      expect(calls[0][1][`${mk.user.one}`]).toBeDefined();
    });
  });

  describe('removeFromIgnoreRenewal cases:\n', () => {
    it('Must remove ignored user', async () => {
      mocks.getValueFromLocalStorage({ 'keychain.tests': 'user_ignored' });
      await GovernanceUtils.removeFromIgnoreRenewal(mk.user.one);
      const { calls } = spies.saveValueInLocalStorage.mock;
      expect(calls[0][0]).toBe(LocalStorageKeyEnum.GOVERNANCE_RENEWAL_IGNORED);
      expect(calls[0][1]).toEqual({});
    });

    it('Must call saveValueInLocalStorage if nothing to remove', async () => {
      mocks.getValueFromLocalStorage(undefined);
      await GovernanceUtils.removeFromIgnoreRenewal(mk.user.one);
      const { calls } = spies.saveValueInLocalStorage.mock;
      expect(calls[0][0]).toBe(LocalStorageKeyEnum.GOVERNANCE_RENEWAL_IGNORED);
      expect(calls[0][1]).toEqual({});
    });
  });

  // describe('renewUsersGovernance cases:\n', () => {
  //   it('Must call renew a voted proposal', async () => {
  //     ProposalUtils.hasVotedForProposal = jest.fn().mockResolvedValue(true);
  //     await GovernanceUtils.renewUsersGovernance(
  //       [mk.user.one],
  //       accounts.twoAccounts,
  //     );
  //     expect(spies.ProposalUtils.unvoteProposal).toBeCalledTimes(1);
  //     expect(spies.ProposalUtils.voteProposal).toBeCalledTimes(1);
  //   });

  //   it('Must call renew an unvoted proposal', async () => {
  //     ProposalUtils.hasVotedForProposal = jest.fn().mockResolvedValue(false);
  //     await GovernanceUtils.renewUsersGovernance(
  //       [mk.user.one],
  //       accounts.twoAccounts,
  //     );
  //     expect(spies.ProposalUtils.voteProposal).toBeCalledTimes(1);
  //     expect(spies.ProposalUtils.unvoteProposal).toBeCalledTimes(1);
  //   });

  //   it('Must call Logger if an error', async () => {
  //     const networkError = new Error('Network error.');
  //     ProposalUtils.hasVotedForProposal = jest
  //       .fn()
  //       .mockRejectedValue(networkError);
  //     try {
  //       await GovernanceUtils.renewUsersGovernance(
  //         [mk.user.one],
  //         accounts.twoAccounts,
  //       );
  //     } catch (error) {
  //       expect(spies.logger.error).toBeCalledWith(
  //         'Error while renewing proposal',
  //         networkError,
  //       );
  //     }
  //   });
  // });

  describe('getGovernanceReminderList cases:\n', () => {
    // it('Must return reminder list', async () => {
    //   mocks.getExtendedAccounts([accounts.extended]);
    //   mocks.getValueFromLocalStorage([
    //     { 'keychain.tests': '14/02/2023' },
    //     { theghost1980: 'not_this_user' },
    //   ]);
    //   expect(
    //     await GovernanceUtils.getGovernanceReminderList([mk.user.one]),
    //   ).toEqual([]);
    // });
  });
});
