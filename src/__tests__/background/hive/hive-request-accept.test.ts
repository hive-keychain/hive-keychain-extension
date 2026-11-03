import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { VaultCommand } from '@reference-data/vault-message-key.enum';

jest.mock('@background/hive/requests/operations/perform-operation', () => ({
  performHiveOperation: jest.fn(),
}));

describe('ACCEPT_TRANSACTION stored request', () => {
  let performHiveOperationMock: jest.Mock;
  let HiveRequestsHandler: typeof import('@background/hive/requests/hive-request-handler').HiveRequestsHandler;
  let listener: (
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void,
  ) => unknown;

  const storedRequest = {
    request_id: 4,
    type: 'transfer',
    username: 'alice',
    memo: 'stored-memo',
    amount: '1.000',
    to: 'bob',
  };

  beforeAll(async () => {
    Object.defineProperty(chrome.runtime, 'id', {
      configurable: true,
      value: 'keychain-test-extension',
    });
    (chrome.runtime.getURL as jest.Mock).mockImplementation(
      (path: string) => `chrome-extension://keychain-test-extension/${path}`,
    );
    const listeners: Array<(...args: any[]) => unknown> = [];
    jest
      .spyOn(chrome.runtime.onMessage, 'addListener')
      .mockImplementation((addedListener) => {
        listeners.push(addedListener as (...args: any[]) => unknown);
      });

    const handlerModule = await import('@background/hive/requests/hive-request-handler');
    const performModule = await import(
      '@background/hive/requests/operations/perform-operation'
    );
    await import('@background/hive/hive-service-worker');

    HiveRequestsHandler = handlerModule.HiveRequestsHandler;
    performHiveOperationMock = performModule.performHiveOperation as jest.Mock;
    const hiveListener = listeners.find((addedListener) =>
      addedListener.toString().includes('isVaultRuntimeMessage'),
    );
    if (!hiveListener) {
      throw new Error('Hive message listener was not registered');
    }
    listener = hiveListener as typeof listener;
  });

  beforeEach(() => {
    performHiveOperationMock.mockClear();
  });

  const accept = (value: Record<string, unknown>) =>
    listener(
      {
        command: BackgroundCommand.ACCEPT_TRANSACTION,
        value,
      },
      {
        id: chrome.runtime.id,
        url: chrome.runtime.getURL('dialog.html'),
      } as chrome.runtime.MessageSender,
      jest.fn(),
    );

  it('signs the stored request when the dialog payload changes memo or amount', async () => {
    const handler = new HiveRequestsHandler();
    await handler.initFromLocalStorage(
      [
        {
          request_id: 4,
          tab: 7,
          domain: 'dapp.example',
          confirmed: false,
          isWaitingForConfirmation: false,
          request: storedRequest,
          accounts: [{ name: 'alice' }],
        },
      ],
      [{ name: 'alice' }] as any,
      {} as any,
      {},
    );
    jest
      .spyOn(HiveRequestsHandler, 'getFromLocalStorage')
      .mockResolvedValue(handler);

    await accept({
      keep: true,
      options: { metaData: '2fa' },
      tab: 7,
      data: {
        ...storedRequest,
        memo: 'evil-memo',
        amount: '999.000',
        to: 'attacker',
      },
    });

    expect(performHiveOperationMock).toHaveBeenCalledWith(
      handler,
      storedRequest,
      7,
      'dapp.example',
      true,
      'dialog',
      { metaData: '2fa' },
      { tab: 7, frameId: 0, origin: 'dapp.example' },
    );
  });

  it('rejects transaction approval from a content script', async () => {
    await listener(
      {
        command: BackgroundCommand.ACCEPT_TRANSACTION,
        value: {
          tab: 7,
          data: storedRequest,
        },
      },
      {
        id: chrome.runtime.id,
        url: 'https://malicious.example/',
      } as chrome.runtime.MessageSender,
      jest.fn(),
    );

    expect(performHiveOperationMock).not.toHaveBeenCalled();
  });

  it('does not perform an operation when the locator is missing or unknown', async () => {
    const handler = new HiveRequestsHandler();
    await handler.initFromLocalStorage(
      [
        {
          request_id: 4,
          tab: 7,
          domain: 'dapp.example',
          confirmed: false,
          isWaitingForConfirmation: false,
          request: storedRequest,
        },
      ],
      [],
      {} as any,
      {},
    );
    jest
      .spyOn(HiveRequestsHandler, 'getFromLocalStorage')
      .mockResolvedValue(handler);

    await accept({
      data: storedRequest,
    });
    await accept({
      tab: 7,
      data: { ...storedRequest, request_id: 99, memo: 'evil-memo' },
    });

    expect(performHiveOperationMock).not.toHaveBeenCalled();
  });

  it.each(Object.values(VaultCommand))(
    'does not answer Firefox vault %s messages',
    (command) => {
      const sendResponse = jest.fn();
      expect(
        listener(
          { command, key: '__MK' },
          {
            id: chrome.runtime.id,
            url: chrome.runtime.getURL('popup.html'),
          } as chrome.runtime.MessageSender,
          sendResponse,
        ),
      ).toBe(false);
      expect(sendResponse).not.toHaveBeenCalled();
    },
  );
});
