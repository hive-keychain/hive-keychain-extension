import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { EvmSubmissionClientUtils } from 'src/utils/evm/evm-submission-client.utils';

describe('EvmSubmissionClientUtils.send', () => {
  const originalContext = (global as { contextType?: string }).contextType;

  afterEach(() => {
    (global as { contextType?: string }).contextType = originalContext;
    jest.restoreAllMocks();
  });

  it('uses the runtime callback reply for a popup transfer reservation', async () => {
    (global as { contextType?: string }).contextType = 'popup';
    const reply = { success: true, result: { token: '0xtoken', nonce: 7 } };
    const sendMessage = jest
      .spyOn(chrome.runtime, 'sendMessage')
      .mockImplementation(((
        _message: unknown,
        callback?: (response: unknown) => void,
      ) => {
        callback?.(reply);
        return undefined;
      }) as typeof chrome.runtime.sendMessage);

    await expect(
      EvmSubmissionClientUtils.send({
        action: 'reserve',
        from: '0xabc',
        chainId: '0x1',
      }),
    ).resolves.toEqual(reply.result);
    expect(sendMessage).toHaveBeenCalledWith(
      {
        command: BackgroundCommand.EVM_TRANSACTION_SUBMISSION,
        value: { action: 'reserve', from: '0xabc', chainId: '0x1' },
      },
      expect.any(Function),
    );
  });

  it('reports an unavailable submission when the background sends no reply', async () => {
    (global as { contextType?: string }).contextType = 'popup';
    jest.spyOn(chrome.runtime, 'sendMessage').mockImplementation(((
      _message: unknown,
      callback?: (response: unknown) => void,
    ) => {
      callback?.(undefined);
      return undefined;
    }) as typeof chrome.runtime.sendMessage);

    await expect(
      EvmSubmissionClientUtils.send({ action: 'reconcile' }),
    ).rejects.toThrow('Transaction submission unavailable');
  });
});
