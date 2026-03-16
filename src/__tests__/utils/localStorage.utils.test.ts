import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('localStorage.utils tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('Must call chrome.storage.local.set with the storage area context', async () => {
    const setSpy = jest
      .spyOn(chrome.storage.local, 'set')
      .mockImplementation(function (
        this: typeof chrome.storage.local,
        items: { [key: string]: unknown },
        callback?: () => void,
      ) {
        expect(this).toBe(chrome.storage.local);
        expect(items).toEqual({
          [LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED]: true,
        });
        callback?.();
      });

    await expect(
      LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED,
        true,
      ),
    ).resolves.toBeUndefined();

    expect(setSpy).toHaveBeenCalledTimes(1);
  });
});
