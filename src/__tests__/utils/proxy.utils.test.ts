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
      expect((error as TypeError).message).toContain('length');
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
  test('If account1 has account2 as proxy, and account2 has account3 as proxy, must return account3 as proxy', async () => {
    const requestedProxyAccountName = 'account2';
    const mockGetExtendedAccount = (AccountUtils.getExtendedAccount = jest
      .fn()
      .mockResolvedValueOnce({
        name: 'account2',
        proxy: 'account3',
      } as ExtendedAccount)
      .mockResolvedValueOnce({
        name: 'account3',
        proxy: '',
      } as ExtendedAccount));

    const result = await ProxyUtils.findUserProxy({
      name: 'account1',
      proxy: requestedProxyAccountName,
    } as ExtendedAccount);
    expect(result).toBe('account3');
    expect(mockGetExtendedAccount).toBeCalledTimes(2);
    mockGetExtendedAccount.mockReset();
    mockGetExtendedAccount.mockRestore();
  });
});
