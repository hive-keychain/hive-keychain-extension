import { BgdHiveEngineConfigModule } from '@background/hive-engine-config.module';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('hive-engine-config.module tests:\n', () => {
  const config = {
    mainnet: 'ssc-mainnet-hive',
    accountHistoryApi: 'https://history.hive-engine.com/',
    rpc: 'https://api.hive-engine.com/rpc',
  };
  beforeEach(() => {
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  it('Must get active configuration', async () => {
    const sDetValueFromLocalStorage = jest.spyOn(
      LocalStorageUtils,
      'getValueFromLocalStorage',
    );
    expect(await BgdHiveEngineConfigModule.getActiveConfig()).toEqual(config);
    expect(sDetValueFromLocalStorage).toBeCalledWith(
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
