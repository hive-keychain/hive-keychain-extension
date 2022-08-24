import RPCModule from '@background/rpc.module';
import { Client } from '@hiveio/dhive';
import { Rpc } from '@interfaces/rpc.interface';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import rpcModuleMocks from 'src/__tests__/background/mocks/rpc.module.mocks';
describe('rpc.module tests:\n', () => {
  const { spies, methods, mocks } = rpcModuleMocks;
  methods.afterEach;
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
  it('Must get Client without override', async () => {
    mocks.getValueFromLocalStorage({
      customCurrentRpc: DefaultRpcs[2],
    });
    const client = await RPCModule.getClient();
    expect(client).toBeInstanceOf(Client);
    expect(client.address).toBe(DefaultRpcs[2].uri);
  });
  it('Must get overrided Client', async () => {
    mocks.fetch({
      rpc: 'https://saturnoman.com',
    });
    const client = await RPCModule.getClient({
      uri: 'DEFAULT',
    } as Rpc);
    expect(client.address).toBe('https://saturnoman.com');
  });
});
