import ClaimModule from '@background/claim.module';
import Config from 'src/config';
import claimModuleMocks from 'src/__tests__/background/mocks/claim.module.mocks';
describe('claim.module tests:\n', () => {
  const { mocks, methods, spies, constants } = claimModuleMocks;
  const { loggerMsg, autoLock } = constants;
  methods.afterEach;
  it('Must create alarm and call Logger', async () => {
    mocks.getMultipleValueFromLocalStorage({
      __MK: undefined,
      claimAccounts: undefined,
      claimRewards: undefined,
      claimSavings: undefined,
    });
    await ClaimModule.start();
    expect(spies.logger).toBeCalledWith(
      `Will autoclaim every ${Config.claims.FREQUENCY}mn`,
    );
    expect(spies.create).toBeCalledWith({
      periodInMinutes: Config.claims.FREQUENCY,
    });
  });
});
