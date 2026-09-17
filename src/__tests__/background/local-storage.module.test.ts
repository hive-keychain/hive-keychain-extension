import LocalStorageModule from '@background/local-storage.module';
import MkModule from '@background/mk.module';
import BgdAccountsUtils from '@background/utils/accounts.utils';
import { Rpc } from '@interfaces/rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { CustomDataFromLocalStorage } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';
import EncryptedLocalStorageUtils from 'src/utils/encrypted-local-storage.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('local-storage.module tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('Must execute switch cases', async () => {
    jest.spyOn(MkModule, 'getMk').mockResolvedValue(mk.user.one);
    jest
      .spyOn(BgdAccountsUtils, 'getAccountsFromLocalStorage')
      .mockResolvedValue([]);
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockImplementation((...args: any[]) =>
        mocksImplementation.getValuefromLS(args[0], {
          customStorageVersion: 2,
          customCurrentRpc: {
            uri: 'https://hived.privex.io/',
          } as Rpc,
        } as CustomDataFromLocalStorage),
      );
    const sSaveValueInLocalStorage = jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockResolvedValue(undefined);
    jest
      .spyOn(EncryptedLocalStorageUtils, 'migrateIdentitySettings')
      .mockResolvedValue(undefined);
    await LocalStorageModule.checkAndUpdateLocalStorage();
    expect(sSaveValueInLocalStorage).toHaveBeenNthCalledWith(
      1,
      LocalStorageKeyEnum.CURRENT_RPC,
      {
        testnet: false,
        uri: 'https://api.hive.blog',
      },
    );
    expect(sSaveValueInLocalStorage).toHaveBeenNthCalledWith(
      2,
      LocalStorageKeyEnum.LOCAL_STORAGE_VERSION,
      3,
    );
    expect(sSaveValueInLocalStorage).toHaveBeenNthCalledWith(
      3,
      LocalStorageKeyEnum.FAVORITE_USERS,
      {
        'keychain.tests': [
          { label: 'one1', subLabel: '' },
          { label: 'two2', subLabel: '' },
          { label: 'three3', subLabel: '' },
        ],
      },
    );
    expect(sSaveValueInLocalStorage).toHaveBeenNthCalledWith(
      4,
      LocalStorageKeyEnum.LOCAL_STORAGE_VERSION,
      4,
    );
  });

  it('does not bump to version 7 when mk is missing', async () => {
    jest.spyOn(MkModule, 'getMk').mockResolvedValue(undefined as any);
    const migrateSpy = jest
      .spyOn(EncryptedLocalStorageUtils, 'migrateIdentitySettings')
      .mockResolvedValue(undefined);
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(6);
    const saveSpy = jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockResolvedValue(undefined);

    await LocalStorageModule.checkAndUpdateLocalStorage();

    expect(migrateSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalledWith(
      LocalStorageKeyEnum.LOCAL_STORAGE_VERSION,
      7,
    );
  });

  it('migrates identity settings and writes version 7 when mk is present', async () => {
    jest.spyOn(MkModule, 'getMk').mockResolvedValue(mk.user.one);
    const migrateSpy = jest
      .spyOn(EncryptedLocalStorageUtils, 'migrateIdentitySettings')
      .mockResolvedValue(undefined);
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(6);
    const saveSpy = jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockResolvedValue(undefined);

    await LocalStorageModule.checkAndUpdateLocalStorage();

    expect(migrateSpy).toHaveBeenCalledWith(mk.user.one);
    expect(saveSpy).toHaveBeenCalledWith(
      LocalStorageKeyEnum.LOCAL_STORAGE_VERSION,
      7,
    );
  });

  it('re-migrates leftover plaintext identity settings when already at version 7', async () => {
    jest.spyOn(MkModule, 'getMk').mockResolvedValue(mk.user.one);
    const migrateSpy = jest
      .spyOn(EncryptedLocalStorageUtils, 'migrateIdentitySettings')
      .mockResolvedValue(undefined);
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(7);
    const saveSpy = jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockResolvedValue(undefined);

    await LocalStorageModule.checkAndUpdateLocalStorage();

    expect(migrateSpy).toHaveBeenCalledWith(mk.user.one);
    expect(saveSpy).not.toHaveBeenCalledWith(
      LocalStorageKeyEnum.LOCAL_STORAGE_VERSION,
      expect.anything(),
    );
  });

  it('does not migrate when already at version 7 and mk is missing', async () => {
    jest.spyOn(MkModule, 'getMk').mockResolvedValue(undefined as any);
    const migrateSpy = jest
      .spyOn(EncryptedLocalStorageUtils, 'migrateIdentitySettings')
      .mockResolvedValue(undefined);
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue(7);

    await LocalStorageModule.checkAndUpdateLocalStorage();

    expect(migrateSpy).not.toHaveBeenCalled();
  });
});
