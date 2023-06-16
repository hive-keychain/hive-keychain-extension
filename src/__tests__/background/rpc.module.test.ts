import { KeychainApi } from '@api/keychain';
import RPCModule from '@background/rpc.module';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { config as HiveTxConfig } from 'hive-tx';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { CustomDataFromLocalStorage } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('rpc.module tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('Must set active Rpc', async () => {
    const sSaveValueInLocalStorage = jest.spyOn(
      LocalStorageUtils,
      'saveValueInLocalStorage',
    );
    await RPCModule.setActiveRpc(DefaultRpcs[0]);
    expect(sSaveValueInLocalStorage).toBeCalledWith(
      LocalStorageKeyEnum.CURRENT_RPC,
      DefaultRpcs[0],
    );
  });

  it('Must get active Rpc', async () => {
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockImplementation((...args: any[]) =>
        mocksImplementation.getValuefromLS(args[0], {
          customCurrentRpc: DefaultRpcs[1],
        } as CustomDataFromLocalStorage),
      );
    const sGetValueFromLocalStorage = jest.spyOn(
      LocalStorageUtils,
      'getValueFromLocalStorage',
    );

    expect(await RPCModule.getActiveRpc()).toEqual(DefaultRpcs[1]);
    expect(sGetValueFromLocalStorage).toBeCalledWith(
      LocalStorageKeyEnum.CURRENT_RPC,
    );
  });

  it('Must set default uri & chainId', async () => {
    RPCModule.getActiveRpc = jest
      .fn()
      .mockResolvedValue({ uri: 'DEFAULT', chainId: '1' });
    KeychainApi.get = jest.fn().mockResolvedValue({
      rpc: {
        uri: 'https://default',
      },
    });
    await RPCModule.init();
    expect(HiveTxConfig.node).toEqual({ uri: 'https://default' });
  });

  it('Must set uri', async () => {
    RPCModule.getActiveRpc = jest
      .fn()
      .mockResolvedValue({ uri: 'https://saturnoman' });
    await RPCModule.init();
    expect(HiveTxConfig.node).toEqual('https://saturnoman');
  });
});
