import { TokenBalance } from '@interfaces/tokens.interface';
import tokenHistory from 'src/__tests__/utils-for-testing/data/history/transactions/tokens/token-history';
import tokensList from 'src/__tests__/utils-for-testing/data/tokens/tokens-list';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import {
  initialEmptyStateStore,
  initialStateJustTokens,
} from 'src/__tests__/utils-for-testing/initial-states';
import * as tokenActions from 'src/popup/hive/actions/token.actions';
import { HiveEngineUtils } from 'src/utils/hive-engine.utils';
import Logger from 'src/utils/logger.utils';
import TokensUtils from 'src/utils/tokens.utils';

describe('token.actions tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  const tokenObjZeroBalance = {
    _id: 119999,
    account: userData.one.username,
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
      HiveEngineUtils.get = jest
        .fn()
        .mockResolvedValueOnce(tokensList.fakeTokensResponse);
      const fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(tokenActions.loadTokens());
      expect(fakeStore.getState().tokens).toEqual(
        tokensList.expectedTokensPayload,
      );
    });

    test('If error on response, will throw an unhandled error', async () => {
      HiveEngineUtils.get = jest
        .fn()
        .mockResolvedValueOnce(tokensList.fakeTokensResponseNoMetadata);
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
      HiveEngineUtils.get = jest
        .fn()
        .mockResolvedValueOnce(tokensList.fakeMarketMetricsResponse);
      const fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(tokenActions.loadTokensMarket());
      expect(fakeStore.getState().tokenMarket).toEqual(
        tokensList.fakeMarketMetricsResponse,
      );
    });
  });

  describe('loadUserTokens tests:\n', () => {
    test('Must clear current userTokens and load user tokens', async () => {
      const newUserTokenBalances =
        tokensList.fakeGetUserBalanceResponse as TokenBalance[];
      TokensUtils.getUserBalance = jest
        .fn()
        .mockResolvedValueOnce(newUserTokenBalances);
      const fakeStore = getFakeStore(initialStateJustTokens);
      await fakeStore.dispatch<any>(
        tokenActions.loadUserTokens(userData.two.username),
      );
      expect(fakeStore.getState().userTokens).toEqual({
        list: newUserTokenBalances,
        loading: false,
      });
    });
    test('Must clear current userTokens, load userTokens filtered', async () => {
      const newUserTokenBalances = [
        tokensList.fakeGetUserBalanceResponse[1],
        tokensList.fakeGetUserBalanceResponse[2],
        tokenObjZeroBalance,
      ] as TokenBalance[];
      TokensUtils.getUserBalance = jest
        .fn()
        .mockResolvedValueOnce(newUserTokenBalances);
      const fakeStore = getFakeStore(initialStateJustTokens);
      await fakeStore.dispatch<any>(
        tokenActions.loadUserTokens(userData.two.username),
      );
      expect(fakeStore.getState().userTokens).toEqual({
        list: newUserTokenBalances,
        loading: false,
      });
    });

    test('If error, must catch and call Logger.error', async () => {
      const userTokensReseted = { list: [], loading: true };
      const promiseError = new Error('Custom Message');
      const spyLoggerError = jest.spyOn(Logger, 'error');
      TokensUtils.getUserBalance = jest
        .fn()
        .mockRejectedValueOnce(promiseError);
      const fakeStore = getFakeStore(initialStateJustTokens);
      await fakeStore.dispatch<any>(
        tokenActions.loadUserTokens(userData.two.username),
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
      const mHiveEngineGetHistory = jest
        .spyOn(HiveEngineUtils, 'getHistory')
        .mockResolvedValueOnce(tokenHistory.leoToken)
        .mockResolvedValueOnce([]);
      const fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(
        tokenActions.loadTokenHistory(userData.two.username, currency),
      );
      expect(fakeStore.getState().tokenHistory).toEqual(
        tokenHistory.expectedPayLoadloadTokenHistory,
      );
      mHiveEngineGetHistory.mockRestore();
    });
    test('If error on response, will throw an unhandled error', async () => {
      const currency = 'LEO';
      const error = new Error('Custom Error');
      const mHiveEngineGetHistory = jest
        .spyOn(HiveEngineUtils, 'getHistory')
        .mockRejectedValueOnce(error);
      const fakeStore = getFakeStore(initialEmptyStateStore);
      try {
        await fakeStore.dispatch<any>(
          tokenActions.loadTokenHistory(userData.two.username, currency),
        );
        expect(fakeStore.getState().tokenHistory).toEqual([
          ...tokensList.expectedPayLoadloadTokenHistory,
        ]);
      } catch (error) {
        expect(error).toEqual(error);
      }
      mHiveEngineGetHistory.mockRestore();
    });
  });
});
