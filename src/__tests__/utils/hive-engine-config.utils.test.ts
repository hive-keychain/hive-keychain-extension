import { HiveEngineConfigUtils } from 'src/utils/hive-engine-config.utils';

describe('hive-engine-config.utils.ts tests:/n', () => {
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
});
