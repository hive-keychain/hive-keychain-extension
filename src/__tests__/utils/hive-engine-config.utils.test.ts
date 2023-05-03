import {
  DefaultAccountHistoryApis,
  DefaultHiveEngineRpcs,
  HiveEngineConfig,
} from '@interfaces/hive-engine-rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { HiveEngineConfigUtils } from 'src/utils/hive-engine-config.utils';
import hiveEngineConfigUtilsMocks from 'src/__tests__/utils/mocks/hive-engine-config.utils-mocks';

describe('hive-engine-config.utils.ts tests:/n', () => {
  const { spies, mocks, methods } = hiveEngineConfigUtilsMocks;
  methods.afterAll;
  describe('getApi cases:\n', () => {
    it('Must get Rpc address', () => {
      expect(HiveEngineConfigUtils.getApi()).toBe(
        'https://api.hive-engine.com/rpc',
      );
    });
  });

  describe('setActiveApi cases:/n', () => {
    it('Must set custom rpc', () => {
      HiveEngineConfigUtils.setActiveApi('https://saturnoman.com/hiveapi');
      expect(HiveEngineConfigUtils.getApi()).toBe(
        'https://saturnoman.com/hiveapi',
      );
    });
  });

  describe('getAccountHistoryApi cases:/n', () => {
    it('Must get account history api', () => {
      expect(HiveEngineConfigUtils.getAccountHistoryApi()).toBe(
        'https://history.hive-engine.com',
      );
    });
  });

  describe('setActiveAccountHistoryApi cases:/n', () => {
    it('Must set custom history api', () => {
      HiveEngineConfigUtils.setActiveAccountHistoryApi(
        'https://saturnoman.com/hiveHistoryApi',
      );
      expect(HiveEngineConfigUtils.getAccountHistoryApi()).toBe(
        'https://saturnoman.com/hiveHistoryApi',
      );
    });
  });

  describe('addCustomRpc cases: \n', () => {
    it('Must add custom rpc to list', async () => {
      const customRpcApi = 'https://saturnoman.com/api';
      mocks.getValueFromLocalStorage([]);
      await HiveEngineConfigUtils.addCustomRpc(customRpcApi);
      expect(spies.saveValueInLocalStorage).toBeCalledWith(
        LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_RPC_LIST,
        [customRpcApi],
      );
    });
  });

  describe('deleteCustomRpc cases:\n', () => {
    it('Must delete rpc', async () => {
      mocks.getValueFromLocalStorage(['found']);
      expect(await HiveEngineConfigUtils.deleteCustomRpc('found')).toEqual([]);
      expect(spies.saveValueInLocalStorage).toBeCalledWith(
        LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_RPC_LIST,
        [],
      );
    });
  });

  describe('getCustomRpcs cases:\n', () => {
    it('Must return list', async () => {
      mocks.getValueFromLocalStorage(['rpc1', 'rpc2']);
      expect(await HiveEngineConfigUtils.getCustomRpcs()).toEqual([
        'rpc1',
        'rpc2',
      ]);
    });

    it('Must return empty list', async () => {
      mocks.getValueFromLocalStorage(undefined);
      expect(await HiveEngineConfigUtils.getCustomRpcs()).toEqual([]);
    });
  });

  describe('getCustomAccountHistoryApi cases:\n', () => {
    it('Must return history api list', async () => {
      mocks.getValueFromLocalStorage(['historyapi1', 'historyapi2']);
      expect(await HiveEngineConfigUtils.getCustomAccountHistoryApi()).toEqual([
        'historyapi1',
        'historyapi2',
      ]);
    });

    it('Must return empty api list', async () => {
      mocks.getValueFromLocalStorage(undefined);
      expect(await HiveEngineConfigUtils.getCustomAccountHistoryApi()).toEqual(
        [],
      );
    });
  });

  describe('addCustomAccountHistoryApi cases: \n', () => {
    it('Must add custom history rpc to list', async () => {
      const customRpcApi = 'https://saturnoman.com/historyapi';
      mocks.getValueFromLocalStorage([]);
      await HiveEngineConfigUtils.addCustomAccountHistoryApi(customRpcApi);
      expect(spies.saveValueInLocalStorage).toBeCalledWith(
        LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_ACCOUNT_HISTORY_API,
        [customRpcApi],
      );
    });
  });

  describe('deleteCustomAccountHistoryApi cases:\n', () => {
    it('Must delete custom history rpc', async () => {
      mocks.getValueFromLocalStorage(['foundhistory', 'to_delete']);
      expect(
        await HiveEngineConfigUtils.deleteCustomAccountHistoryApi('to_delete'),
      ).toEqual(['foundhistory']);
      expect(spies.saveValueInLocalStorage).toBeCalledWith(
        LocalStorageKeyEnum.HIVE_ENGINE_CUSTOM_ACCOUNT_HISTORY_API,
        ['foundhistory'],
      );
    });
  });

  describe('isRpcDefault cases:\n', () => {
    it('Must return false', () => {
      expect(HiveEngineConfigUtils.isRpcDefault('default_rpc')).toBe(false);
    });

    it('Must return true', () => {
      expect(HiveEngineConfigUtils.isRpcDefault(DefaultHiveEngineRpcs[0])).toBe(
        true,
      );
    });
  });

  describe('isAccountHistoryApiDefault cases:\n', () => {
    it('Must return false', () => {
      expect(
        HiveEngineConfigUtils.isAccountHistoryApiDefault('default_rpc'),
      ).toBe(false);
    });

    it('Must return true', () => {
      expect(
        HiveEngineConfigUtils.isAccountHistoryApiDefault(
          DefaultAccountHistoryApis[0],
        ),
      ).toBe(true);
    });
  });

  describe('saveConfigInStorage cases:\n', () => {
    it('Must save config in storage', async () => {
      const configHE = {
        rpc: 'rpc1',
        mainnet: 'mainnet',
        accountHistoryApi: 'history',
      } as HiveEngineConfig;
      await HiveEngineConfigUtils.saveConfigInStorage(configHE);
      expect(spies.saveValueInLocalStorage).toBeCalledWith(
        LocalStorageKeyEnum.HIVE_ENGINE_ACTIVE_CONFIG,
        configHE,
      );
    });
  });
});
