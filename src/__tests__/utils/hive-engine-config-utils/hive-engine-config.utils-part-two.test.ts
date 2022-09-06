import {
  DefaultAccountHistoryApis,
  DefaultHiveEngineRpcs,
  HiveEngineConfig,
} from '@interfaces/hive-engine-rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { HiveEngineConfigUtils } from 'src/utils/hive-engine-config.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import hiveEngineConfigMocks from 'src/__tests__/utils/mocks/hive-engine-config.utils.mocks';
describe('hive-engine-config.utils tests:\n', () => {
  const { mocks, methods, spies } = hiveEngineConfigMocks;
  methods.afterEach;
  it('Must get [] calling getCustomAccountHistoryApi', async () => {
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(undefined);
    expect(await HiveEngineConfigUtils.getCustomAccountHistoryApi()).toEqual(
      [],
    );
  });
  it('Must get list calling getCustomAccountHistoryApi', async () => {
    mocks.getValueFromLocalStorage({
      accountHistoryApi: DefaultAccountHistoryApis,
    });
    expect(await HiveEngineConfigUtils.getCustomAccountHistoryApi()).toEqual(
      DefaultAccountHistoryApis,
    );
  });
  it('Must add custom account history api', async () => {
    const cloneAccountHistoryApis = objects.clone(
      DefaultAccountHistoryApis,
    ) as string[];
    mocks.getValueFromLocalStorage({
      accountHistoryApi: DefaultAccountHistoryApis,
    });
    await HiveEngineConfigUtils.addCustomAccountHistoryApi(
      'https://saturnoman.api',
    );
    expect(spies.saveValueInLocalStorage).toBeCalledWith(
      LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_ACCOUNT_HISTORY_API,
      [...cloneAccountHistoryApis, 'https://saturnoman.api'],
    );
  });
  it('Must delete account history api', async () => {
    const cloneAccountHistoryApis = objects.clone(
      DefaultAccountHistoryApis,
    ) as string[];
    cloneAccountHistoryApis.push('https://saturnoman.api');
    mocks.getValueFromLocalStorage({
      accountHistoryApi: cloneAccountHistoryApis,
    });
    await HiveEngineConfigUtils.deleteCustomAccountHistoryApi(
      'https://saturnoman.api',
    );
    expect(spies.saveValueInLocalStorage).toBeCalledWith(
      LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_ACCOUNT_HISTORY_API,
      cloneAccountHistoryApis.filter((api) => api !== 'https://saturnoman.api'),
    );
  });
  it('Must return true as is default rpc', () => {
    expect(HiveEngineConfigUtils.isRpcDefault(DefaultHiveEngineRpcs[0])).toBe(
      true,
    );
  });
  it('Must return false as is not default rpc', () => {
    expect(HiveEngineConfigUtils.isRpcDefault('https://saturnoman.api')).toBe(
      false,
    );
  });
  it('Must return true as is default account history api', () => {
    expect(
      HiveEngineConfigUtils.isAccountHistoryApiDefault(
        DefaultAccountHistoryApis[0],
      ),
    ).toBe(true);
  });
  it('Must return false as is not default account history api', () => {
    expect(
      HiveEngineConfigUtils.isAccountHistoryApiDefault(
        'https://saturnoman.history.api',
      ),
    ).toBe(false);
  });
  it('Must save config in storage', async () => {
    const config: HiveEngineConfig = {
      rpc: DefaultHiveEngineRpcs[0],
      mainnet: 'SSC-mainnet',
      accountHistoryApi: DefaultAccountHistoryApis[0],
    };
    await HiveEngineConfigUtils.saveConfigInStorage(config);
    expect(spies.saveValueInLocalStorage).toBeCalledWith(
      LocalStorageKeyEnum.HIVE_ENGINE_ACTIVE_CONFIG,
      config,
    );
  });
});
