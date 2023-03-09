import { ActiveAccount } from '@interfaces/active-account.interface';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import Logger from 'src/utils/logger.utils';
import { SavingsUtils } from 'src/utils/savings.utils';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import config from 'src/__tests__/utils-for-testing/setups/config';

describe('savings.utils.ts tests:\n', () => {
  config.byDefault();
  describe('getRequestId cases:\n', () => {
    it('Must return next id to use', async () => {
      HiveTxUtils.getData = jest.fn().mockResolvedValue([
        {
          request_id: 10,
        },
        {
          request_id: 100,
        },
      ]);
      expect(await SavingsUtils.getRequestId(mk.user.one)).toBe(101);
    });
  });

  describe('claimSavings cases:\n', () => {
    it('Must return false, call logger with no deposits/savings', async () => {
      const sLogger = jest.spyOn(Logger, 'error');
      const clonedActiveAccount = objects.clone(
        accounts.active,
      ) as ActiveAccount;
      clonedActiveAccount.account.hbd_balance = '0.000 HBD';
      clonedActiveAccount.account.savings_hbd_balance = '0.000 HBD';
      expect(await SavingsUtils.claimSavings(clonedActiveAccount)).toBe(false);
      expect(sLogger).toBeCalledWith(
        `@${clonedActiveAccount.name} has no HBD to deposit or savings to withdraw`,
      );
      sLogger.mockClear();
    });

    it('Must return true while claiming deposit', async () => {
      const clonedActiveAccount = objects.clone(
        accounts.active,
      ) as ActiveAccount;
      clonedActiveAccount.account.hbd_balance = '10.000 HBD';
      clonedActiveAccount.account.savings_hbd_balance = '0.000 HBD';
      SavingsUtils.deposit = jest.fn().mockResolvedValue(true);
      expect(await SavingsUtils.claimSavings(clonedActiveAccount)).toBe(true);
    });

    it('Must return true while claiming withdraw', async () => {
      const clonedActiveAccount = objects.clone(
        accounts.active,
      ) as ActiveAccount;
      clonedActiveAccount.account.hbd_balance = '0.000 HBD';
      clonedActiveAccount.account.savings_hbd_balance = '10.000 HBD';
      SavingsUtils.withdraw = jest.fn().mockResolvedValue(true);
      expect(await SavingsUtils.claimSavings(clonedActiveAccount)).toBe(true);
    });
  });
});
