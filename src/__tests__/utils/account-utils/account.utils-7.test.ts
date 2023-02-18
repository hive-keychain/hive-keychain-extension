import AccountUtils from 'src/utils/account.utils';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import rcAccounts from 'src/__tests__/utils-for-testing/data/rc-accounts';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import config from 'src/__tests__/utils-for-testing/setups/config';
import accountUtilsMocks from 'src/__tests__/utils/mocks/account-utils-mocks';
config.byDefault();
describe('account.utils part 6 tests:\n', () => {
  const { methods } = accountUtilsMocks;
  methods.afterEach;
  describe('getRCMana cases:\n', () => {
    it('Must return rc account with percentage 100', async () => {
      HiveTxUtils.getData = jest.fn().mockResolvedValue(rcAccounts);
      const result = await AccountUtils.getRCMana(mk.user.one);
      expect(result.percentage).toBe(100);
    });

    it('Must return rc account with percentage 0', async () => {
      const clonedRcAccounts: any = objects.clone(rcAccounts);
      clonedRcAccounts.rc_accounts[0].rc_manabar.current_mana = 0;
      clonedRcAccounts.rc_accounts[0].max_rc = 0;
      HiveTxUtils.getData = jest.fn().mockResolvedValue(clonedRcAccounts);
      const result = await AccountUtils.getRCMana(mk.user.one);
      expect(result.percentage).toBe(0);
    });
  });
});
