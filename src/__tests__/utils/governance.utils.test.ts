import AccountUtils from 'src/utils/account.utils';
import { GovernanceUtils } from 'src/utils/governance.utils';

describe('governance utils test', () => {
  test('getGovernanceReminderList tests', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2022/07/27'));
    AccountUtils.getExtendedAccounts = jest.fn().mockResolvedValueOnce([
      {
        name: 'account1',
        governance_vote_expiration_ts: '2022-06-28T02:02:33',
      },
      {
        name: 'account2',
        governance_vote_expiration_ts: '2023-07-28T02:02:33',
      },
      {
        name: 'account3',
        governance_vote_expiration_ts: '2022-07-28T02:02:33',
      },
      {
        name: 'account4',
        governance_vote_expiration_ts: '2022-06-28T02:02:33',
      },
      {
        name: 'account5',
        governance_vote_expiration_ts: '2023-07-28T02:02:33',
      },
      {
        name: 'account6',
        governance_vote_expiration_ts: '2022-07-28T02:02:33',
      },
      {
        name: 'account7',
        governance_vote_expiration_ts: '2022-06-28T02:02:33',
      },
      {
        name: 'account8',
        governance_vote_expiration_ts: '2023-07-28T02:02:33',
      },
      {
        name: 'account9',
        governance_vote_expiration_ts: '2022-07-28T02:02:33',
      },
    ]);

    GovernanceUtils.getGovernanceRenewalIgnored = jest
      .fn()
      .mockResolvedValueOnce({
        account1: '2021-05-22T00:00:00',
        account2: '2021-05-22T00:00:00',
        account3: '2021-05-22T00:00:00',
        account4: '2022-05-22T00:00:00',
        account5: '2022-05-22T00:00:00',
        account6: '2022-05-22T00:00:00',
      });

    const accountsToRemind = await GovernanceUtils.getGovernanceReminderList([
      'account1',
      'account2',
      'account3',
      'account4',
      'account5',
      'account6',
      'account7',
      'account8',
      'account9',
    ]);

    expect(accountsToRemind).toEqual(['account3', 'account9']);
  });
});
