import BgdAccountsUtils from '@background/utils/accounts.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('accounts.utils tests:\n', () => {
  const legacyPayload =
    '0000009b000000770000005700000029000000ae0000008d000000ae00000046WHrXFxuZRaj4uDwLXR8vFw+tW0M7fUZqAfRqnqga+fvyVCNAEnutR76JDJ+Hi6zfX2bMEkzk2c/fnL2FZb9e+ZNoklar2xYnxvM3tXjkh8Qj0roAbwXfWt+DzjqMfeTvuzHzbgnCzir7r5v6NgDug0pBplvNAsk83kj5Kd3gBmJfhRieDf8VRk18bZ8DUmhGqu0U0EmFn9KqSE6HxOKo/sZFRu0In8090s/05IHro9OLCZQ3vEy6A0GPyzoc5PyL/a7qgNiERpK37e3h3LXZBG9HkmDh0HimY2GoQzBYr7sOKFrrmfZlT7rtIuXWfa0nhQSM1pI9Y1s9Y2GWkoiUlweNRuTuAwFAi+SuEHRHBtmokqkgChUUT4bNs0fGbszm3NuB3rqiCXj27kcVWw/aqglb0qJGT77cv2gqhqSKu3BJkw7KNwkjFRYow/5ScHvh6RP1hUPEpEavIiuYZEi0cMu7cmROyZYbc8XLDry8Jpc=';
  const expectedAccountShape = expect.objectContaining({
    name: accounts.local.justTwoKeys.name,
    keys: expect.objectContaining({
      active: expect.any(String),
      activePubkey: expect.any(String),
      posting: expect.any(String),
      postingPubkey: expect.any(String),
    }),
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('getAccountsFromFileData cases:\n', () => {
    it('must return local accounts from a legacy export', async () => {
      const result = await BgdAccountsUtils.getAccountsFromFileData(
        legacyPayload,
        mk.user.one,
      );

      expect(result).toEqual(expect.arrayContaining([expectedAccountShape]));
    });

    it('must return local accounts from a v2 export', async () => {
      const encrypted = await EncryptUtils.encryptJson(
        { list: [accounts.local.justTwoKeys] },
        mk.user.one,
      );

      expect(
        await BgdAccountsUtils.getAccountsFromFileData(encrypted, mk.user.one),
      ).toEqual([accounts.local.justTwoKeys]);
    });

    it('must throw on malformed file data', async () => {
      await expect(
        BgdAccountsUtils.getAccountsFromFileData('', mk.user.one),
      ).rejects.toThrow();
    });
  });

  describe('getAccountsFromLocalStorage cases:\n', () => {
    it('must return local accounts', async () => {
      LocalStorageUtils.getValueFromLocalStorage = jest
        .fn()
        .mockResolvedValue(legacyPayload);
      const sGetValueFromLocalStorage = jest.spyOn(
        LocalStorageUtils,
        'getValueFromLocalStorage',
      );

      const result = await BgdAccountsUtils.getAccountsFromLocalStorage(
        mk.user.one,
      );

      expect(sGetValueFromLocalStorage).toBeCalledWith(
        LocalStorageKeyEnum.ACCOUNTS,
      );
      expect(result).toEqual(expect.arrayContaining([expectedAccountShape]));
    });

    it('migrates legacy local storage payloads to v2 after a successful decrypt', async () => {
      LocalStorageUtils.getValueFromLocalStorage = jest
        .fn()
        .mockResolvedValue(legacyPayload);
      const saveSpy = jest.spyOn(LocalStorageUtils, 'saveValueInLocalStorage');

      const result = await BgdAccountsUtils.getAccountsFromLocalStorage(
        mk.user.one,
      );

      expect(result).toEqual(expect.arrayContaining([expectedAccountShape]));
      expect(saveSpy).toHaveBeenCalledTimes(1);
      expect(saveSpy).toHaveBeenCalledWith(
        LocalStorageKeyEnum.ACCOUNTS,
        expect.any(String),
      );

      const migratedPayload = saveSpy.mock.calls[0][1];
      expect(EncryptUtils.isEncryptedJsonV2(migratedPayload)).toBe(true);
      expect(
        await EncryptUtils.decryptToJson(migratedPayload, mk.user.one),
      ).toEqual({ list: result });
    });

    it('awaits migration persistence before returning accounts', async () => {
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
      const resultPromise = BgdAccountsUtils.getAccountsFromLocalStorage(
        mk.user.one,
      ).then((result) => {
        settled = true;
        return result;
      });

      await saveCalled;
      expect(settled).toBe(false);

      resolveSave();

      expect(await resultPromise).toEqual(
        expect.arrayContaining([expectedAccountShape]),
      );
    });

    it('must return undefined when decrypting with the wrong password', async () => {
      LocalStorageUtils.getValueFromLocalStorage = jest
        .fn()
        .mockResolvedValue(legacyPayload);

      const result = await BgdAccountsUtils.getAccountsFromLocalStorage(
        'not_the_one',
      );

      expect(result).toBeUndefined();
    });
  });
});
