import BgdHiveUtils from '@background/utils/hive.utils';
import hiveUtilsMocks from 'src/__tests__/background/utils/mocks/hive.utils.mocks';
import { errorClaimAccounts } from 'src/__tests__/background/utils/mocks/hive.utils.references/errors/claim-accounts-errors';
import { errorClaimRewards } from 'src/__tests__/background/utils/mocks/hive.utils.references/errors/claim-rewards-errors';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import confirmations from 'src/__tests__/utils-for-testing/data/confirmations';
import mk from 'src/__tests__/utils-for-testing/data/mk';
describe('hive.utils tests:\n', () => {
  const { mocks, method, spies } = hiveUtilsMocks;
  const { constants } = hiveUtilsMocks;
  const { client, tuple, noPendings } = constants;
  method.afterEach;
  describe('claimRewards cases:\n', () => {
    it('Must return false on each error', async () => {
      for (let i = 0; i < errorClaimRewards.length; i++) {
        const element = errorClaimRewards[i];
        element.mocks();
        expect(await BgdHiveUtils.claimRewards(...element.params)).toBe(false);
      }
    });
    it('Must return true', async () => {
      mocks.getClient(client);
      mocks.sendOperations(confirmations.trx);
      expect(await BgdHiveUtils.claimRewards(...tuple.assets._string)).toBe(
        true,
      );
    });
  });
  describe('claimAccounts cases:\n', () => {
    it('Must call logger on each error', async () => {
      for (let i = 0; i < errorClaimAccounts.length; i++) {
        const element = errorClaimAccounts[i];
        element.mocks();
        await BgdHiveUtils.claimAccounts(...element.params);
        expect(element.spies.using).toBeCalledWith(element.description);
        element.spies.using.mockReset();
      }
    });
    it('Must call logger with success', async () => {
      mocks.getClient(client);
      mocks.setConfigAsMin();
      mocks.sendOperations;
      await BgdHiveUtils.claimAccounts(...tuple.claimAccounts);
      expect(spies.logger.info).toBeCalledWith(
        `Claiming free account for @${mk.user.one}`,
      );
    });
  });
  describe('claimSavings cases:\n', () => {
    describe('hbd_balance cases:\n', () => {
      it('Must return true passing string', async () => {
        mocks.getClient(client);
        mocks.sendOperations;
        const activeAccountHasHbd = method.reset(
          'savings_hbd_balance',
          accounts.active,
        );
        expect(await BgdHiveUtils.claimSavings(activeAccountHasHbd)).toBe(true);
      });
      it('Must return true if passing Asset', async () => {
        mocks.getClient(client);
        mocks.sendOperations;
        const activeAccountHasHbd = method.reset(
          'savings_hbd_balance',
          accounts.active,
          true,
        );
        expect(await BgdHiveUtils.claimSavings(activeAccountHasHbd)).toBe(true);
      });
      it('Must return false on each error', async () => {
        await method.assertErrors('savings_hbd_balance');
      });
      it('Must call logger with nothing to withdraw', async () => {
        const noBalances = method.resetBothBalances(accounts.active);
        await BgdHiveUtils.claimSavings(noBalances);
        expect(spies.logger.error).toBeCalledWith(noPendings);
      });
    });
    describe('savings_hbd_balance cases:\n', () => {
      it('Must return true', async () => {
        mocks.getClient(client);
        mocks.sendOperations;
        const activeAccountHasHbd = method.reset(
          'hbd_balance',
          accounts.active,
        );
        expect(await BgdHiveUtils.claimSavings(activeAccountHasHbd)).toBe(true);
      });
      it('Must return true if passing Asset', async () => {
        mocks.getClient(client);
        mocks.sendOperations;
        const activeAccountHasHbd = method.reset(
          'hbd_balance',
          accounts.active,
          true,
        );
        expect(await BgdHiveUtils.claimSavings(activeAccountHasHbd)).toBe(true);
      });
      it('Must return false on each error', async () => {
        await method.assertErrors('hbd_balance');
      });
    });
  });
});
