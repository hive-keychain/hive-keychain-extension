import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import moment from 'moment';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import AccountUtils from 'src/utils/account.utils';
import { GovernanceUtils } from 'src/utils/governance.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('governance utils test', () => {
  const constants = {
    extendedAccountsResponse: [
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
    ],
    renewalIgnored: {
      account1: '2021-05-22T00:00:00',
      account2: '2021-05-22T00:00:00',
      account3: '2021-05-22T00:00:00',
      account4: '2022-05-22T00:00:00',
      account5: '2022-05-22T00:00:00',
      account6: '2022-05-22T00:00:00',
    },
    reminderList: [
      'account1',
      'account2',
      'account3',
      'account4',
      'account5',
      'account6',
      'account7',
      'account8',
      'account9',
    ],
  };
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  });
  describe('getGovernanceRenewalIgnored cases:\n', () => {
    it('Must get accounts to remind', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2022/07/27'));
      AccountUtils.getExtendedAccounts = jest
        .fn()
        .mockResolvedValueOnce(constants.extendedAccountsResponse);
      LocalStorageUtils.getValueFromLocalStorage = jest
        .fn()
        .mockResolvedValue(constants.renewalIgnored);
      const accountsToRemind = await GovernanceUtils.getGovernanceReminderList(
        constants.reminderList,
      );
      expect(accountsToRemind).toEqual(['account3', 'account9']);
    });
  });

  describe('addToIgnoreRenewal cases:\n', () => {
    it('Must add to ignored', async () => {
      const sSaveValueInLocalStorage = jest.spyOn(
        LocalStorageUtils,
        'saveValueInLocalStorage',
      );
      LocalStorageUtils.getValueFromLocalStorage = jest
        .fn()
        .mockResolvedValue(undefined);
      await GovernanceUtils.addToIgnoreRenewal([mk.user.one]);
      expect(sSaveValueInLocalStorage).toHaveBeenCalledWith(
        LocalStorageKeyEnum.GOVERNANCE_RENEWAL_IGNORED,
        {
          'keychain.tests': moment().utc().toString(),
        },
      );
    });
  });

  describe('removeFromIgnoreRenewal cases:\n', () => {
    it('Must remove ignored user', async () => {
      const sSaveValueInLocalStorage = jest.spyOn(
        LocalStorageUtils,
        'saveValueInLocalStorage',
      );
      LocalStorageUtils.getValueFromLocalStorage = jest
        .fn()
        .mockResolvedValue({ 'keychain.tests': 'user_ignored' });
      await GovernanceUtils.removeFromIgnoreRenewal(mk.user.one);
      expect(sSaveValueInLocalStorage).toHaveBeenCalledWith(
        LocalStorageKeyEnum.GOVERNANCE_RENEWAL_IGNORED,
        {},
      );
    });

    it('Must call saveValueInLocalStorage if nothing to remove', async () => {
      const sSaveValueInLocalStorage = jest.spyOn(
        LocalStorageUtils,
        'saveValueInLocalStorage',
      );
      LocalStorageUtils.getValueFromLocalStorage = jest
        .fn()
        .mockResolvedValue(undefined);
      await GovernanceUtils.removeFromIgnoreRenewal(mk.user.one);
      expect(sSaveValueInLocalStorage).toHaveBeenCalledWith(
        LocalStorageKeyEnum.GOVERNANCE_RENEWAL_IGNORED,
        {},
      );
    });
  });
});
