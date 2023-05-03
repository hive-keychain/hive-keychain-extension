import { KeychainApi } from '@api/keychain';
import * as phishinActions from '@popup/actions/phishing.actions';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import config from 'src/__tests__/utils-for-testing/setups/config';
config.afterAllCleanAndResetMocks();
describe('phishing.actions tests:\n', () => {
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
