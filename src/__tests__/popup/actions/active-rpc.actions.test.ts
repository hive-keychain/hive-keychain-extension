import { KeychainApi } from '@api/keychain';
import { Rpc } from '@interfaces/rpc.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import { setActiveRpc } from 'src/popup/hive/actions/active-rpc.actions';

describe('active-rpc.actions tests:\n', () => {
  afterAll(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  describe('setActiveRpc tests:\n', () => {
    test('Must sendMessage to runtime and set rpc', async () => {
      const rpc = {
        testnet: true,
        uri: 'https://apiBlog.users/',
      } as Rpc;
      const mockChromeRuntimeSendMessage = (chrome.runtime.sendMessage =
        jest.fn());
      const fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(setActiveRpc(rpc));
      expect(fakeStore.getState().activeRpc).toEqual(rpc);
      expect(mockChromeRuntimeSendMessage).toBeCalledTimes(1);
      expect(mockChromeRuntimeSendMessage).toBeCalledWith({
        command: BackgroundCommand.SAVE_RPC,
        value: rpc,
      });
      mockChromeRuntimeSendMessage.mockReset();
      mockChromeRuntimeSendMessage.mockRestore();
    });
    test('With "DEFAULT" uri, must set default rpc and sendMessage to runtime', async () => {
      const rpc = {
        testnet: true,
        uri: 'DEFAULT',
      } as Rpc;
      const defaultRpc = {
        testnet: false,
        uri: 'https://api.hive.blog',
      };
      KeychainApi.get = jest
        .fn()
        .mockResolvedValueOnce({ data: { rpc: defaultRpc } });
      const mockChromeRuntimeSendMessage = (chrome.runtime.sendMessage =
        jest.fn());
      const fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(setActiveRpc(rpc));
      expect(fakeStore.getState().activeRpc).toEqual(rpc);
      expect(mockChromeRuntimeSendMessage).toBeCalledTimes(1);
      expect(mockChromeRuntimeSendMessage).toBeCalledWith({
        command: BackgroundCommand.SAVE_RPC,
        value: rpc,
      });
      mockChromeRuntimeSendMessage.mockReset();
      mockChromeRuntimeSendMessage.mockRestore();
      jest.clearAllMocks();
    });
  });
});
