import { DynamicGlobalPropertiesUtils } from '@hiveapp/utils/dynamic-global-properties.utils';
import HiveUtils from '@hiveapp/utils/hive.utils';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import * as globalPropertiesActions from 'src/popup/hive/actions/global-properties.actions';
import Logger from 'src/utils/logger.utils';

describe('global-properties.actions tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('loadGlobalProperties tests:\n', () => {
    test('Must load global props', async () => {
      DynamicGlobalPropertiesUtils.getDynamicGlobalProperties = jest
        .fn()
        .mockResolvedValue(dynamic.globalProperties);

      HiveUtils.getCurrentMedianHistoryPrice = jest
        .fn()
        .mockResolvedValue(dynamic.medianHistoryPrice);
      HiveUtils.getRewardFund = jest.fn().mockResolvedValue(dynamic.rewardFund);

      const fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(
        globalPropertiesActions.loadGlobalProperties(),
      );
      expect(fakeStore.getState().globalProperties).toEqual({
        globals: dynamic.globalProperties,
        price: dynamic.medianHistoryPrice,
        rewardFund: dynamic.rewardFund,
      });
    });

    test('Must catch the error, call Logger.error', async () => {
      const promiseError = new Error('Custom Message');
      const spyLoggerError = jest.spyOn(Logger, 'error');
      DynamicGlobalPropertiesUtils.getDynamicGlobalProperties = jest
        .fn()
        .mockImplementation(() => Promise.reject(promiseError));
      const fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(
        globalPropertiesActions.loadGlobalProperties(),
      );
      expect(fakeStore.getState().globalProperties).toEqual({});
      expect(spyLoggerError).toBeCalledWith(promiseError);
      spyLoggerError.mockClear();
      spyLoggerError.mockReset();
    });
  });
});
