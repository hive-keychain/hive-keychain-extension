import { ActionType } from '@popup/actions/action-type.enum';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as globalPropertiesActions from 'src/popup/actions/global-properties.actions';
import HiveUtils from 'src/utils/hive.utils';
import Logger from 'src/utils/logger.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
//configuring
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
//end configuring
describe('global-properties.actions tests:\n', () => {
  describe('loadGlobalProperties tests:\n', () => {
    const databaseCallArguments = ['get_reward_fund', ['post']];
    test('If a valid response is obtained, must return a LOAD_GLOBAL_PROPS action and the data as payload', async () => {
      const mockGetDynamicGlobalProperties =
        (HiveUtils.getClient().database.getDynamicGlobalProperties = jest
          .fn()
          .mockResolvedValueOnce(utilsT.dynamicPropertiesObj));
      const mockGetCurrentMedianHistoryPrice =
        (HiveUtils.getClient().database.getCurrentMedianHistoryPrice = jest
          .fn()
          .mockResolvedValueOnce(utilsT.fakeCurrentMedianHistoryPrice));
      const mockDatabaseCall = (HiveUtils.getClient().database.call = jest
        .fn()
        .mockResolvedValueOnce(utilsT.fakePostRewardFundResponse));
      const props = {
        globals: utilsT.dynamicPropertiesObj,
        price: utilsT.fakeCurrentMedianHistoryPrice,
        rewardFund: utilsT.fakePostRewardFundResponse,
      };
      const mockedStore = mockStore({});
      return await mockedStore
        .dispatch<any>(globalPropertiesActions.loadGlobalProperties())
        .then(() => {
          expect(mockedStore.getActions()).toEqual([
            {
              type: ActionType.LOAD_GLOBAL_PROPS,
              payload: props,
            },
          ]);
          expect(mockDatabaseCall).toBeCalledTimes(1);
          expect(mockGetDynamicGlobalProperties).toBeCalledTimes(1);
          expect(mockGetCurrentMedianHistoryPrice).toBeCalledTimes(1);
          expect(mockDatabaseCall).toBeCalledWith(...databaseCallArguments);
          mockGetCurrentMedianHistoryPrice.mockReset();
          mockGetCurrentMedianHistoryPrice.mockRestore();
          mockGetDynamicGlobalProperties.mockReset();
          mockGetDynamicGlobalProperties.mockRestore();
          mockDatabaseCall.mockReset();
          mockDatabaseCall.mockRestore();
        });
    });
    test('If an error occurs, must catch the error, call Logger and return no actions', async () => {
      const promiseError = new Error('Custom Message');
      const spyLoggerError = jest.spyOn(Logger, 'error');
      const mockGetDynamicGlobalProperties =
        (HiveUtils.getClient().database.getDynamicGlobalProperties = jest
          .fn()
          .mockRejectedValueOnce(promiseError));
      const mockGetCurrentMedianHistoryPrice =
        (HiveUtils.getClient().database.getCurrentMedianHistoryPrice = jest
          .fn()
          .mockResolvedValueOnce(utilsT.fakeCurrentMedianHistoryPrice));
      const mockDatabaseCall = (HiveUtils.getClient().database.call = jest
        .fn()
        .mockResolvedValueOnce(utilsT.fakePostRewardFundResponse));
      const mockedStore = mockStore({});
      return await mockedStore
        .dispatch<any>(globalPropertiesActions.loadGlobalProperties())
        .then(() => {
          expect(mockedStore.getActions()).toEqual([]);
          expect(spyLoggerError).toBeCalledTimes(1);
          expect(spyLoggerError).toBeCalledWith(promiseError);
          expect(mockDatabaseCall).toBeCalledTimes(1);
          expect(mockGetDynamicGlobalProperties).toBeCalledTimes(1);
          expect(mockGetCurrentMedianHistoryPrice).toBeCalledTimes(1);
          expect(mockDatabaseCall).toBeCalledWith(...databaseCallArguments);
          mockGetCurrentMedianHistoryPrice.mockReset();
          mockGetCurrentMedianHistoryPrice.mockRestore();
          mockGetDynamicGlobalProperties.mockReset();
          mockGetDynamicGlobalProperties.mockRestore();
          mockDatabaseCall.mockReset();
          mockDatabaseCall.mockRestore();
          spyLoggerError.mockReset();
          spyLoggerError.mockRestore();
        });
    });
  });
});
