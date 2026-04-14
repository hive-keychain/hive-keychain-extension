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
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
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

    await performHiveOperation(
      requestHandler,
      request,
      9,
      request.domain,
      true,
      'dialog',
    );

    expect(tabsSpy).toHaveBeenCalledWith(9, operationMessage);
    expect(runtimeSpy).toHaveBeenCalledWith(operationMessage);
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
});
