import {
  afterEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { performHiveOperation } from '@background/hive/requests/operations/perform-operation';
import * as DecodeMemoOps from '@background/hive/requests/operations/ops/decode-memo';
import * as DialogRequestUtils from '@background/multichain/dialog-request.utils';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { config } from 'hive-tx';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';
import { CommunicationUtils } from 'src/utils/communication.utils';
import * as PreferencesUtils from 'src/utils/preferences.utils';

describe('performHiveOperation current delivery flow', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('keeps dialog feedback on answerRequest while whitelisting confirmed requests', async () => {
    const requestHandler = new HiveRequestsHandler();
    const request = { ...keychainRequest.decodeData };
    const operationMessage = {
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        success: true,
        result: 'decoded-message',
        data: request,
        message: 'decoded-message',
        request_id: request.request_id,
      },
    };

    jest
      .spyOn(DecodeMemoOps, 'decodeMessage')
      .mockResolvedValue(operationMessage as any);
    const tabsSpy = jest
      .spyOn(CommunicationUtils, 'tabsSendMessage')
      .mockResolvedValue(undefined);
    const runtimeSpy = jest
      .spyOn(CommunicationUtils, 'runtimeSendMessage')
      .mockResolvedValue(undefined);
    const removeRequestSpy = jest
      .spyOn(requestHandler, 'removeRequestById')
      .mockResolvedValue(undefined);
    const reprocessPendingRequestsSpy = jest
      .spyOn(requestHandler, 'reprocessPendingRequests')
      .mockResolvedValue(undefined);
    const whitelistSpy = jest
      .spyOn(PreferencesUtils, 'addToWhitelist')
      .mockResolvedValue(undefined);
    jest
      .spyOn(DialogRequestUtils, 'getRequestHandlers')
      .mockResolvedValue({ hiveRequestHandler: requestHandler } as any);
    jest
      .spyOn(
        DialogRequestUtils,
        'willCloseDialogWindowAfterRemovingRequest',
      )
      .mockResolvedValue(false);

    await performHiveOperation(
      requestHandler,
      request,
      9,
      request.domain,
      true,
      'dialog',
    );

    expect(tabsSpy).toHaveBeenCalledWith(9, operationMessage, undefined);
    expect(runtimeSpy).toHaveBeenCalledWith(operationMessage);
    expect(runtimeSpy.mock.invocationCallOrder[0]).toBeLessThan(
      removeRequestSpy.mock.invocationCallOrder[0]!,
    );
    expect(removeRequestSpy).toHaveBeenCalledTimes(1);
    expect(removeRequestSpy).toHaveBeenCalledWith(request.request_id, 9);
    expect(whitelistSpy).toHaveBeenCalledWith(
      request.username!,
      request.domain,
      request.type,
    );
    expect(reprocessPendingRequestsSpy).toHaveBeenCalledTimes(1);
  });

  it('uses sendHiveResponse only for silent requests and still cleans up once', async () => {
    const requestHandler = new HiveRequestsHandler();
    const request = { ...keychainRequest.decodeData };
    const operationMessage = {
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        success: true,
        result: 'decoded-message',
        data: request,
        message: 'decoded-message',
        request_id: request.request_id,
      },
    };

    jest
      .spyOn(DecodeMemoOps, 'decodeMessage')
      .mockResolvedValue(operationMessage as any);
    const tabsSpy = jest
      .spyOn(CommunicationUtils, 'tabsSendMessage')
      .mockResolvedValue(undefined);
    const runtimeSpy = jest
      .spyOn(CommunicationUtils, 'runtimeSendMessage')
      .mockResolvedValue(undefined);
    const removeRequestSpy = jest
      .spyOn(requestHandler, 'removeRequestById')
      .mockResolvedValue(undefined);
    const reprocessPendingRequestsSpy = jest
      .spyOn(requestHandler, 'reprocessPendingRequests')
      .mockResolvedValue(undefined);
    const whitelistSpy = jest
      .spyOn(PreferencesUtils, 'addToWhitelist')
      .mockResolvedValue(undefined);

    await performHiveOperation(
      requestHandler,
      request,
      12,
      request.domain,
      true,
      'silent',
    );

    expect(tabsSpy).toHaveBeenCalledWith(
      12,
      expect.objectContaining({
        command: DialogCommand.SEND_HIVE_RESPONSE,
        msg: operationMessage.msg,
      }),
      undefined,
    );
    expect(runtimeSpy).not.toHaveBeenCalled();
    expect(removeRequestSpy).toHaveBeenCalledTimes(1);
    expect(removeRequestSpy).toHaveBeenCalledWith(request.request_id, 12);
    expect(whitelistSpy).toHaveBeenCalledWith(
      request.username!,
      request.domain,
      request.type,
    );
    expect(reprocessPendingRequestsSpy).not.toHaveBeenCalled();
    expect(operationMessage.command).toBe(DialogCommand.ANSWER_REQUEST);
  });

  it('sets the node from the matched locator and removes that entry only', async () => {
    const requestHandler = new HiveRequestsHandler();
    const request = { ...keychainRequest.decodeData };
    const matchedOrigin = 'https://dapp.example';
    const locator = {
      requestId: request.request_id,
      tab: 9,
      origin: matchedOrigin,
      frameId: 2,
      documentId: 'document-a',
    };
    await requestHandler.initFromLocalStorage(
      [
        {
          request_id: request.request_id,
          tab: 9,
          origin: 'https://other.example',
          domain: 'other.example',
          confirmed: false,
          isWaitingForConfirmation: false,
          rpc: { uri: 'https://other-rpc.example', testnet: false },
          request,
        },
        {
          request_id: request.request_id,
          tab: 9,
          origin: matchedOrigin,
          domain: 'dapp.example',
          confirmed: false,
          isWaitingForConfirmation: false,
          rpc: { uri: 'https://matched-rpc.example', testnet: false },
          request,
          source: {
            tab: 9,
            frameId: 2,
            documentId: 'document-a',
            origin: matchedOrigin,
          },
        },
      ],
      [],
      {} as any,
      { node: 'https://default.example' },
    );
    const operationMessage = {
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        success: true,
        result: 'decoded-message',
        data: request,
        message: 'decoded-message',
        request_id: request.request_id,
      },
    };

    const decodeSpy = jest
      .spyOn(DecodeMemoOps, 'decodeMessage')
      .mockResolvedValue(operationMessage as any);
    const tabsSpy = jest
      .spyOn(CommunicationUtils, 'tabsSendMessage')
      .mockResolvedValue(undefined);
    jest
      .spyOn(CommunicationUtils, 'runtimeSendMessage')
      .mockResolvedValue(undefined);
    const removeByIdSpy = jest
      .spyOn(requestHandler, 'removeRequestById')
      .mockResolvedValue(undefined);
    const removeByLocatorSpy = jest
      .spyOn(requestHandler, 'removeRequestByLocator')
      .mockResolvedValue(undefined);
    jest
      .spyOn(requestHandler, 'reprocessPendingRequests')
      .mockResolvedValue(undefined);
    jest.spyOn(PreferencesUtils, 'addToWhitelist').mockResolvedValue(undefined);
    jest
      .spyOn(DialogRequestUtils, 'getRequestHandlers')
      .mockResolvedValue({ hiveRequestHandler: requestHandler } as any);
    jest
      .spyOn(DialogRequestUtils, 'willCloseDialogWindowAfterRemovingRequest')
      .mockResolvedValue(false);

    await performHiveOperation(
      requestHandler,
      request,
      9,
      'dapp.example',
      true,
      'dialog',
      undefined,
      {
        tab: 9,
        frameId: 2,
        documentId: 'document-a',
        origin: matchedOrigin,
      },
    );

    expect(config.node).toBe('https://matched-rpc.example');
    expect(decodeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        requestsData: [
          expect.objectContaining({
            source: expect.objectContaining({ documentId: 'document-a' }),
          }),
        ],
      }),
      request,
    );
    expect(removeByLocatorSpy).toHaveBeenCalledWith(locator);
    expect(removeByIdSpy).not.toHaveBeenCalled();
    expect(tabsSpy).toHaveBeenCalledWith(9, operationMessage, {
      frameId: 2,
      documentId: 'document-a',
    });
  });
});
