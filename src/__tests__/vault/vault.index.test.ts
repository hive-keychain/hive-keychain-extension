import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { VaultCommand } from '@reference-data/vault-message-key.enum';
import Config from 'src/config';

describe('vault index', () => {
  const originalConnect = chrome.runtime.connect;

  afterEach(() => {
    jest.resetModules();
    chrome.runtime.connect = originalConnect;
    jest.restoreAllMocks();
  });

  it('notifies background on load and handles vault port messages', () => {
    const addListener = jest.spyOn(chrome.runtime.onConnect, 'addListener');
    const sendMessage = jest.spyOn(chrome.runtime, 'sendMessage');

    require('src/vault/index');

    expect(sendMessage).toHaveBeenCalledWith({
      command: BackgroundCommand.VAULT_LOADED,
    });
    expect(addListener).toHaveBeenCalled();

    const portHandler = addListener.mock.calls[0][0] as (port: any) => void;
    const postMessage = jest.fn();
    const messageListeners: Array<(msg: any) => void> = [];
    const port = {
      name: Config.vault.portName,
      onMessage: {
        addListener: (fn: (msg: any) => void) => messageListeners.push(fn),
      },
      postMessage,
    };

    portHandler(port);

    messageListeners[0]({ command: VaultCommand.GET_VALUE, key: 'k' });
    expect(postMessage).toHaveBeenCalledWith(undefined);

    messageListeners[0]({ command: VaultCommand.SET_VALUE, key: 'k', value: 42 });
    expect(postMessage).toHaveBeenCalledWith(true);

    messageListeners[0]({ command: VaultCommand.REMOVE_VALUE, key: 'k' });
    expect(postMessage).toHaveBeenCalledWith(true);
  });

  it('ignores non-vault connections', () => {
    jest.resetModules();
    const addListener = jest.spyOn(chrome.runtime.onConnect, 'addListener');
    require('src/vault/index');

    const portHandler = addListener.mock.calls[0][0] as (port: any) => void;
    const postMessage = jest.fn();
    const messageListeners: Array<(msg: any) => void> = [];
    const port = {
      name: 'other-port',
      onMessage: {
        addListener: (fn: (msg: any) => void) => messageListeners.push(fn),
      },
      postMessage,
    };

    portHandler(port);
    expect(messageListeners.length).toBe(0);
  });
});
