import KeychainApi from '@api/keychain';
import RPCModule from '@background/rpc.module';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { config as HiveTxConfig } from 'hive-tx';
import rpcModuleMocks from 'src/__tests__/background/mocks/rpc.module.mocks';
describe('rpc.module tests:\n', () => {
  const { spies, methods, mocks } = rpcModuleMocks;
  methods.afterEach;
  methods.afterAll;
  it('Must set active Rpc', async () => {
    await RPCModule.setActiveRpc(DefaultRpcs[0]);
    expect(spies.saveValueInLocalStorage).toBeCalledWith(
      LocalStorageKeyEnum.CURRENT_RPC,
      DefaultRpcs[0],
    );
  });
  it('Must get active Rpc', async () => {
    mocks.getValueFromLocalStorage({
      customCurrentRpc: DefaultRpcs[1],
    });
    expect(await RPCModule.getActiveRpc()).toEqual(DefaultRpcs[1]);
    expect(spies.getValueFromLocalStorage()).toBeCalledWith(
      LocalStorageKeyEnum.CURRENT_RPC,
    );
  });

  it('Must set default uri & chainId', async () => {
    RPCModule.getActiveRpc = jest
      .fn()
      .mockResolvedValue({ uri: 'DEFAULT', chainId: '1' });
    KeychainApi.get = jest.fn().mockResolvedValue({
      data: {
        rpc: {
          uri: 'https://default',
        },
      },
    });
    await RPCModule.init();
    expect(HiveTxConfig.node).toEqual({ uri: 'https://default' });
    expect(HiveTxConfig.chain_id).toBe('1');
  });
  it('Must set uri', async () => {
    RPCModule.getActiveRpc = jest
      .fn()
      .mockResolvedValue({ uri: 'https://saturnoman' });
    await RPCModule.init();
    expect(HiveTxConfig.node).toEqual('https://saturnoman');
  });
});
