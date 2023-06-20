import LedgerModule from '@background/ledger.module';
import { recurrentTransfer } from '@background/requests/operations/ops/recurrent-transfer';
import { RequestsHandler } from '@background/requests/request-handler';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import {
  KeychainRequestTypes,
  RequestId,
  RequestRecurrentTransfer,
} from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { KeychainError } from 'src/keychain-error';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

describe('recurrent-transfer tests:\n', () => {
  const data = {
    domain: 'domain',
    type: KeychainRequestTypes.recurrentTransfer,
    username: mk.user.one,
    to: 'theghost1980',
    amount: '1000',
    currency: 'hbd',
    memo: '',
    recurrence: 1,
    executions: 1,
  } as RequestRecurrentTransfer & RequestId;

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

  describe('Without encrypted memo:\n', () => {
    it('Must return error if no key on handler', async () => {
      const requestHandler = new RequestsHandler();
      const result = await recurrentTransfer(requestHandler, data);
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

    it('Must return sucess on start recurrent', async () => {
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
        id: 'id',
        confirmed: true,
        tx_id: 'tx_id',
      } as TransactionResult);
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const result = await recurrentTransfer(requestHandler, data);
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
          message: chrome.i18n.getMessage('bgd_ops_recurrent_transfer'),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });

    it('Must return sucess on start recurrent, using ledger', async () => {
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
        id: 'id',
        confirmed: true,
        tx_id: 'tx_id',
      } as TransactionResult);
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
      const result = await recurrentTransfer(requestHandler, data);
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
          message: chrome.i18n.getMessage('bgd_ops_recurrent_transfer'),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });

    it('Must return sucess on stop recurrent', async () => {
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
        id: 'id',
        confirmed: true,
        tx_id: 'tx_id',
      } as TransactionResult);
      const requestHandler = new RequestsHandler();
      data.amount = '0';
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const result = await recurrentTransfer(requestHandler, data);
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
          message: chrome.i18n.getMessage('bgd_ops_stop_recurrent_transfer'),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });
  });

  describe('With encrypted memo', () => {
    it('Must return error if no private memo key', async () => {
      const localeMessageKey = 'bgd_ops_encode_err';
      data.memo = '# To encrypt!';
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const result = await recurrentTransfer(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error: new KeychainError(localeMessageKey),
          result: undefined,
          data: datas,
          message: chrome.i18n.getMessage(localeMessageKey),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });
  });
});
