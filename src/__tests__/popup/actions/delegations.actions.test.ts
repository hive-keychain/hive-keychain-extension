import { DelegationUtils } from '@hiveapp/utils/delegation.utils';
import multichainReducers from '@popup/multichain/reducers';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import delegations from 'src/__tests__/utils-for-testing/data/delegations';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import * as delegationsActions from 'src/popup/hive/actions/delegations.actions';
import Logger from 'src/utils/logger.utils';

/** `setErrorMessage` is handled by multichain `message` reducer, not hive-only store. */
const createDelegationsTestStore = () =>
  createStore(multichainReducers, applyMiddleware(thunk));

describe('delegations.actions tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('loadDelegators tests:\n', () => {
    test('Must fetch delegators', async () => {
      DelegationUtils.getDelegators = jest
        .fn()
        .mockResolvedValue(delegations.delegators);
      const fakeStore = createDelegationsTestStore();
      await fakeStore.dispatch<any>(
        delegationsActions.loadDelegators(userData.two.username),
      );
      expect(fakeStore.getState().hive.delegations.incoming).toEqual(
        delegations.delegators,
      );
    });
    test('If an errors occurs, must catch the error, set errorMessage and delgations to null', async () => {
      const errorMessageExpected = {
        key: 'popup_html_error_retrieving_incoming_delegations',
        params: [],
        type: 'ERROR',
      };
      const promiseError = new Error('Custom error message');
      DelegationUtils.getDelegators = jest.fn().mockRejectedValue(promiseError);
      jest.spyOn(Logger, 'error');
      const fakeStore = createDelegationsTestStore();
      await fakeStore.dispatch<any>(
        delegationsActions.loadDelegators(userData.two.username),
      );
      expect(fakeStore.getState().hive.delegations.incoming).toEqual(null);
      expect(fakeStore.getState().message).toEqual(errorMessageExpected);
    });
  });

  describe('loadDelegatees tests:\n', () => {
    test('Must fetch delegatees', async () => {
      DelegationUtils.getDelegatees = jest
        .fn()
        .mockResolvedValue(delegations.delegatees);
      const fakeStore = createDelegationsTestStore();
      await fakeStore.dispatch<any>(
        delegationsActions.loadDelegatees(userData.two.username),
      );
      expect(fakeStore.getState().hive.delegations.outgoing).toEqual(
        delegations.delegatees,
      );
    });
    test('If an errors occurs, must catch the error and call Logger.error', async () => {
      const customErrorMessage = 'Custom Error';
      const promiseError = new Error(customErrorMessage);
      DelegationUtils.getDelegatees = jest
        .fn()
        .mockRejectedValueOnce(promiseError);
      const spyLoggerError = jest.spyOn(Logger, 'error');
      const fakeStore = createDelegationsTestStore();
      await fakeStore.dispatch<any>(
        delegationsActions.loadDelegatees(userData.two.username),
      );
      expect(fakeStore.getState().hive.delegations.outgoing).toEqual([]);
      expect(spyLoggerError).toHaveBeenCalledTimes(1);
      expect(spyLoggerError).toHaveBeenCalledWith(promiseError);
      spyLoggerError.mockClear();
      spyLoggerError.mockReset();
    });
  });
});
