import { KeylessKeychainUtils } from '@background/utils/keyless-keychain.utils';
import {
  KeylessAuthData,
  KeylessAuthDataUserDictionary,
} from '@interfaces/keyless-keychain.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import VaultUtils from 'src/utils/vault.utils';

describe('keyless-keychain.utils tests:\n', () => {
  const password = mk.user.one;
  const keylessAuthDataUserDictionary: KeylessAuthDataUserDictionary = {
    alice: [
      {
        appName: 'peakd.com',
        authKey: 'auth-key',
        uuid: 'uuid-1',
        expire: 123456789,
        token: 'token-1',
      },
    ],
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('reads legacy keyless payloads and migrates them to v2', async () => {
    const legacyPayload = EncryptUtils.encrypt(
      JSON.stringify(keylessAuthDataUserDictionary),
      password,
    );

    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(legacyPayload);
    const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');

    const result = await KeylessKeychainUtils.getKeylessAuthDataUserDictionaryFromPassword(
      password,
    );

    expect(result).toEqual(keylessAuthDataUserDictionary);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(
      LocalStorageKeyEnum.KEYLESS_KEYCHAIN_AUTH_DATA_USER_DICT,
      expect.any(String),
    );

    const migratedPayload = saveSpy.mock.calls[0][1];
    expect(EncryptUtils.isEncryptedJsonV2(migratedPayload)).toBe(true);
    expect(await EncryptUtils.decryptToJson(migratedPayload, password)).toEqual(
      {
        list: keylessAuthDataUserDictionary,
      },
    );
  });

  it('awaits legacy migration persistence before returning keyless auth data', async () => {
    const legacyPayload = EncryptUtils.encrypt(
      JSON.stringify(keylessAuthDataUserDictionary),
      password,
    );

    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(legacyPayload);

    let notifySaveCalled!: () => void;
    const saveCalled = new Promise<void>((resolve) => {
      notifySaveCalled = resolve;
    });
    let resolveSave!: () => void;
    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockImplementation(() => {
        notifySaveCalled();
        return new Promise<void>((resolve) => {
          resolveSave = resolve;
        });
      });

    let settled = false;
    const resultPromise = KeylessKeychainUtils.getKeylessAuthDataUserDictionaryFromPassword(
      password,
    ).then((result) => {
      settled = true;
      return result;
    });

    await saveCalled;
    expect(settled).toBe(false);

    resolveSave();

    expect(await resultPromise).toEqual(keylessAuthDataUserDictionary);
  });

  it('writes new keyless auth data as v2', async () => {
    jest.spyOn(VaultUtils, 'getValueFromVault').mockResolvedValue(password);
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(undefined);
    const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');

    await KeylessKeychainUtils.storeKeylessAuthData('alice', {
      appName: 'peakd.com',
      authKey: 'auth-key',
      uuid: 'uuid-1',
      expire: 123456789,
      token: 'token-1',
    });

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(
      LocalStorageKeyEnum.KEYLESS_KEYCHAIN_AUTH_DATA_USER_DICT,
      expect.any(String),
    );

    const storedPayload = saveSpy.mock.calls[0][1];
    expect(EncryptUtils.isEncryptedJsonV2(storedPayload)).toBe(true);
    expect(await EncryptUtils.decryptToJson(storedPayload, password)).toEqual({
      list: keylessAuthDataUserDictionary,
    });
    expect(VaultUtils.getValueFromVault).toHaveBeenCalledWith(VaultKey.__MK);
  });

  it('fails safely with the wrong password', async () => {
    const encryptedPayload = await EncryptUtils.encryptJson(
      { list: keylessAuthDataUserDictionary },
      password,
    );

    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(encryptedPayload);
    const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');

    await expect(
      KeylessKeychainUtils.getKeylessAuthDataUserDictionaryFromPassword(
        'wrong password',
      ),
    ).rejects.toThrow('Failed to get keyless auth data user dictionary');
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('fails safely on malformed payloads', async () => {
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue('{not valid json');
    const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');

    await expect(
      KeylessKeychainUtils.getKeylessAuthDataUserDictionaryFromPassword(
        password,
      ),
    ).rejects.toThrow('Failed to get keyless auth data user dictionary');
    expect(saveSpy).not.toHaveBeenCalled();
  });

  describe('isKeylessAuthDataRegistered', () => {
    const base: KeylessAuthData = {
      appName: 'a',
      authKey: 'k',
      uuid: 'u1',
      expire: 9e15,
    };

    it('returns false when expire or uuid is missing', () => {
      expect(
        KeylessKeychainUtils.isKeylessAuthDataRegistered({
          ...base,
          expire: undefined as unknown as number,
        }),
      ).toBe(false);
      expect(
        KeylessKeychainUtils.isKeylessAuthDataRegistered({
          ...base,
          uuid: undefined as unknown as string,
        }),
      ).toBe(false);
    });

    it('returns false when expire is in the past', () => {
      expect(
        KeylessKeychainUtils.isKeylessAuthDataRegistered({
          ...base,
          expire: 1,
        }),
      ).toBe(false);
    });

    it('returns true when uuid and expire are valid', () => {
      jest.spyOn(Date, 'now').mockReturnValue(1000);
      expect(
        KeylessKeychainUtils.isKeylessAuthDataRegistered({
          ...base,
          expire: 2000,
        }),
      ).toBe(true);
      jest.restoreAllMocks();
    });
  });

  describe('registerUserAndDapp', () => {
    it('throws when username is missing', async () => {
      await expect(
        KeylessKeychainUtils.registerUserAndDapp({} as any, 'd.app'),
      ).rejects.toThrow(/Username is missing/);
    });
  });

  describe('getKeylessAuthDataUserDictionary', () => {
    it('throws when MK is not in vault', async () => {
      jest.spyOn(VaultUtils, 'getValueFromVault').mockResolvedValue(undefined);

      await expect(
        KeylessKeychainUtils.getKeylessAuthDataUserDictionary(),
      ).rejects.toThrow(/MK not found/);
    });
  });

  describe('getKeylessAuthDataByUUID', () => {
    it('returns matching entry or undefined', async () => {
      jest.spyOn(VaultUtils, 'getValueFromVault').mockResolvedValue(password);
      jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue(
        await EncryptUtils.encryptJson(
          {
            list: {
              alice: [
                {
                  appName: 'peakd.com',
                  authKey: 'k',
                  uuid: 'uuid-match',
                  expire: 9e15,
                },
              ],
            },
          },
          password,
        ),
      );

      await expect(
        KeylessKeychainUtils.getKeylessAuthDataByUUID('alice', 'uuid-match'),
      ).resolves.toMatchObject({ uuid: 'uuid-match' });

      await expect(
        KeylessKeychainUtils.getKeylessAuthDataByUUID('alice', 'other'),
      ).resolves.toBeUndefined();
    });
  });

  describe('removeKeylessAuthData', () => {
    it('removes auth row by uuid and persists', async () => {
      jest.spyOn(VaultUtils, 'getValueFromVault').mockResolvedValue(password);
      const dict = {
        alice: [
          {
            appName: 'a',
            authKey: 'k',
            uuid: 'keep-me',
            expire: 9e15,
          },
          {
            appName: 'b',
            authKey: 'k2',
            uuid: 'drop-me',
            expire: 9e15,
          },
        ],
      };
      jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue(
        await EncryptUtils.encryptJson({ list: dict }, password),
      );
      const saveSpy = jest
        .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
        .mockResolvedValue(undefined);

      await KeylessKeychainUtils.removeKeylessAuthData('alice', 'drop-me');

      const saved = saveSpy.mock.calls[0][1];
      const decrypted = await EncryptUtils.decryptToJson(saved, password);
      expect(decrypted.list.alice).toHaveLength(1);
      expect(decrypted.list.alice[0].uuid).toBe('keep-me');
    });

    it('no-ops when user has no keyless rows', async () => {
      jest.spyOn(VaultUtils, 'getValueFromVault').mockResolvedValue(password);
      jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue(
        await EncryptUtils.encryptJson({ list: {} }, password),
      );
      const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');

      await KeylessKeychainUtils.removeKeylessAuthData('ghost', 'u1');

      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('updateAuthenticatedKeylessAuthData', () => {
    it('stores uuid and expire on keyless auth for username', async () => {
      jest.spyOn(VaultUtils, 'getValueFromVault').mockResolvedValue(password);
      jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue(
        await EncryptUtils.encryptJson({ list: { alice: [] } }, password),
      );
      const saveSpy = jest
        .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
        .mockResolvedValue(undefined);

      await KeylessKeychainUtils.updateAuthenticatedKeylessAuthData(
        {
          appName: 'peakd.com',
          authKey: 'ak',
          request: { username: 'alice' },
        } as any,
        { uuid: 'sess-uuid', expire: 8888888888888 } as any,
      );

      expect(saveSpy).toHaveBeenCalled();
      const payload = saveSpy.mock.calls[0][1];
      const decrypted = await EncryptUtils.decryptToJson(payload, password);
      expect(decrypted.list.alice).toEqual([
        expect.objectContaining({
          uuid: 'sess-uuid',
          expire: 8888888888888,
          appName: 'peakd.com',
          authKey: 'ak',
        }),
      ]);
    });
  });

  describe('encryptHiveAuthRequestData', () => {
    it('encrypts and returns keyless auth payload', async () => {
      jest.spyOn(VaultUtils, 'getValueFromVault').mockResolvedValue(password);
      const dict: KeylessAuthDataUserDictionary = {
        alice: [
          {
            appName: 'peakd.com',
            authKey: 'auth-key',
            uuid: 'u',
            expire: 9e15,
          },
        ],
      };
      jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValue(await EncryptUtils.encryptJson({ list: dict }, password));
      jest.spyOn(EncryptUtils, 'encryptNoIV').mockReturnValue('cipher-1' as any);

      const out = await KeylessKeychainUtils.encryptHiveAuthRequestData(
        'alice',
        'peakd.com',
        { key_type: 'posting', ops: [], broadcast: true, nonce: 1 } as any,
      );

      expect(out.encryptedHiveAuthRequestData).toBe('cipher-1');
      expect(out.keylessAuthData.authKey).toBe('auth-key');
      expect(EncryptUtils.encryptNoIV).toHaveBeenCalled();
    });

    it('throws when no auth exists for app name', async () => {
      jest.spyOn(VaultUtils, 'getValueFromVault').mockResolvedValue(password);
      const dict: KeylessAuthDataUserDictionary = {
        alice: [{ appName: 'other.app', authKey: 'k', uuid: 'u', expire: 9e15 }],
      };
      jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValue(await EncryptUtils.encryptJson({ list: dict }, password));

      await expect(
        KeylessKeychainUtils.encryptHiveAuthRequestData(
          'alice',
          'peakd.com',
          {} as any,
        ),
      ).rejects.toThrow('Keyless auth data not found');
    });

    it('throws when auth key is missing on stored data', async () => {
      jest.spyOn(VaultUtils, 'getValueFromVault').mockResolvedValue(password);
      const dict: KeylessAuthDataUserDictionary = {
        alice: [
          {
            appName: 'peakd.com',
            authKey: '',
            uuid: 'u',
            expire: 9e15,
          },
        ],
      };
      jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValue(await EncryptUtils.encryptJson({ list: dict }, password));

      await expect(
        KeylessKeychainUtils.encryptHiveAuthRequestData(
          'alice',
          'peakd.com',
          {} as any,
        ),
      ).rejects.toThrow('Auth key not found');
    });
  });
});
