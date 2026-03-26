import AccountUtils from 'src/popup/hive/utils/account.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import MkUtils from 'src/popup/hive/utils/mk.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('mk.utils tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('login tests:\n', () => {
    test('Passing an invalid password must return false', async () => {
      AccountUtils.getAccountsFromLocalStorage = jest
        .fn()
        .mockResolvedValueOnce(undefined);
      jest
        .spyOn(EvmWalletUtils, 'getAccountsFromLocalStorage')
        .mockResolvedValueOnce(undefined as never);
      LocalStorageUtils.getMultipleValueFromLocalStorage = jest
        .fn()
        .mockResolvedValueOnce({});
      const result = await MkUtils.login('wrong_password_to_decrypt');
      expect(result).toBe(false);
    });
    test('Passing a valid password must return true', async () => {
      AccountUtils.getAccountsFromLocalStorage = jest
        .fn()
        .mockResolvedValueOnce([]);
      jest
        .spyOn(EvmWalletUtils, 'getAccountsFromLocalStorage')
        .mockResolvedValueOnce([] as never);
      LocalStorageUtils.getMultipleValueFromLocalStorage = jest
        .fn()
        .mockResolvedValueOnce({});
      const result = await MkUtils.login('right_password');
      expect(result).toBe(true);
    });
    test('Passing a valid password with only v2 keyless storage must return true', async () => {
      const keylessPayload = await EncryptUtils.encryptJson(
        {
          list: {
            alice: [{ appName: 'peakd.com', authKey: 'auth-key' }],
          },
        },
        mk.user.one,
      );

      AccountUtils.getAccountsFromLocalStorage = jest
        .fn()
        .mockResolvedValueOnce(undefined);
      jest
        .spyOn(EvmWalletUtils, 'getAccountsFromLocalStorage')
        .mockResolvedValueOnce(undefined as never);
      LocalStorageUtils.getValueFromLocalStorage = jest
        .fn()
        .mockResolvedValueOnce(keylessPayload);
      LocalStorageUtils.getMultipleValueFromLocalStorage = jest
        .fn()
        .mockResolvedValueOnce({
          [LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED]: true,
          [LocalStorageKeyEnum.KEYLESS_KEYCHAIN_AUTH_DATA_USER_DICT]: keylessPayload,
        });

      const result = await MkUtils.login(mk.user.one);
      expect(result).toBe(true);
    });
  });
});
