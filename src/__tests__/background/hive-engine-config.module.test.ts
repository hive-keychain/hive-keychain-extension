import { BgdHiveEngineConfigModule } from '@background/hive-engine-config.module';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import hiveEngineConfigModuleMocks from 'src/__tests__/background/mocks/hive-engine-config.module.mocks';
describe('hive-engine-config.module tests:\n', () => {
  const { methods, constants, spies } = hiveEngineConfigModuleMocks;
  const { config } = constants;
  methods.afterEach;
  methods.beforeEach;
  it('Must get active configuration', async () => {
    expect(await BgdHiveEngineConfigModule.getActiveConfig()).toEqual(config);
    expect(spies.getValueFromLocalStorage).toBeCalledWith(
      LocalStorageKeyEnum.HIVE_ENGINE_ACTIVE_CONFIG,
    );
  });
  it('Must get active rpc', async () => {
    expect(await BgdHiveEngineConfigModule.getActiveRpc()).toBe(config.rpc);
  });
  it('Must get active account history api', async () => {
    expect(await BgdHiveEngineConfigModule.getActiveAccountHistoryApi()).toBe(
      config.accountHistoryApi,
    );
  });
  it('Must get active mainnet', async () => {
    expect(await BgdHiveEngineConfigModule.getActiveMainnet()).toBe(
      config.mainnet,
    );
  });
});
