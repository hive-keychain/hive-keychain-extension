import { MultisigModule } from '@background/hive/modules/multisig.module';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const socket = {
  connected: false,
  connect: jest.fn(),
  on: jest.fn(),
  emit: jest.fn(),
  volatile: { emit: jest.fn() },
  removeAllListeners: jest.fn(),
  off: jest.fn(),
};

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => socket),
}));

describe('multisig message routing', () => {
  it('does not answer EVM transaction submission messages', async () => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue({});
    const addListenerSpy = jest.spyOn(
      chrome.runtime.onMessage,
      'addListener',
    );

    await MultisigModule.start();

    const sender = {
      id: chrome.runtime.id,
      url: chrome.runtime.getURL('popup.html'),
    } as chrome.runtime.MessageSender;
    const results = addListenerSpy.mock.calls.map(([listener]) =>
      listener(
        { command: BackgroundCommand.EVM_TRANSACTION_SUBMISSION },
        sender,
        jest.fn(),
      ),
    );

    expect(results).toEqual([false, false]);
  });
});
