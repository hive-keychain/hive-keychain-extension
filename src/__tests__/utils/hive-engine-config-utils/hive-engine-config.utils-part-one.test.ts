import { DefaultRpcs } from '@reference-data/default-rpc.list';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import axios, { AxiosInstance } from 'axios';
import { HiveEngineConfigUtils } from 'src/utils/hive-engine-config.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import hiveEngineConfigMocks from 'src/__tests__/utils/mocks/hive-engine-config.utils.mocks';
import SSC from 'sscjs';
describe('hive-engine-config.utils tests:\n', () => {
  const { mocks, methods, spies } = hiveEngineConfigMocks;
  methods.afterEach;
  it('Must get api', () => {
    expect(JSON.stringify(HiveEngineConfigUtils.getApi())).toEqual(
      JSON.stringify(new SSC()),
    );
  });
  it('Must set active api', () => {
    HiveEngineConfigUtils.setActiveApi('https://saturnoman.api');
    const newRpc = HiveEngineConfigUtils.getApi();
    expect(newRpc.axios.defaults.baseURL).toEqual('https://saturnoman.api');
  });
  it('Must get account history api', () => {
    const accountHistory: AxiosInstance =
      HiveEngineConfigUtils.getAccountHistoryApi();
    expect(JSON.stringify(accountHistory)).toEqual(JSON.stringify(axios));
    expect(accountHistory.defaults.baseURL).toBe(
      'https://history.hive-engine.com/',
    );
  });
  it('Must set active account history', () => {
    HiveEngineConfigUtils.setActiveAccountHistoryApi('https://saturnoman.api');
    const activeAccountHistory = HiveEngineConfigUtils.getAccountHistoryApi();
    expect(activeAccountHistory.defaults.baseURL).toBe(
      'https://saturnoman.api',
    );
  });
  it('Must add custom Rpc', async () => {
    const rpcList = DefaultRpcs.map((rpc) => rpc.uri);
    mocks.getValueFromLocalStorage({
      customRpcList: DefaultRpcs.map((rpc) => rpc.uri),
    });
    await HiveEngineConfigUtils.addCustomRpc('https://saturnoman.api');
    expect(spies.saveValueInLocalStorage).toBeCalledWith(
      LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_RPC_LIST,
      [...rpcList, 'https://saturnoman.api'],
    );
  });
  it('Must delete custom Rpc', async () => {
    const rpcList = DefaultRpcs.map((rpc) => rpc.uri);
    rpcList.push('https://saturnoman.api');
    mocks.getValueFromLocalStorage({
      customRpcList: rpcList,
    });
    await HiveEngineConfigUtils.deleteCustomRpc('https://saturnoman.api');
    expect(spies.saveValueInLocalStorage).toBeCalledWith(
      LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_RPC_LIST,
      rpcList.filter((rpc) => rpc !== 'https://saturnoman.api'),
    );
  });
  it('Must get [] calling getCustomRpcs', async () => {
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(undefined);
    expect(await HiveEngineConfigUtils.getCustomRpcs()).toEqual([]);
  });
  it('Must get list calling getCustomRpcs', async () => {
    const rpcList = DefaultRpcs.map((rpc) => rpc.uri);
    mocks.getValueFromLocalStorage({
      customRpcList: rpcList,
    });
    expect(await HiveEngineConfigUtils.getCustomRpcs()).toEqual(rpcList);
  });
});
