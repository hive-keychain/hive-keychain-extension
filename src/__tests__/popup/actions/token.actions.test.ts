import { historyHiveEngineAPI, hsc } from '@api/hiveEngine';
import { TokenBalance } from '@interfaces/tokens.interface';
import { AxiosResponse } from 'axios';
import * as tokenActions from 'src/popup/actions/token.actions';
import HiveEngineUtils from 'src/utils/hive-engine.utils';
import Logger from 'src/utils/logger.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import {
  initialEmptyStateStore,
  initialStateJustTokens,
} from 'src/__tests__/utils-for-testing/initial-states';

afterEach(() => {
  jest.clearAllMocks();
});
describe('token.actions tests:\n', () => {
  const tokenObjZeroBalance = {
    _id: 119999,
    account: utilsT.userData.username,
    symbol: 'FAKETOKEN',
    balance: '0',
    stake: '1138.87982783',
    pendingUnstake: '0',
    delegationsIn: '0',
    delegationsOut: '0',
    pendingUndelegations: '0',
  };
  describe('loadTokens tests:\n', () => {
    test('Must load tokens', async () => {
      hsc.find = jest.fn().mockResolvedValueOnce(utilsT.fakeTokensResponse);
      const fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(tokenActions.loadTokens());
      expect(fakeStore.getState().tokens).toEqual(utilsT.expectedTokensPayload);
    });
    test('If error on response, will throw an unhandled error', async () => {
      hsc.find = jest
        .fn()
        .mockResolvedValueOnce(utilsT.fakeTokensResponseNoMetadata);
      const newError = new SyntaxError(
        'Unexpected token u in JSON at position 0',
      );
      const fakeStore = getFakeStore(initialEmptyStateStore);
      try {
        await fakeStore.dispatch<any>(tokenActions.loadTokens());
        expect(fakeStore.getState().tokens).toEqual(null);
      } catch (error) {
        expect(error).toEqual(newError);
      }
    });
  });

  describe('loadTokensMarket tests:\n', () => {
    test('Must load tokens market', async () => {
      hsc.find = jest
        .fn()
        .mockResolvedValueOnce(utilsT.fakeMarketMetricsResponse);
      const fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(tokenActions.loadTokensMarket());
      expect(fakeStore.getState().tokenMarket).toEqual(
        utilsT.fakeMarketMetricsResponse,
      );
    });
  });
  describe('loadUserTokens tests:\n', () => {
    test('Must clear current userTokens and load user tokens', async () => {
      const newUserTokenBalances = [
        utilsT.fakeGetUserBalanceResponse[1],
        utilsT.fakeGetUserBalanceResponse[2],
      ] as TokenBalance[];
      HiveEngineUtils.getUserBalance = jest
        .fn()
        .mockResolvedValueOnce(newUserTokenBalances);
      const fakeStore = getFakeStore(initialStateJustTokens);
      await fakeStore.dispatch<any>(
        tokenActions.loadUserTokens(utilsT.secondAccountOnState.name),
      );
      expect(fakeStore.getState().userTokens).toEqual({
        list: [newUserTokenBalances[1], newUserTokenBalances[0]],
        loading: false,
      });
    });
    test('Must clear current userTokens, load userTokens filtered', async () => {
      const newUserTokenBalances = [
        utilsT.fakeGetUserBalanceResponse[1],
        utilsT.fakeGetUserBalanceResponse[2],
        tokenObjZeroBalance,
      ] as TokenBalance[];
      HiveEngineUtils.getUserBalance = jest
        .fn()
        .mockResolvedValueOnce(newUserTokenBalances);
      const fakeStore = getFakeStore(initialStateJustTokens);
      await fakeStore.dispatch<any>(
        tokenActions.loadUserTokens(utilsT.secondAccountOnState.name),
      );
      expect(fakeStore.getState().userTokens).toEqual({
        list: [newUserTokenBalances[1], newUserTokenBalances[0]],
        loading: false,
      });
    });

    test('If error, must catch and call Logger.error', async () => {
      const userTokensReseted = { list: [], loading: true };
      const promiseError = new Error('Custom Message');
      const spyLoggerError = jest.spyOn(Logger, 'error');
      HiveEngineUtils.getUserBalance = jest
        .fn()
        .mockRejectedValueOnce(promiseError);
      const fakeStore = getFakeStore(initialStateJustTokens);
      await fakeStore.dispatch<any>(
        tokenActions.loadUserTokens(utilsT.secondAccountOnState.name),
      );
      expect(fakeStore.getState().userTokens).toEqual(userTokensReseted);
      expect(spyLoggerError).toBeCalledWith(promiseError);
      spyLoggerError.mockReset();
      spyLoggerError.mockRestore();
    });
  });

  describe('loadTokenHistory tests:\n', () => {
    test('Must load tokenHistory', async () => {
      const currency = 'LEO';
      const axiosResponse1 = {
        data: utilsT.fakeTokensGetAccountHistoryResponse,
      } as AxiosResponse;
      const axiosResponse2 = {
        data: [],
      } as AxiosResponse;
      historyHiveEngineAPI.get = jest
        .fn()
        .mockResolvedValueOnce(Promise.resolve(axiosResponse1))
        .mockResolvedValueOnce(Promise.resolve(axiosResponse2));
      const fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(
        tokenActions.loadTokenHistory(
          utilsT.secondAccountOnState.name,
          currency,
        ),
      );
      expect(fakeStore.getState().tokenHistory).toEqual([
        ...utilsT.expectedPayLoadloadTokenHistory,
      ]);
    });
    test('If error on response, will throw an unhandled error', async () => {
      const currency = 'LEO';
      const error = new Error('Custom Error');
      historyHiveEngineAPI.get = jest
        .fn()
        .mockResolvedValueOnce(Promise.reject(error));
      const fakeStore = getFakeStore(initialEmptyStateStore);
      try {
        await fakeStore.dispatch<any>(
          tokenActions.loadTokenHistory(
            utilsT.secondAccountOnState.name,
            currency,
          ),
        );
        expect(fakeStore.getState().tokenHistory).toEqual([
          ...utilsT.expectedPayLoadloadTokenHistory,
        ]);
      } catch (error) {
        expect(error).toEqual(error);
      }
    });
  });
});
