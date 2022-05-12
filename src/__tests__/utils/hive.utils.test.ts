import KeychainApi from '@api/keychain';
import { Client, ExtendedAccount } from '@hiveio/dhive';
import { Rpc } from '@interfaces/rpc.interface';
import HiveUtils from 'src/utils/hive.utils';

async function resetClient() {
  await HiveUtils.setRpc({ uri: 'https://api.hive.blog' } as Rpc);
}
describe('hive.utils tests:\n', () => {
  describe('getClient tests:\n', () => {
    test('calling getclient must return an instance of Client', () => {
      const getClientObj = HiveUtils.getClient();
      expect(getClientObj instanceof Client).toBe(true);
      expect(getClientObj.address).toBeDefined();
    });
  });
  describe('setRpc tests:\n', () => {
    afterEach(() => {
      jest.clearAllMocks();
      resetClient(); //reset client if needed as default later on
    });
    test('Passing uri as "DEFAULT" will set the uri of the Client class as the return value from KeychainApi.get', async () => {
      const returnedUriValue = 'https://ValueFromHive/rpc/api';
      KeychainApi.get = jest
        .fn()
        .mockResolvedValueOnce({ data: { rpc: returnedUriValue } });
      const fakeRpc: Rpc = {
        uri: 'DEFAULT',
        testnet: true,
      };
      expect(HiveUtils.getClient().address).toBe('https://api.hive.blog');
      const result = await HiveUtils.setRpc(fakeRpc);
      expect(result).toBeUndefined();
      expect(HiveUtils.getClient().address).toBe(returnedUriValue);
    });

    test('Passing uri different from "DEFAULT" will override the uri value on the Client Class', async () => {
      const overridingValue = 'https://overridingValue/rpc/api';
      const fakeRpc: Rpc = {
        uri: overridingValue,
        testnet: true,
      };
      expect(HiveUtils.getClient().address).toBe('https://api.hive.blog');
      const result = await HiveUtils.setRpc(fakeRpc);
      expect(result).toBeUndefined();
      expect(HiveUtils.getClient().address).toBe(overridingValue);
    });
  });

  describe('getVP tests:\n', () => {
    test('Passing an ExtendedAccount Obj with no account property must return null', () => {
      const fakeExtended = {} as ExtendedAccount;
      const result = HiveUtils.getVP(fakeExtended);
      expect(result).toBeNull();
    });
  });
});
