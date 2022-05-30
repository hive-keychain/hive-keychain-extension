import KeychainApi from '@api/keychain';
import * as delegationsActions from 'src/popup/actions/delegations.actions';
import HiveUtils from 'src/utils/hive.utils';
import Logger from 'src/utils/logger.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';

afterEach(() => {
  jest.clearAllMocks();
});
describe('delegations.actions tests:\n', () => {
  describe('loadDelegators tests:\n', () => {
    test('Must fetch delegators', async () => {
      jest.spyOn(KeychainApi, 'get').mockResolvedValueOnce({
        data: utilsT.fakeGetDelegatorsResponse,
      });
      const fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(
        delegationsActions.loadDelegators(utilsT.secondAccountOnState.name),
      );
      expect(fakeStore.getState().delegations.incoming).toEqual(
        utilsT.fakeGetDelegatorsResponse,
      );
    });
    test('If an errors occurs, must catch the error, set errorMessage and delgations to null', async () => {
      const errorMessageExpected = {
        key: 'popup_html_error_retrieving_incoming_delegations',
        params: [],
        type: 'ERROR',
      };
      const promiseError = new Error('Custom error message');
      jest.spyOn(KeychainApi, 'get').mockRejectedValueOnce(promiseError);
      jest.spyOn(Logger, 'error');
      const fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(
        delegationsActions.loadDelegators(utilsT.secondAccountOnState.name),
      );
      expect(fakeStore.getState().delegations.incoming).toEqual(null);
      expect(fakeStore.getState().errorMessage).toEqual(errorMessageExpected);
    });
  });

  describe('loadDelegatees tests:\n', () => {
    const expectedOrderedDelegatees = [
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
    test('Must fetch delegatees', async () => {
      HiveUtils.getClient().database.getVestingDelegations = jest
        .fn()
        .mockResolvedValueOnce(utilsT.fakeGetDelegateesResponse);
      const fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(
        delegationsActions.loadDelegatees(utilsT.secondAccountOnState.name),
      );
      expect(fakeStore.getState().delegations.outgoing).toEqual(
        expectedOrderedDelegatees,
      );
    });
    test('If an errors occurs, must catch the error and call Logger.error', async () => {
      const customErrorMessage = 'Custom Error';
      const promiseError = new Error(customErrorMessage);
      HiveUtils.getClient().database.getVestingDelegations = jest
        .fn()
        .mockRejectedValueOnce(promiseError);
      const spyLoggerError = jest.spyOn(Logger, 'error');
      const fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(
        delegationsActions.loadDelegatees(utilsT.secondAccountOnState.name),
      );
      expect(fakeStore.getState().delegations.outgoing).toEqual([]);
      expect(spyLoggerError).toBeCalledTimes(1);
      expect(spyLoggerError).toBeCalledWith(promiseError);
      spyLoggerError.mockClear();
      spyLoggerError.mockReset();
    });
  });
});
