import LedgerModule from '@background/ledger.module';
import { convert } from '@background/requests/operations/ops/convert';
import { RequestsHandler } from '@background/requests/request-handler';
import { HiveTxUtils } from '@hiveapp/utils/hive-tx.utils';
import { ConversionUtils } from '@popup/hive/utils/conversion.utils';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import {
  KeychainRequestTypes,
  RequestConvert,
  RequestId,
} from 'hive-keychain-commons';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

describe('convert tests:\n', () => {
  const requestHandler = new RequestsHandler();
  const data = {
    type: KeychainRequestTypes.convert,
    amount: '0.100',
    collaterized: false,
    domain: 'domain',
    username: mk.user.one,
    request_id: 1,
  } as RequestConvert & RequestId;

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  beforeEach(() => {
    requestHandler.data.rpc = DefaultRpcs[0];
    jest.spyOn(chrome.i18n, 'getUILanguage').mockReturnValueOnce('en-US');
    chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom);
    // Mock ConversionUtils.getConversionRequests to return empty array for requestId calculation
    jest
      .spyOn(ConversionUtils, 'getConversionRequests')
      .mockResolvedValue([]);
  });

  describe('Default cases:\n', () => {
    it('Must return error if undefined key on handler', async () => {
      const result = await convert(requestHandler, data);
      const { request_id, ...datas } = data;
      // Error may occur at different stages (account lookup, signing, etc.)
      expect(result.command).toBe(DialogCommand.ANSWER_REQUEST);
      expect(result.msg.success).toBe(false);
      expect(result.msg.error).toBeDefined();
      expect(result.msg.result).toBeUndefined();
      expect(result.msg.data).toEqual(datas);
      expect(result.msg.message).toBeDefined();
      expect(result.msg.request_id).toBe(request_id);
      expect(result.msg.publicKey).toBeUndefined();
    });

    it('Must return success with a non collateralized convertion', async () => {
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.active,
        userData.one.encryptKeys.active,
      );
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
        id: 'id',
        confirmed: true,
        tx_id: 'tx_id',
      } as TransactionResult);
      const result = await convert(requestHandler, data);
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
          message: chrome.i18n.getMessage('bgd_ops_convert', [
            data.amount,
            data.username,
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });

    it('Must return success with a collateralized convertion', async () => {
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.active,
        userData.one.encryptKeys.active,
      );
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
        id: 'id',
        confirmed: true,
        tx_id: 'tx_id',
      } as TransactionResult);
      data.collaterized = true;
      const result = await convert(requestHandler, data);
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
          message: chrome.i18n.getMessage('bgd_ops_convert_collaterized', [
            data.amount,
            data.username,
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });
  });

  describe('Using ledger cases:\n', () => {
    it('Must return success with a non collateralized convertion', async () => {
      // Ensure collaterized is false for this test
      const testData = { ...data, collaterized: false };
      // Mock getConversionRequests for requestId calculation
      jest
        .spyOn(ConversionUtils, 'getConversionRequests')
        .mockResolvedValue([]);
      const mockTransaction = {
        expiration: '10/10/2023',
        extensions: [],
        operations: [],
        ref_block_num: 0,
        ref_block_prefix: 0,
      };
      jest
        .spyOn(ConversionUtils, 'getConvertTransaction')
        .mockResolvedValueOnce(mockTransaction as any);
      jest
        .spyOn(LedgerModule, 'signTransactionFromLedger')
        .mockImplementation(() => {});
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
      requestHandler.setKeys('#ledgerKey1234', userData.one.encryptKeys.active);
      const result = await convert(requestHandler, testData);
      const { request_id, ...datas } = testData;
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
          message: chrome.i18n.getMessage('bgd_ops_convert', [
            testData.amount,
            testData.username!,
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });
  });
});
