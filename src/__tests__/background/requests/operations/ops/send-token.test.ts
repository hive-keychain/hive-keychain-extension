import LedgerModule from '@background/ledger.module';
import { broadcastSendToken } from '@background/requests/operations/ops/send-token';
import { RequestsHandler } from '@background/requests/request-handler';
import { HiveTxUtils } from '@hiveapp/utils/hive-tx.utils';
import TokensUtils from '@hiveapp/utils/tokens.utils';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import { HiveEngineTransactionStatus } from '@interfaces/transaction-status.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import {
  KeychainRequestTypes,
  RequestId,
  RequestSendToken,
} from 'hive-keychain-commons';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

describe('send-token tests:\n', () => {
  const data = {
    domain: 'domain',
    type: KeychainRequestTypes.sendToken,
    username: mk.user.one,
    to: 'theghost1980',
    amount: '1000',
    memo: 'The Quan',
    currency: 'LEO',
    request_id: 1,
  } as RequestSendToken & RequestId;

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

  describe('default cases:\n', () => {
    it('Must return error if no key on handler', async () => {
      const requestHandler = new RequestsHandler();
      const result = await broadcastSendToken(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error: new Error('html_popup_error_while_signing_transaction'),
          result: undefined,
          data: datas,
          message: chrome.i18n.getMessage(
            'html_popup_error_while_signing_transaction',
          ),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });

    it('Must return success', async () => {
      jest.spyOn(TokensUtils, 'sendToken').mockResolvedValueOnce({
        broadcasted: true,
        confirmed: true,
        tx_id: 'tx_id',
      } as HiveEngineTransactionStatus);
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const result = await broadcastSendToken(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: true,
          error: undefined,
          result: {
            broadcasted: true,
            confirmed: true,
            tx_id: 'tx_id',
          },
          data: datas,
          message: chrome.i18n.getMessage('bgd_ops_tokens'),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });
  });

  describe('Using ledger cases:\n', () => {
    it('Must return success', async () => {
      jest
        .spyOn(LedgerModule, 'getSignatureFromLedger')
        .mockResolvedValueOnce('signed!');
      jest
        .spyOn(HiveTxUtils, 'broadcastAndConfirmTransactionWithSignature')
        .mockResolvedValue({
          tx_id: 'tx_id',
          id: 'id',
          confirmed: true,
        } as TransactionResult);
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = '#ledger1234';
      const result = await broadcastSendToken(requestHandler, data);
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
          message: chrome.i18n.getMessage('bgd_ops_tokens'),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });
  });
});
