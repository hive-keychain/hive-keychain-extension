import { KeylessKeychainUtils } from '@background/utils/keyless-keychain.utils';
import { KeylessAuthDataUserDictionary } from '@interfaces/keyless-keychain.interface';
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
});
