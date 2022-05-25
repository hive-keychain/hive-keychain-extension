import KeychainApi from '@api/keychain';
import { Rpc } from '@interfaces/rpc.interface';
import { ActionType } from '@popup/actions/action-type.enum';
import { setActiveRpc } from '@popup/actions/active-rpc.actions';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
const chrome = require('chrome-mock');
global.chrome = chrome;
describe('active-rpc.actions tests:\n', () => {
  describe('setActiveRpc tests:\n', () => {
    test('Passing a rpc with custom uri, must set as new Client RPC, send a command to chrome.runtime and return a SET_ACTIVE_RPC action', () => {
      const rpc = {
        testnet: true,
        uri: 'https://apiBlog.users/',
      } as Rpc;
      const mockChromeRuntimeSendMessage = (chrome.runtime.sendMessage =
        jest.fn());
      expect(setActiveRpc(rpc)).toEqual({
        payload: rpc,
        type: ActionType.SET_ACTIVE_RPC,
      });
      expect(mockChromeRuntimeSendMessage).toBeCalledTimes(1);
      expect(mockChromeRuntimeSendMessage).toBeCalledWith({
        command: BackgroundCommand.SAVE_RPC,
        value: rpc,
      });
      mockChromeRuntimeSendMessage.mockReset();
      mockChromeRuntimeSendMessage.mockRestore();
    });
    test('Passing an rpc with "DEFAULT" uri, must set default from API(https://api.hive.blog) as new Client address, send a command to chrome.runtime and return a SET_ACTIVE_RPC action', () => {
      const rpc = {
        testnet: true,
        uri: 'DEFAULT',
      } as Rpc;
      const mockKeychainApiget = (KeychainApi.get = jest
        .fn()
        .mockResolvedValueOnce({ data: { rpc: 'https://api.hive.blog' } }));
      const mockChromeRuntimeSendMessage = (chrome.runtime.sendMessage =
        jest.fn());
      expect(setActiveRpc(rpc)).toEqual({
        payload: rpc,
        type: ActionType.SET_ACTIVE_RPC,
      });
      expect(mockKeychainApiget).toBeCalledTimes(1);
      expect(mockChromeRuntimeSendMessage).toBeCalledTimes(1);
      expect(mockChromeRuntimeSendMessage).toBeCalledWith({
        command: BackgroundCommand.SAVE_RPC,
        value: rpc,
      });
      mockChromeRuntimeSendMessage.mockReset();
      mockChromeRuntimeSendMessage.mockRestore();
      mockKeychainApiget.mockReset();
      mockKeychainApiget.mockRestore();
    });
  });
});
