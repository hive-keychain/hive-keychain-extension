import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('localStorage.utils tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('getValueFromLocalStorage resolves the value for the requested key', async () => {
    jest.spyOn(chrome.storage.local, 'get').mockImplementation((keys: any, cb: any) => {
      cb({ [LocalStorageKeyEnum.CURRENT_RPC]: { uri: 'https://node' } });
    });

    await expect(
      LocalStorageUtils.getValueFromLocalStorage(LocalStorageKeyEnum.CURRENT_RPC),
    ).resolves.toEqual({ uri: 'https://node' });
  });

  it('getMultipleValueFromLocalStorage resolves the full result object', async () => {
    jest.spyOn(chrome.storage.local, 'get').mockImplementation((keys: any, cb: any) => {
      cb({
        [LocalStorageKeyEnum.CURRENT_RPC]: { uri: 'a' },
        [LocalStorageKeyEnum.HIDDEN_TOKENS]: ['X'],
      });
    });

    await expect(
      LocalStorageUtils.getMultipleValueFromLocalStorage([
        LocalStorageKeyEnum.CURRENT_RPC,
        LocalStorageKeyEnum.HIDDEN_TOKENS,
      ]),
    ).resolves.toEqual({
      [LocalStorageKeyEnum.CURRENT_RPC]: { uri: 'a' },
      [LocalStorageKeyEnum.HIDDEN_TOKENS]: ['X'],
    });
  });

  it('removeFromLocalStorage delegates to chrome.storage.local.remove', () => {
    const remove = jest.spyOn(chrome.storage.local, 'remove').mockImplementation();

    LocalStorageUtils.removeFromLocalStorage(LocalStorageKeyEnum.HIDDEN_TOKENS);

    expect(remove).toHaveBeenCalledWith(LocalStorageKeyEnum.HIDDEN_TOKENS);
  });

  it('clearLocalStorage delegates to chrome.storage.local.clear', () => {
    const clear = jest.spyOn(chrome.storage.local, 'clear').mockImplementation();

    LocalStorageUtils.clearLocalStorage();

    expect(clear).toHaveBeenCalledTimes(1);
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
