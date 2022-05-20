import { ExtendedAccount } from '@hiveio/dhive';
import AccountUtils from 'src/utils/account.utils';
import ProxyUtils from 'src/utils/proxy.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';

afterEach(() => {
  jest.clearAllMocks();
});
describe('proxy.utils tests:\n', () => {
  test('Passing a account account with empty values(name,requested proxy) must return null', async () => {
    const result = await ProxyUtils.findUserProxy({
      name: '',
      proxy: '',
    } as ExtendedAccount);
    expect(result).toBe(null);
  });
  test('Passing a account account and empty requested proxy, must return null', async () => {
    const result = await ProxyUtils.findUserProxy({
      name: 'quentin.tarantino',
      proxy: '',
    } as ExtendedAccount);
    expect(result).toBe(null);
  });
  test('Passing an invalid requested proxy account(non existent on HIVE), will throw an unhandled error', async () => {
    const requestedProxyAccountName = 'fake.Account.NE';
    AccountUtils.getExtendedAccount = jest.fn().mockResolvedValueOnce([]);
    try {
      const result = await ProxyUtils.findUserProxy({
        name: 'quentin.tarantino',
        proxy: requestedProxyAccountName,
      } as ExtendedAccount);
      expect(result).toBe(requestedProxyAccountName);
    } catch (error) {
      expect(error).toEqual(
        new TypeError("Cannot read properties of undefined (reading 'length')"),
      );
    }
  });
  test('Passing valid data values, must return the requested proxy account name', async () => {
    const requestedProxyAccountName = 'cedricguillas';
    AccountUtils.getExtendedAccount = jest
      .fn()
      .mockResolvedValueOnce(utilsT.cedricDataSample);
    const result = await ProxyUtils.findUserProxy({
      name: 'quentin.tarantino',
      proxy: requestedProxyAccountName,
    } as ExtendedAccount);
    expect(result).toBe(requestedProxyAccountName);
  });
});
