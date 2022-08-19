import BgdHiveUtils from '@background/utils/hive.utils';
import hiveUtilsMocks from 'src/__tests__/background/utils/mocks/hive.utils.mocks';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import confirmations from 'src/__tests__/utils-for-testing/data/confirmations';
import manabar from 'src/__tests__/utils-for-testing/data/manabar';
import mk from 'src/__tests__/utils-for-testing/data/mk';
describe('hive.utils tests:\n', () => {
  const { errorClaimRewards, mocks, method, spies } = hiveUtilsMocks;
  const { constants, errorClaimAccounts } = hiveUtilsMocks;
  const { client } = constants;
  method.afterEach;
  describe('claimRewards cases:\n', () => {
    it('Must return false on each error', async () => {
      for (let i = 0; i < errorClaimRewards.length; i++) {
        const element = errorClaimRewards[i];
        const { activeAccount, rewardHive, rewardHBD, rewardVests } =
          element.params;
        element.mocks();
        expect(
          await BgdHiveUtils.claimRewards(
            activeAccount,
            rewardHive,
            rewardHBD,
            rewardVests,
          ),
        ).toBe(false);
      }
    });
    it('Must return true', async () => {
      mocks.getClient(client);
      mocks.sendOperations(confirmations.trx);
      expect(
        await BgdHiveUtils.claimRewards(
          accounts.active,
          '1000',
          '1000',
          '10000000',
        ),
      ).toBe(true);
    });
  });
  describe('claimAccounts cases:\n', () => {
    it('Must call logger on each error', async () => {
      for (let i = 0; i < errorClaimAccounts.length; i++) {
        const element = errorClaimAccounts[i];
        const { rc, activeAccount } = element.params;
        element.mocks();
        await BgdHiveUtils.claimAccounts(rc, activeAccount);
        expect(element.spies.using).toBeCalledWith(element.description);
        element.spies.using.mockReset();
      }
    });
    it('Must call logger with success', async () => {
      mocks.getClient(client);
      mocks.setConfigAsMin();
      mocks.sendOperations;
      await BgdHiveUtils.claimAccounts(manabar, accounts.active);
      expect(spies.logger.info).toBeCalledWith(
        `Claiming free account for @${mk.user.one}`,
      );
    });
  });
  describe('claimRewards cases:\n', () => {
    describe('hbd_balance cases:\n', () => {
      it('Must return true passing string', async () => {
        mocks.getClient(client);
        mocks.sendOperations;
        const activeAccountHasHbd = method.reset('savings_hbd_balance');
        expect(await BgdHiveUtils.claimSavings(activeAccountHasHbd)).toBe(true);
      });
      it('Must return true if passing Asset', async () => {
        mocks.getClient(client);
        mocks.sendOperations;
        const activeAccountHasHbd = method.reset('savings_hbd_balance', true);
        expect(await BgdHiveUtils.claimSavings(activeAccountHasHbd)).toBe(true);
      });
    });
    describe('savings_hbd_balance cases:\n', () => {
      it('Must return true', async () => {
        mocks.getClient(client);
        mocks.sendOperations;
        const activeAccountHasHbd = method.reset('hbd_balance');
        expect(await BgdHiveUtils.claimSavings(activeAccountHasHbd)).toBe(true);
      });
      it('Must return true if passing Asset', async () => {
        mocks.getClient(client);
        mocks.sendOperations;
        const activeAccountHasHbd = method.reset('hbd_balance', true);
        expect(await BgdHiveUtils.claimSavings(activeAccountHasHbd)).toBe(true);
      });
    });
  });
});
