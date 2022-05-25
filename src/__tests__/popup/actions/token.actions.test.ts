import { historyHiveEngineAPI } from '@api/hiveEngine';
import { TokenBalance } from '@interfaces/tokens.interface';
import { ActionType } from '@popup/actions/action-type.enum';
import { AxiosResponse } from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as tokenActions from 'src/popup/actions/token.actions';
import HiveEngineUtils from 'src/utils/hive-engine.utils';
import Logger from 'src/utils/logger.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
//configuring
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
//end configuring
describe('token.actions tests:\n', () => {
  const account = utilsT.userData.username;
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
  const extraTokenObjWBalance = {
    _id: 119998,
    account: utilsT.userData.username,
    symbol: 'FAKETOKEN2',
    balance: '10',
    stake: '10.000',
    pendingUnstake: '0',
    delegationsIn: '0',
    delegationsOut: '0',
    pendingUndelegations: '0',
  };
  describe('loadUserTokens tests:\n', () => {
    test('Getting tokens with valid balances, must return 2 actions(CLEAR_USER_TOKENS, LOAD_USER_TOKENS) and a payload with an ordered array', async () => {
      const mockGetUserBalance = (HiveEngineUtils.getUserBalance = jest
        .fn()
        .mockResolvedValueOnce(
          utilsT.fakeGetUserBalanceResponse as TokenBalance[],
        ));
      const expectedResponse = [
        { type: ActionType.CLEAR_USER_TOKENS },
        {
          payload: [
            utilsT.fakeGetUserBalanceResponse[2],
            utilsT.fakeGetUserBalanceResponse[1],
            utilsT.fakeGetUserBalanceResponse[0],
          ],
          type: ActionType.LOAD_USER_TOKENS,
        },
      ];
      const mockedStore = mockStore({});
      return await mockedStore
        .dispatch<any>(tokenActions.loadUserTokens(account))
        .then(() => {
          expect(mockedStore.getActions()).toEqual(expectedResponse);
          expect(mockGetUserBalance).toBeCalledTimes(1);
          expect(mockGetUserBalance).toBeCalledWith(account);
          mockGetUserBalance.mockReset();
          mockGetUserBalance.mockRestore();
        });
    });
    test('Getting tokens with 0 balances, must return 2 actions(CLEAR_USER_TOKENS, LOAD_USER_TOKENS) and a payload with an ordered array and remove those results', async () => {
      const mockGetUserBalance = (HiveEngineUtils.getUserBalance = jest
        .fn()
        .mockResolvedValueOnce([
          ...utilsT.fakeGetUserBalanceResponse,
          tokenObjZeroBalance,
          extraTokenObjWBalance,
        ] as TokenBalance[]));
      const expectedResponse = [
        { type: ActionType.CLEAR_USER_TOKENS },
        {
          payload: [
            utilsT.fakeGetUserBalanceResponse[2],
            utilsT.fakeGetUserBalanceResponse[1],
            utilsT.fakeGetUserBalanceResponse[0],
            extraTokenObjWBalance,
          ],
          type: ActionType.LOAD_USER_TOKENS,
        },
      ];
      const mockedStore = mockStore({});
      return await mockedStore
        .dispatch<any>(tokenActions.loadUserTokens(account))
        .then(() => {
          expect(mockedStore.getActions()).toEqual(expectedResponse);
          expect(mockGetUserBalance).toBeCalledTimes(1);
          expect(mockGetUserBalance).toBeCalledWith(account);
          mockGetUserBalance.mockReset();
          mockGetUserBalance.mockRestore();
        });
    });
    test('If a promise error occurs, must catch the error, call Logger and return just CLEAR_USER_TOKENS action', async () => {
      const promiseError = new Error('Custom Message');
      const spyLoggerError = jest.spyOn(Logger, 'error');
      const mockGetUserBalance = (HiveEngineUtils.getUserBalance = jest
        .fn()
        .mockRejectedValueOnce(promiseError));
      const expectedResponse: any = [{ type: ActionType.CLEAR_USER_TOKENS }];
      const mockedStore = mockStore({});
      return await mockedStore
        .dispatch<any>(tokenActions.loadUserTokens(account))
        .then(() => {
          expect(mockedStore.getActions()).toEqual(expectedResponse);
          expect(spyLoggerError).toBeCalledTimes(1);
          expect(spyLoggerError).toBeCalledWith(promiseError);
          expect(mockGetUserBalance).toBeCalledTimes(1);
          expect(mockGetUserBalance).toBeCalledWith(account);
          mockGetUserBalance.mockReset();
          mockGetUserBalance.mockRestore();
          spyLoggerError.mockReset();
          spyLoggerError.mockRestore();
        });
    });
  });

  describe('loadTokenHistory tests:\n', () => {
    test('Passing an account with history transactions on a particular token, will return the history array with adapted fields as payload and LOAD_TOKEN_HISTORY action', async () => {
      const currency = 'LEO';
      const axiosResponse1 = {
        data: utilsT.fakeTokensGetAccountHistoryResponse,
      } as AxiosResponse;
      const axiosResponse2 = {
        data: [],
      } as AxiosResponse;
      const mockhistoryHiveEngineAPIGet = (historyHiveEngineAPI.get = jest
        .fn()
        .mockResolvedValueOnce(
          Promise.resolve(axiosResponse1),
        )).mockResolvedValueOnce(Promise.resolve(axiosResponse2));
      const expectedResults = [
        {
          payload: [...utilsT.expectedPayLoadloadTokenHistory],
          type: ActionType.LOAD_TOKEN_HISTORY,
        },
      ];
      const callingParams1 = [
        'accountHistory',
        {
          params: {
            account: account,
            offset: 0,
            symbol: currency,
            type: 'user',
          },
        },
      ];
      const callingParams2 = [
        'accountHistory',
        {
          params: {
            account: account,
            offset: 1000,
            symbol: currency,
            type: 'user',
          },
        },
      ];
      const mockedStore = mockStore({});
      return mockedStore
        .dispatch<any>(tokenActions.loadTokenHistory(account, currency))
        .then(() => {
          expect(mockedStore.getActions()).toEqual(expectedResults);
          expect(mockhistoryHiveEngineAPIGet).toBeCalledTimes(2);
          expect(mockhistoryHiveEngineAPIGet.mock.calls[0]).toEqual(
            callingParams1,
          );
          expect(mockhistoryHiveEngineAPIGet.mock.calls[1]).toEqual(
            callingParams2,
          );
          mockhistoryHiveEngineAPIGet.mockReset();
          mockhistoryHiveEngineAPIGet.mockRestore();
        });
    });
  });
});
