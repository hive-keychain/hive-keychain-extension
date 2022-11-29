import BgdHiveUtils from '@background/utils/hive.utils';
import { ActiveAccount } from '@interfaces/active-account.interface';
import hiveUtilsMocks from 'src/__tests__/background/utils/mocks/hive.utils.mocks';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import manabar from 'src/__tests__/utils-for-testing/data/manabar';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
describe('hive.utils tests:\n', () => {
  const { mocks, method, spies } = hiveUtilsMocks;
  const { constants } = hiveUtilsMocks;
  const { client, tuple, noPendings } = constants;
  method.afterEach;
  describe('claimAccounts cases:\n', () => {
    describe('Error cases:\n', () => {
      beforeEach(() => {
        mocks.getClient(client);
        mocks.sendOperations;
      });

      it('Must return undefined if not enough RCs', async () => {
        const resultOperation = await BgdHiveUtils.claimAccounts(
          manabar,
          accounts.active,
        );
        expect(resultOperation).toBeUndefined();
        expect(spies.logger.info).toBeCalledWith(
          'Not enough RC% to claim account',
        );
      });

      it('Must return undefined if no active key', async () => {
        mocks.setConfigAsMin();
        const clonedActiveAccount = objects.clone(
          accounts.active,
        ) as ActiveAccount;
        delete clonedActiveAccount.keys.active;
        const resultOperation = await BgdHiveUtils.claimAccounts(
          manabar,
          clonedActiveAccount,
        );
        expect(resultOperation).toBeUndefined();
        const { calls } = spies.logger.error.mock;
        expect((calls[0][0] as TypeError).message).toContain('Expected String');
      });

      it('Must return undefined if wrong key', async () => {
        mocks.setConfigAsMin();
        const clonedActiveAccount = objects.clone(
          accounts.active,
        ) as ActiveAccount;
        clonedActiveAccount.keys.active = clonedActiveAccount.keys.activePubkey;
        const resultOperation = await BgdHiveUtils.claimAccounts(
          manabar,
          clonedActiveAccount,
        );
        expect(resultOperation).toBeUndefined();
        const { calls } = spies.logger.error.mock;
        expect((calls[0][0] as TypeError).message).toContain('private key');
      });
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
});
