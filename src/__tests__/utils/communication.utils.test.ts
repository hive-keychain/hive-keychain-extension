import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { CommunicationUtils } from 'src/utils/communication.utils';

describe('CommunicationUtils.sendRuntimeMessageForResponse', () => {
  const message = {
    command: BackgroundCommand.EVM_TRANSACTION_SUBMISSION,
    value: { action: 'reserve', from: '0xabc', chainId: '0x1' },
  };

  afterEach(() => {
    delete (chrome.runtime as { lastError?: chrome.runtime.LastError })
      .lastError;
    jest.restoreAllMocks();
  });

  it('resolves the callback reply when sendMessage returns undefined', async () => {
    const reply = { success: true, result: { token: '0xtoken', nonce: 4 } };
    jest.spyOn(chrome.runtime, 'sendMessage').mockImplementation(((
      _message: unknown,
      callback?: (response: unknown) => void,
    ) => {
      callback?.(reply);
      return undefined;
    }) as typeof chrome.runtime.sendMessage);

    await expect(
      CommunicationUtils.sendRuntimeMessageForResponse(message),
    ).resolves.toEqual(reply);
  });

  it('resolves a promise reply from sendMessage', async () => {
    const reply = { success: true, result: { token: '0xtoken', nonce: 5 } };
    jest.spyOn(chrome.runtime, 'sendMessage').mockResolvedValue(reply);

    await expect(
      CommunicationUtils.sendRuntimeMessageForResponse(message),
    ).resolves.toEqual(reply);
  });

  it('rejects when the runtime reports an error in the callback', async () => {
    jest.spyOn(chrome.runtime, 'sendMessage').mockImplementation(((
      _message: unknown,
      callback?: (response: unknown) => void,
    ) => {
      Object.defineProperty(chrome.runtime, 'lastError', {
        configurable: true,
        value: { message: 'Could not establish connection' },
      });
      callback?.(undefined);
      return undefined;
    }) as typeof chrome.runtime.sendMessage);

    await expect(
      CommunicationUtils.sendRuntimeMessageForResponse(message),
    ).rejects.toThrow('Could not establish connection');
  });
});
