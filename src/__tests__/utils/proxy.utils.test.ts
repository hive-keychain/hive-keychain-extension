import AccountUtils from '@hiveapp/utils/account.utils';
import ProxyUtils from '@hiveapp/utils/proxy.utils';
import { ExtendedAccount } from '@hiveio/dhive';

describe('proxy.utils tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
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
