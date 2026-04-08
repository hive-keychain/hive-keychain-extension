import { EvmEventName } from '@interfaces/evm-provider.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';

describe('evm-service-worker origin routing', () => {
  let handleMessage: (
    backgroundMessage: any,
    sender: chrome.runtime.MessageSender,
    sendResp: (response?: any) => void,
  ) => Promise<void>;

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();
    chrome.runtime.onMessage.addListener = jest.fn();
    chrome.tabs.query = jest.fn();
    chrome.tabs.sendMessage = jest.fn();

    await import('src/background/evm/evm-service-worker');

    const listener = (
      chrome.runtime.onMessage.addListener as jest.Mock
    ).mock.calls.at(
      -1,
    )?.[0];
    if (!listener) {
      throw new Error('Expected EVM service worker to register a message listener');
    }
    handleMessage = listener;
    chrome.tabs.sendMessage.mockResolvedValue(undefined);
  });

  it('routes domain-scoped events only to tabs on the same localhost origin', async () => {
    chrome.tabs.query.mockImplementation((_query, callback) =>
      callback([
        { id: 1, url: 'http://localhost:3000/' },
        { id: 2, url: 'http://localhost:5173/' },
      ] as chrome.tabs.Tab[]),
    );

    const event = {
      eventType: EvmEventName.ACCOUNT_CHANGED,
      args: ['0xaaa'],
      scope: { kind: 'domain', domain: 'http://localhost:3000' as const },
    };

    await handleMessage(
      {
        command: BackgroundCommand.SEND_EVM_EVENT,
        value: event,
      },
      {} as chrome.runtime.MessageSender,
      jest.fn(),
    );

    expect(chrome.tabs.sendMessage).toHaveBeenCalledTimes(1);
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, {
      command: BackgroundCommand.SEND_EVM_EVENT_TO_CONTENT_SCRIPT,
      value: event,
    });
  });

  it('routes domain-scoped events only to tabs on the same protocol', async () => {
    chrome.tabs.query.mockImplementation((_query, callback) =>
      callback([
        { id: 3, url: 'http://app.test/' },
        { id: 4, url: 'https://app.test/' },
      ] as chrome.tabs.Tab[]),
    );

    const event = {
      eventType: EvmEventName.CHAIN_CHANGED,
      args: '0x1',
      scope: { kind: 'domain', domain: 'https://app.test' as const },
    };

    await handleMessage(
      {
        command: BackgroundCommand.SEND_EVM_EVENT,
        value: event,
      },
      {} as chrome.runtime.MessageSender,
      jest.fn(),
    );

    expect(chrome.tabs.sendMessage).toHaveBeenCalledTimes(1);
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(4, {
      command: BackgroundCommand.SEND_EVM_EVENT_TO_CONTENT_SCRIPT,
      value: event,
    });
  });
});
