import ClaimModule from '@background/claim.module';
import Config from 'src/config';
import claimModuleMocks from 'src/__tests__/background/mocks/claim.module.mocks';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
describe('claim.module tests:\n', () => {
  const { mocks, methods, spies, constants } = claimModuleMocks;
  const { validClaims, nonValidClaims, error, differentAccount } = constants;
  const { availableSavings, noAvailableSavings } = constants;
  methods.afterEach;
  methods.afterAll;
  it('Must create alarm and call Logger', async () => {
    mocks.getMultipleValueFromLocalStorage({
      __MK: undefined,
      claimAccounts: undefined,
      claimRewards: undefined,
      claimSavings: undefined,
    });
    await ClaimModule.start();
    expect(spies.logger.info).toBeCalledWith(
      `Will autoclaim every ${Config.claims.FREQUENCY}mn`,
    );
    expect(spies.create).toBeCalledWith({
      periodInMinutes: Config.claims.FREQUENCY,
    });
  });
  it('Must call Logger with on each case', async () => {
    for (let i = 0; i < nonValidClaims.length; i++) {
      mocks.getMultipleValueFromLocalStorage(nonValidClaims[i]);
      await ClaimModule.start();
      expect(spies.logger.error).toBeCalledTimes(nonValidClaims.length);
      expect(spies.logger.error.mock.calls).toEqual(error);
      spies.logger.error.mockReset();
    }
  });
  it('Must call logger with nothing to claim', async () => {
    mocks.getMultipleValueFromLocalStorage(validClaims({ savings: true }));
    mocks.getAccounts(noAvailableSavings);
    mocks.getAccountsFromLocalStorage([accounts.local.justTwoKeys]);
    mocks.rcAcc([]);
    mocks.calculateRCMana(accounts.active.rc);
    await ClaimModule.start();
    expect(spies.logger.info.mock.calls[1][0]).toBe(
      `@${accounts.active.name} doesn't have any savings interests to claim`,
    );
    expect(spies.claimSavings(undefined)).not.toBeCalled();
  });
  it('Must call logger with no time to claim', async () => {
    mocks.getMultipleValueFromLocalStorage(validClaims({ savings: true }));
    mocks.getAccounts(availableSavings);
    mocks.getAccountsFromLocalStorage([accounts.local.justTwoKeys]);
    mocks.rcAcc([]);
    mocks.calculateRCMana(accounts.active.rc);
    mocks.setMaxDelay(1000000000);
    await ClaimModule.start();
    expect(spies.logger.info.mock.calls[1][0]).toBe(
      `Not time to claim yet for @${accounts.active.name}`,
    );
    expect(spies.claimSavings(undefined)).not.toBeCalled();
  });
  describe('Same local accounts:\n', () => {
    beforeEach(() => {
      mocks.getAccounts([accounts.extended]);
      mocks.getAccountsFromLocalStorage([accounts.local.justTwoKeys]);
      mocks.rcAcc([]);
      mocks.calculateRCMana(accounts.active.rc);
    });
    it('Must claim accounts', async () => {
      mocks.getMultipleValueFromLocalStorage(validClaims({ accounts: true }));
      mocks.resetMin_RC;
      await ClaimModule.start();
      expect(spies.claimAccounts).toBeCalledWith(
        accounts.active.rc,
        accounts.active,
      );
    });
    it('Must claim rewards', async () => {
      mocks.getMultipleValueFromLocalStorage(validClaims({ rewards: true }));
      await ClaimModule.start();
      expect(spies.logger.info).toBeCalledWith(
        `Claiming rewards for @${accounts.extended.name}`,
      );
      expect(spies.claimRewards).toBeCalledWith(
        accounts.active,
        accounts.extended.reward_hive_balance,
        accounts.extended.reward_hbd_balance,
        accounts.extended.reward_vesting_balance,
      );
    });
    it('Must claim savings', async () => {
      mocks.getMultipleValueFromLocalStorage(validClaims({ savings: true }));
      mocks.getAccounts(availableSavings);
      mocks.setMaxDelay(0);
      spies.claimSavings(true);
      await ClaimModule.start();
      expect(spies.logger.info.mock.calls[1][0]).toBe(
        `Claim savings for @${accounts.active.name} successful`,
      );
    });
  });
  describe('Different local accounts:\n', () => {
    beforeEach(() => {
      mocks.getAccounts([accounts.extended]);
      mocks.getAccountsFromLocalStorage(differentAccount);
    });
    it('Must not claim accounts', async () => {
      mocks.getMultipleValueFromLocalStorage(validClaims({ accounts: true }));
      await ClaimModule.start();
      expect(spies.claimAccounts).not.toBeCalled();
    });
    it('Must not claim rewards', async () => {
      mocks.getMultipleValueFromLocalStorage(validClaims({ rewards: true }));
      await ClaimModule.start();
      expect(spies.claimRewards).not.toBeCalled();
    });
    it('Must not claim savings', async () => {
      mocks.getMultipleValueFromLocalStorage(validClaims({ savings: true }));
      await ClaimModule.start();
      expect(spies.claimSavings(undefined)).not.toBeCalled();
    });
  });
});
