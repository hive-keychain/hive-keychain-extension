import { KeychainApi } from '@api/keychain';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import * as phishinActions from 'src/popup/hive/actions/phishing.actions';

describe('phishing.actions tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  test('Must set phising accounts', async () => {
    const phisingAccounts = ['account1', 'account2', 'account3'];
    KeychainApi.get = jest.fn().mockResolvedValueOnce(phisingAccounts);
    const fakeStore = getFakeStore(initialEmptyStateStore);
    await fakeStore.dispatch<any>(phishinActions.fetchPhishingAccounts());
    expect(fakeStore.getState().phishing).toEqual(phisingAccounts);
  });
  test('If error, will throw an unhandled error', async () => {
    const error = new Error('Error Message');
    KeychainApi.get = jest.fn().mockRejectedValueOnce(error);
    const fakeStore = getFakeStore(initialEmptyStateStore);
    try {
      await fakeStore.dispatch<any>(phishinActions.fetchPhishingAccounts());
      expect(fakeStore.getState().phishing).toEqual('');
    } catch (error) {
      expect(error).toEqual(error);
    }
  });
});
