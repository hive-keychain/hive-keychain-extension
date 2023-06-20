import LedgerModule from '@background/ledger.module';
import { broadcastCustomJson } from '@background/requests/operations/ops/custom-json';
import { RequestsHandler } from '@background/requests/request-handler';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import {
  KeychainKeyTypes,
  KeychainKeyTypesLC,
  KeychainRequestTypes,
  RequestCustomJSON,
  RequestId,
} from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

describe('custom-json tests:\n', () => {
  const data = {
    domain: 'domain',
    username: mk.user.one,
    type: KeychainRequestTypes.custom,
    id: '1',
    json: JSON.stringify({
      command: 'send_tokens',
      amount: 1,
    }),
    display_msg: 'display_msg',
    method: KeychainKeyTypes.active,
    request_id: 1,
  } as RequestCustomJSON & RequestId;

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  beforeEach(() => {
    jest.spyOn(chrome.i18n, 'getUILanguage').mockReturnValueOnce('en-US');
    chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom);
  });

  describe('Default cases:\n', () => {
    it('Must call getUserKey if no key on handler', async () => {
      const requestHandler = new RequestsHandler();
      const sGetUserKeyPair = jest.spyOn(requestHandler, 'getUserKeyPair');
      await broadcastCustomJson(requestHandler, data);
      expect(sGetUserKeyPair).toBeCalledWith(
        data.username!,
        data.method.toLowerCase() as KeychainKeyTypesLC,
      );
    });

    it('Must return success', async () => {
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
        id: 'id',
        confirmed: true,
        tx_id: 'tx_id',
      } as TransactionResult);
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const result = await broadcastCustomJson(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: true,
          error: undefined,
          result: {
            id: 'id',
            confirmed: true,
            tx_id: 'tx_id',
          },
          data: datas,
          message: chrome.i18n.getMessage('bgd_ops_broadcast'),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });
  });

  describe('Using Ledger cases:\n', () => {
    it('Must return success', async () => {
      jest
        .spyOn(LedgerModule, 'getSignatureFromLedger')
        .mockResolvedValueOnce('signed!');
      jest
        .spyOn(HiveTxUtils, 'broadcastAndConfirmTransactionWithSignature')
        .mockResolvedValue({
          id: 'id',
          confirmed: true,
          tx_id: 'tx_id',
        } as TransactionResult);
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = '#ledgerKEY1234';
      const result = await broadcastCustomJson(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: true,
          error: undefined,
          result: {
            id: 'id',
            confirmed: true,
            tx_id: 'tx_id',
          },
          data: datas,
          message: chrome.i18n.getMessage('bgd_ops_broadcast'),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });
  });
});
