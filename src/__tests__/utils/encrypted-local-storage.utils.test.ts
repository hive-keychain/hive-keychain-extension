import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import EncryptedLocalStorageUtils from 'src/utils/encrypted-local-storage.utils';
import {
  getValueFromLocalStorageRaw,
  saveValueInLocalStorageRaw,
} from 'src/utils/localStorage.utils';
import VaultUtils from 'src/utils/vault.utils';

describe('encrypted-local-storage.utils', () => {
  const storage = new Map<string, unknown>();

  beforeEach(() => {
    storage.clear();
    EncryptedLocalStorageUtils.clearCache();
    jest.spyOn(VaultUtils, 'getValueFromVault').mockResolvedValue(mk.user.one);
    jest
      .spyOn(chrome.storage.local, 'get')
      .mockImplementation((keys: any, cb: any) => {
        const result: Record<string, unknown> = {};
        const requested = Array.isArray(keys) ? keys : [keys];
        for (const key of requested) {
          if (storage.has(key)) {
            result[key] = storage.get(key);
          }
        }
        cb(result);
      });
    jest
      .spyOn(chrome.storage.local, 'set')
      .mockImplementation((items: Record<string, unknown>, cb?: () => void) => {
        Object.entries(items).forEach(([key, value]) => storage.set(key, value));
        cb?.();
        return undefined as any;
      });
  });

  afterEach(() => {
    EncryptedLocalStorageUtils.clearCache();
    jest.restoreAllMocks();
  });

  it('encrypts identity values in place and decrypts them', async () => {
    await EncryptedLocalStorageUtils.saveEncryptedJson(
      LocalStorageKeyEnum.ACTIVE_ACCOUNT_NAME,
      'alice',
      mk.user.one,
    );

    const stored = await getValueFromLocalStorageRaw(
      LocalStorageKeyEnum.ACTIVE_ACCOUNT_NAME,
    );
    expect(typeof stored).toBe('string');
    expect(EncryptUtils.isEncryptedJsonV2(stored)).toBe(true);
    expect(stored).not.toContain('alice');

    EncryptedLocalStorageUtils.clearCache();
    await expect(
      EncryptedLocalStorageUtils.getEncryptedJson(
        LocalStorageKeyEnum.ACTIVE_ACCOUNT_NAME,
        mk.user.one,
      ),
    ).resolves.toBe('alice');
  });

  it('migrates plaintext identity keys immediately', async () => {
    await saveValueInLocalStorageRaw(LocalStorageKeyEnum.NO_CONFIRM, {
      alice: { 'https://dapp.example': { signBuffer: true } },
    });

    await EncryptedLocalStorageUtils.migrateIdentitySettings(mk.user.one);

    const stored = await getValueFromLocalStorageRaw(
      LocalStorageKeyEnum.NO_CONFIRM,
    );
    expect(EncryptUtils.isEncryptedJsonV2(stored)).toBe(true);
    EncryptedLocalStorageUtils.clearCache();
    await expect(
      EncryptedLocalStorageUtils.getEncryptedJson(
        LocalStorageKeyEnum.NO_CONFIRM,
        mk.user.one,
      ),
    ).resolves.toEqual({
      alice: { 'https://dapp.example': { signBuffer: true } },
    });
  });

  it('returns empty for ciphertext when mk is missing and does not overwrite', async () => {
    await EncryptedLocalStorageUtils.saveEncryptedJson(
      LocalStorageKeyEnum.EVM_ACTIVE_ACCOUNT_WALLET,
      '0xabc',
      mk.user.one,
    );
    const storedBefore = await getValueFromLocalStorageRaw(
      LocalStorageKeyEnum.EVM_ACTIVE_ACCOUNT_WALLET,
    );
    EncryptedLocalStorageUtils.clearCache();
    jest.spyOn(VaultUtils, 'getValueFromVault').mockResolvedValue(undefined);

    await expect(
      EncryptedLocalStorageUtils.getEncryptedJson(
        LocalStorageKeyEnum.EVM_ACTIVE_ACCOUNT_WALLET,
      ),
    ).resolves.toBeUndefined();
    await expect(
      getValueFromLocalStorageRaw(
        LocalStorageKeyEnum.EVM_ACTIVE_ACCOUNT_WALLET,
      ),
    ).resolves.toEqual(storedBefore);
  });

  it('does not overwrite storage when decryption fails', async () => {
    await EncryptedLocalStorageUtils.saveEncryptedJson(
      LocalStorageKeyEnum.FAVORITE_USERS,
      { alice: [] },
      mk.user.one,
    );
    const storedBefore = await getValueFromLocalStorageRaw(
      LocalStorageKeyEnum.FAVORITE_USERS,
    );
    EncryptedLocalStorageUtils.clearCache();

    await expect(
      EncryptedLocalStorageUtils.getEncryptedJson(
        LocalStorageKeyEnum.FAVORITE_USERS,
        'wrong-password',
      ),
    ).resolves.toBeUndefined();
    await expect(
      getValueFromLocalStorageRaw(LocalStorageKeyEnum.FAVORITE_USERS),
    ).resolves.toEqual(storedBefore);
  });

  it('reencrypts identity settings with a new password', async () => {
    await EncryptedLocalStorageUtils.saveEncryptedJson(
      LocalStorageKeyEnum.ACTIVE_ACCOUNT_NAME,
      'alice',
      mk.user.one,
    );

    await EncryptedLocalStorageUtils.reencryptIdentitySettings(
      mk.user.one,
      'new-password-16chars',
    );

    EncryptedLocalStorageUtils.clearCache();
    await expect(
      EncryptedLocalStorageUtils.getEncryptedJson(
        LocalStorageKeyEnum.ACTIVE_ACCOUNT_NAME,
        'new-password-16chars',
      ),
    ).resolves.toBe('alice');
  });
});
