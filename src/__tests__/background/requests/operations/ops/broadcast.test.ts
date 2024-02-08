import LedgerModule from '@background/ledger.module';
import { broadcastOperations } from '@background/requests/operations/ops/broadcast';
import { RequestsHandler } from '@background/requests/request-handler';
import AccountUtils from '@hiveapp/utils/account.utils';
import { HiveTxUtils } from '@hiveapp/utils/hive-tx.utils';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import {
  KeychainKeyTypes,
  KeychainRequestTypes,
  RequestBroadcast,
  RequestId,
} from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import operation from 'src/__tests__/utils-for-testing/data/operation';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { KeychainError } from 'src/keychain-error';

describe('broadcast tests:\n', () => {
  const data = {
    domain: 'domain',
    username: mk.user.one,
    type: KeychainRequestTypes.broadcast,
    operations: 'transfer',
    method: KeychainKeyTypes.posting,
    request_id: 1,
  } as RequestBroadcast & RequestId;

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
    it('Must return error if parsing fails', async () => {
      const cloneData = objects.clone(data) as RequestBroadcast & RequestId;
      cloneData.operations = '//!!';
      const message = 'Unexpected token / in JSON at position 0';
      const requestHandler = new RequestsHandler();
      const result = await broadcastOperations(requestHandler, cloneData);
      const { request_id, ...datas } = cloneData;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error: new SyntaxError(message),
          result: undefined,
          data: datas,
          message: message,
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });

    it('Must return error if invalid operations format', async () => {
      const cloneData = objects.clone(data) as RequestBroadcast & RequestId;
      cloneData.operations = '{}';
      const message = 'operations is not iterable';
      const requestHandler = new RequestsHandler();
      const result = await broadcastOperations(requestHandler, cloneData);
      const { request_id, ...datas } = cloneData;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error: new TypeError(message),
          result: undefined,
          data: datas,
          message: message,
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });

    it('Must return error if receiver not found', async () => {
      AccountUtils.getExtendedAccount = jest
        .fn()
        .mockResolvedValueOnce(undefined);
      const transfers = operation.array.filter((op) => op['0'] === 'transfer');
      transfers[0]['1'].memo = '# enconded memo';
      const cloneData = objects.clone(data) as RequestBroadcast & RequestId;
      cloneData.operations = transfers;
      const requestHandler = new RequestsHandler();
      const result = await broadcastOperations(requestHandler, cloneData);
      const localeMessageKey = 'bgd_ops_transfer_get_account';
      const error = new KeychainError(localeMessageKey, [transfers[0]['1'].to]);
      expect(result.msg.error).toEqual(error);
      expect(result.msg.message).toBe(
        chrome.i18n.getMessage('bgd_ops_transfer_get_account', [
          transfers[0]['1'].to,
        ]),
      );
    });

    it('Must return error if memo key not found in handler', async () => {
      AccountUtils.getExtendedAccount = jest
        .fn()
        .mockResolvedValueOnce(accounts.extended);
      const transfers = operation.array.filter((op) => op['0'] === 'transfer');
      transfers[0]['1'].memo = '# enconded memo';
      const cloneData = objects.clone(data) as RequestBroadcast & RequestId;
      cloneData.operations = transfers;
      const requestHandler = new RequestsHandler();
      const result = await broadcastOperations(requestHandler, cloneData);
      const localeMessageKey = 'popup_html_memo_key_missing';
      const error = new KeychainError(localeMessageKey, []);
      expect(result.msg.error).toEqual(error);
      expect(result.msg.message).toBe(chrome.i18n.getMessage(localeMessageKey));
    });

    it('Must return error if not key on handler', async () => {
      AccountUtils.getExtendedAccount = jest
        .fn()
        .mockResolvedValueOnce(accounts.extended);
      const transfers = operation.array.filter((op) => op['0'] === 'transfer');
      transfers[0]['1'].memo = '# enconded memo';
      const cloneData = objects.clone(data) as RequestBroadcast & RequestId;
      cloneData.operations = transfers;
      const requestHandler = new RequestsHandler();
      requestHandler.data.accounts = [
        {
          name: mk.user.one,
          keys: {
            memo: userData.one.nonEncryptKeys.active,
            memoPubkey: userData.one.encryptKeys.memo,
          },
        },
      ];
      const result = await broadcastOperations(requestHandler, cloneData);
      expect(result.msg.error).toEqual(
        new Error('html_popup_error_while_signing_transaction'),
      );
      expect(result.msg.message).toBe(
        chrome.i18n.getMessage('html_popup_error_while_signing_transaction'),
      );
    });

    it('Must return success on transfer', async () => {
      AccountUtils.getExtendedAccount = jest
        .fn()
        .mockResolvedValueOnce(accounts.extended);
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
        id: 'id',
        confirmed: true,
        tx_id: 'tx_id',
      } as TransactionResult);
      const transfers = operation.array.filter((op) => op['0'] === 'transfer');
      transfers[0]['1'].memo = '# enconded memo';
      const cloneData = objects.clone(data) as RequestBroadcast & RequestId;
      cloneData.operations = transfers;
      const { request_id, ...datas } = cloneData;
      const requestHandler = new RequestsHandler();
      requestHandler.data.accounts = [
        {
          name: mk.user.one,
          keys: {
            memo: userData.one.nonEncryptKeys.memo,
            memoPubkey: userData.one.encryptKeys.memo,
          },
        },
      ];
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.active,
        userData.one.encryptKeys.active,
      );
      const result = await broadcastOperations(requestHandler, cloneData);
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

    it('Must return success broadcasting operations', async () => {
      AccountUtils.getExtendedAccount = jest
        .fn()
        .mockResolvedValueOnce(accounts.extended);
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
        id: 'id',
        confirmed: true,
        tx_id: 'tx_id',
      } as TransactionResult);
      const operations = operation.array.filter((op) => op['0'] !== 'transfer');
      const cloneData = objects.clone(data) as RequestBroadcast & RequestId;
      cloneData.operations = JSON.stringify(operations);
      const { request_id, ...datas } = cloneData;
      const requestHandler = new RequestsHandler();
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.active,
        userData.one.encryptKeys.active,
      );
      const result = await broadcastOperations(requestHandler, cloneData);
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

  describe('Using ledger cases:\n', () => {
    it('Must return success on transfer', async () => {
      AccountUtils.getExtendedAccount = jest
        .fn()
        .mockResolvedValueOnce(accounts.extended);
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
      const transfers = operation.array.filter((op) => op['0'] === 'transfer');
      transfers[0]['1'].memo = '# enconded memo';
      const cloneData = objects.clone(data) as RequestBroadcast & RequestId;
      cloneData.operations = transfers;
      const { request_id, ...datas } = cloneData;
      const requestHandler = new RequestsHandler();
      requestHandler.data.accounts = [
        {
          name: mk.user.one,
          keys: {
            memo: userData.one.nonEncryptKeys.memo,
            memoPubkey: userData.one.encryptKeys.memo,
          },
        },
      ];
      requestHandler.setKeys('#ledgerKey1234', userData.one.encryptKeys.active);
      const result = await broadcastOperations(requestHandler, cloneData);
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
