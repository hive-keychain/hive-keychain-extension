import RPCModule from '@background/rpc.module';
import BgdHiveUtils from '@background/utils/hive.utils';
import { ActiveAccount } from '@interfaces/active-account.interface';
import hiveUtilsMocks from 'src/__tests__/background/utils/mocks/hive.utils.mocks';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import confirmations from 'src/__tests__/utils-for-testing/data/confirmations';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
describe('hive.utils tests:\n', () => {
  const { mocks, method, spies } = hiveUtilsMocks;
  const { constants } = hiveUtilsMocks;
  const { client, tuple, noPendings } = constants;
  method.afterEach;
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
      it('Must call logger with nothing to claim', async () => {
        const noBalances = method.resetBothBalances(accounts.active);
        await BgdHiveUtils.claimSavings(noBalances);
        expect(spies.logger.error).toBeCalledWith(noPendings);
      });
      describe('Error cases:\n', () => {
        beforeEach(() => {
          mocks.getClient(client);
          mocks.sendOperations;
        });

        it('Must return false if no active key', async () => {
          const activeAccountHasHbd = method.reset(
            'savings_hbd_balance',
            accounts.active,
          );
          const cloneActiveAccount = objects.clone(
            activeAccountHasHbd,
          ) as ActiveAccount;
          delete cloneActiveAccount.keys.active;
          const resultOperation = await BgdHiveUtils.claimSavings(
            cloneActiveAccount,
          );
          expect(resultOperation).toBe(false);
          const { calls } = spies.logger.error.mock;
          expect(calls[0][0]).toBe(
            `Error while claiming savings for @${cloneActiveAccount.name}`,
          );
          expect((calls[0][1] as TypeError).message).toContain(
            'Expected String',
          );
        });

        it('Must return false if wrong key', async () => {
          const activeAccountHasHbd = method.reset(
            'savings_hbd_balance',
            accounts.active,
          );
          const cloneActiveAccount = objects.clone(
            activeAccountHasHbd,
          ) as ActiveAccount;
          delete cloneActiveAccount.keys.active;
          cloneActiveAccount.keys.active = cloneActiveAccount.keys.activePubkey;
          const resultOperation = await BgdHiveUtils.claimSavings(
            cloneActiveAccount,
          );
          expect(resultOperation).toBe(false);
          const { calls } = spies.logger.error.mock;
          expect(calls[0][0]).toBe(
            `Error while claiming savings for @${cloneActiveAccount.name}`,
          );
          expect((calls[0][1] as TypeError).message).toContain('private key');
        });
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

      describe('Error cases:\n', () => {
        beforeEach(() => {
          RPCModule.getClient = jest.fn().mockResolvedValue(client);
          client.broadcast.sendOperations = jest
            .fn()
            .mockResolvedValue(confirmations.trx);
        });

        it('Must return false if no active key', async () => {
          const cloneActiveAccount = objects.clone(
            accounts.active,
          ) as ActiveAccount;
          delete cloneActiveAccount.keys.active;
          const resultOperation = await BgdHiveUtils.claimSavings(
            cloneActiveAccount,
          );
          expect(resultOperation).toBe(false);
          const { calls } = spies.logger.error.mock;
          expect(calls[0][0]).toBe(
            `Error while claiming savings for @${cloneActiveAccount.name}`,
          );
          expect((calls[0][1] as TypeError).message).toContain(
            'Expected String',
          );
        });

        it('Must return false if wrong key', async () => {
          const cloneActiveAccount = objects.clone(
            accounts.active,
          ) as ActiveAccount;
          cloneActiveAccount.keys.active = cloneActiveAccount.keys.activePubkey;
          const resultOperation = await BgdHiveUtils.claimSavings(
            cloneActiveAccount,
          );
          expect(resultOperation).toBe(false);
          const { calls } = spies.logger.error.mock;
          expect(calls[0][0]).toBe(
            `Error while claiming savings for @${cloneActiveAccount.name}`,
          );
          expect((calls[0][1] as TypeError).message).toContain('private key');
        });
      });
    });
  });
});
