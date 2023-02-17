import { KeyType } from '@interfaces/keys.interface';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import { config as HiveTxConfig } from 'hive-tx';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import hiveTxUtilsMocks from 'src/__tests__/utils/mocks/hive-tx.utils-mocks';
describe('hive-tx.utils.ts tests:\n', () => {
  const { mocks, methods, spies, constants } = hiveTxUtilsMocks;
  methods.afterAll;
  describe('setRpc cases:\n', () => {
    it('Must set Rpc from KeychainApi', async () => {
      mocks.keychainApi.get({ data: { rpc: DefaultRpcs[1].uri } });
      await HiveTxUtils.setRpc({ uri: 'DEFAULT', testnet: false });
      expect(HiveTxConfig.node).toEqual(DefaultRpcs[1].uri);
    });

    it('Must set Rpc', async () => {
      await HiveTxUtils.setRpc({ ...DefaultRpcs[2], chainId: 'chain_Id' });
      expect(HiveTxConfig.node).toEqual(DefaultRpcs[2].uri);
    });
  });

  describe('sendOperation cases:\n', () => {
    it('Must call confirmTransaction', async () => {
      mocks.createSignAndBroadcastTransaction('1234');
      expect(
        await HiveTxUtils.sendOperation(constants.operations, KeyType.ACTIVE),
      ).toBe(true);
      expect(spies.confirmTransaction).toBeCalledWith('1234');
    });

    it('Must return false', async () => {
      mocks.createSignAndBroadcastTransaction(undefined);
      expect(
        await HiveTxUtils.sendOperation(constants.operations, KeyType.ACTIVE),
      ).toBe(false);
    });
  });
});
