import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import MkUtils from 'src/popup/hive/utils/mk.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('MkUtils.login', () => {
  let storage: Partial<Record<string, unknown>>;

  beforeEach(() => {
    storage = {};
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key) => storage[key]);
    jest
      .spyOn(LocalStorageUtils, 'getMultipleValueFromLocalStorage')
      .mockImplementation(async (keys) =>
        Object.fromEntries(keys.map((key) => [key, storage[key]])),
      );
    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    EncryptUtils.clearDerivedKeyCache();
    jest.restoreAllMocks();
  });

  it('requires the Hive password when there is no EVM account store', async () => {
    storage[LocalStorageKeyEnum.ACCOUNTS] = await EncryptUtils.encryptJson(
      { list: [{ name: 'alice', keys: {} }] },
      mk.user.one,
    );

    expect(await MkUtils.login(mk.user.two)).toBe(false);
    expect(await MkUtils.login(mk.user.one)).toBe(true);
  });

  it('rejects login when there is no account or keyless data to verify', async () => {
    expect(await MkUtils.login(mk.user.one)).toBe(false);
  });

  it('accepts a password that decrypts an empty EVM account list', async () => {
    storage[LocalStorageKeyEnum.EVM_ACCOUNTS] = await EncryptUtils.encryptJson(
      { list: [] },
      mk.user.one,
    );

    expect(await MkUtils.login(mk.user.two)).toBe(false);
    expect(await MkUtils.login(mk.user.one)).toBe(true);
  });

  it('accepts a password that decrypts legacy EVM accounts', async () => {
    storage[LocalStorageKeyEnum.EVM_ACCOUNTS] = EncryptUtils.encrypt(
      JSON.stringify({ hash: 'legacy-hash', list: [{ id: 1, accounts: [] }] }),
      mk.user.one,
    );

    expect(await MkUtils.login(mk.user.one)).toBe(true);
  });

  it('accepts a valid Hive password even if the EVM account store fails to decrypt', async () => {
    storage[LocalStorageKeyEnum.ACCOUNTS] = await EncryptUtils.encryptJson(
      { list: [] },
      mk.user.one,
    );
    storage[LocalStorageKeyEnum.EVM_ACCOUNTS] = await EncryptUtils.encryptJson(
      { list: [] },
      mk.user.two,
    );

    expect(await MkUtils.login(mk.user.one)).toBe(true);
  });

  it('requires the keyless password when only keyless data is stored', async () => {
    storage[LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED] = true;
    storage[LocalStorageKeyEnum.KEYLESS_KEYCHAIN_AUTH_DATA_USER_DICT] =
      await EncryptUtils.encryptJson(
        { list: { alice: [{ appName: 'peakd.com', authKey: 'auth-key' }] } },
        mk.user.one,
      );

    expect(await MkUtils.login(mk.user.two)).toBe(false);
    expect(await MkUtils.login(mk.user.one)).toBe(true);
  });
});
