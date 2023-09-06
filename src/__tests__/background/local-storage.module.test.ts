import LocalStorageModule from '@background/local-storage.module';
import { Rpc } from '@interfaces/rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { CustomDataFromLocalStorage } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('local-storage.module tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('Must execute switch cases', async () => {
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
    const sSaveValueInLocalStorage = jest.spyOn(
      LocalStorageUtils,
      'saveValueInLocalStorage',
    );
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
