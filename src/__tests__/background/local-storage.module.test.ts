import LocalStorageModule from '@background/local-storage.module';
import { Rpc } from '@interfaces/rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { CustomDataFromLocalStorage } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('local-storage.module tests:\n', () => {
  jest.setTimeout(10000); // Increase timeout for async tests
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('Must execute switch cases', async () => {
    let version = 2;
    let callCount = 0;
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockImplementation((...args: any[]) => {
        if (args[0] === LocalStorageKeyEnum.LOCAL_STORAGE_VERSION) {
          callCount++;
          // After first call, return updated version to prevent infinite recursion
          if (callCount > 1 && version >= 5) {
            return Promise.resolve(5);
          }
          return Promise.resolve(version);
        }
        return mocksImplementation.getValuefromLS(args[0], {
          customStorageVersion: version,
          customCurrentRpc: {
            uri: 'https://hived.privex.io/',
          } as Rpc,
        } as CustomDataFromLocalStorage);
      });
    const sSaveValueInLocalStorage = jest.spyOn(
      LocalStorageUtils,
      'saveValueInLocalStorage',
    ).mockImplementation((key, value) => {
      if (key === LocalStorageKeyEnum.LOCAL_STORAGE_VERSION) {
        version = value as number;
        // Once we reach version 5, stop recursion by keeping it at 5
        if (version >= 5) {
          version = 5;
        }
      }
      return Promise.resolve();
    });
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
      LocalStorageKeyEnum.LOCAL_STORAGE_VERSION,
      4,
    );
  });
});
