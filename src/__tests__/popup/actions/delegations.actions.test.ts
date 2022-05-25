import KeychainApi from '@api/keychain';
import { ActionType } from '@popup/actions/action-type.enum';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as delegationsActions from 'src/popup/actions/delegations.actions';
import HiveUtils from 'src/utils/hive.utils';
import Logger from 'src/utils/logger.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
//configuring
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
//end configuring
describe('delegations.actions tests:\n', () => {
  describe('loadDelegators tests:\n', () => {
    test('If a valid response is obtained, must return a FETCH_DELEGATORS action and the data as payload.incoming', async () => {
      const spyKeychainApiGet = jest
        .spyOn(KeychainApi, 'get')
        .mockResolvedValueOnce({
          data: utilsT.fakeGetDelegatorsResponse,
        });
      const mockedStore = mockStore({});
      return await mockedStore
        .dispatch<any>(
          delegationsActions.loadDelegators(utilsT.userData.username),
        )
        .then(() => {
          expect(mockedStore.getActions()).toEqual([
            {
              payload: {
                incoming: utilsT.fakeGetDelegatorsResponse,
              },
              type: ActionType.FETCH_DELEGATORS,
            },
          ]);
          expect(spyKeychainApiGet).toBeCalledTimes(1);
          expect(
            spyKeychainApiGet.mock.calls[0][0].includes(
              utilsT.userData.username,
            ),
          ).toBe(true);
          spyKeychainApiGet.mockReset();
          spyKeychainApiGet.mockRestore();
        });
    });
    test('If an errors occurs, must catch the error, call Logger.error and return 2 specific actions', async () => {
      const customErrorMessage = 'Custom Error';
      const promiseError = new Error(customErrorMessage);
      const spyKeychainApiGet = jest
        .spyOn(KeychainApi, 'get')
        .mockRejectedValueOnce(promiseError);
      const spyLoggerError = jest.spyOn(Logger, 'error');
      const mockedStore = mockStore({});
      return await mockedStore
        .dispatch<any>(
          delegationsActions.loadDelegators(utilsT.userData.username),
        )
        .then(() => {
          expect(mockedStore.getActions()).toEqual([
            {
              payload: {
                incoming: null,
              },
              type: ActionType.FETCH_DELEGATORS,
            },
            {
              payload: {
                key: 'popup_html_error_retrieving_incoming_delegations',
                params: [],
                type: 'ERROR',
              },
              type: ActionType.SET_MESSAGE,
            },
          ]);
          expect(spyLoggerError).toBeCalledTimes(1);
          expect(spyLoggerError).toBeCalledWith(promiseError);
          expect(spyKeychainApiGet).toBeCalledTimes(1);
          expect(
            spyKeychainApiGet.mock.calls[0][0].includes(
              utilsT.userData.username,
            ),
          ).toBe(true);
          spyKeychainApiGet.mockReset();
          spyKeychainApiGet.mockRestore();
          spyLoggerError.mockReset();
          spyLoggerError.mockRestore();
        });
    });
  });

  describe('loadDelegatees tests:\n', () => {
    const expectedArrayOrdered = [
      {
        id: 1350016,
        delegator: 'blocktrades',
        delegatee: 'usainvote',
        vesting_shares: '300.000000 VESTS',
        min_delegation_time: '2020-08-16T05:34:33',
      },
      {
        id: 933999,
        delegator: 'blocktrades',
        delegatee: 'ocdb',
        vesting_shares: '200.902605 VESTS',
        min_delegation_time: '2018-05-25T22:14:30',
      },
      {
        id: 270663,
        delegator: 'blocktrades',
        delegatee: 'buildawhale',
        vesting_shares: '100.000000 VESTS',
        min_delegation_time: '2017-09-29T02:19:03',
      },
    ];
    const usernameUsed = utilsT.userData.username;
    const argumentsCallingApi = [usernameUsed, '', 1000];
    test('If a valid response is obtained, must return a FETCH_DELEGATEES action and the data as payload.outgoing', async () => {
      const mockedGetVestingDelegations =
        (HiveUtils.getClient().database.getVestingDelegations = jest
          .fn()
          .mockResolvedValueOnce(utilsT.fakeGetDelegateesResponse));

      const mockedStore = mockStore({});
      return await mockedStore
        .dispatch<any>(delegationsActions.loadDelegatees(usernameUsed))
        .then(() => {
          expect(mockedStore.getActions()).toEqual([
            {
              payload: {
                outgoing: expectedArrayOrdered,
              },
              type: ActionType.FETCH_DELEGATEES,
            },
          ]);
          expect(mockedGetVestingDelegations).toBeCalledTimes(1);
          expect(mockedGetVestingDelegations).toBeCalledWith(
            ...argumentsCallingApi,
          );
          mockedGetVestingDelegations.mockReset();
          mockedGetVestingDelegations.mockRestore();
        });
    });
    test('If an errors occurs, must catch the error, call Logger.error and return no actions', async () => {
      const customErrorMessage = 'Custom Error';
      const promiseError = new Error(customErrorMessage);
      const mockedGetVestingDelegations =
        (HiveUtils.getClient().database.getVestingDelegations = jest
          .fn()
          .mockRejectedValueOnce(promiseError));

      const spyLoggerError = jest.spyOn(Logger, 'error');
      const mockedStore = mockStore({});
      return await mockedStore
        .dispatch<any>(
          delegationsActions.loadDelegatees(utilsT.userData.username),
        )
        .then(() => {
          expect(mockedStore.getActions()).toEqual([]);
          expect(spyLoggerError).toBeCalledTimes(1);
          expect(spyLoggerError).toBeCalledWith(promiseError);
          expect(mockedGetVestingDelegations).toBeCalledTimes(1);
          expect(mockedGetVestingDelegations).toBeCalledWith(
            ...argumentsCallingApi,
          );
          mockedGetVestingDelegations.mockReset();
          mockedGetVestingDelegations.mockRestore();
          spyLoggerError.mockReset();
          spyLoggerError.mockRestore();
        });
    });
  });
});
