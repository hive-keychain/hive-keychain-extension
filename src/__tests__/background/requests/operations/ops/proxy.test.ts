import LedgerModule from '@background/ledger.module';
import { broadcastProxy } from '@background/requests/operations/ops/proxy';
import { RequestsHandler } from '@background/requests/request-handler';
import { HiveTxUtils } from '@hiveapp/utils/hive-tx.utils';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import {
  KeychainRequestTypes,
  RequestId,
  RequestProxy,
} from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

describe('proxy tests:\n', () => {
  const data = {
    domain: 'domain',
    type: KeychainRequestTypes.proxy,
    username: mk.user.one,
    proxy: '',
  } as RequestProxy & RequestId;

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

  describe('broadcastProxy cases:\n', () => {
    describe('Default cases:\n', () => {
      it('Must return error if no key on handler', async () => {
        const requestHandler = new RequestsHandler();
        const result = await broadcastProxy(requestHandler, data);
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

      it('Must return success on removing proxy', async () => {
        jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
          id: 'id',
          confirmed: true,
          tx_id: 'tx_id',
        } as TransactionResult);
        data.username = userData.one.username;
        const requestHandler = new RequestsHandler();
        requestHandler.data.key = userData.one.nonEncryptKeys.active;
        const result = await broadcastProxy(requestHandler, data);
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
            message: chrome.i18n.getMessage('bgd_ops_unproxy'),
            request_id: request_id,
            publicKey: undefined,
          },
        });
      });

      it('Must return success on setting proxy', async () => {
        jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
          id: 'id',
          confirmed: true,
          tx_id: 'tx_id',
        } as TransactionResult);
        data.username = userData.one.username;
        data.proxy = 'keychain';
        const requestHandler = new RequestsHandler();
        requestHandler.data.key = userData.one.nonEncryptKeys.active;
        const result = await broadcastProxy(requestHandler, data);
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
            message: chrome.i18n.getMessage('popup_success_proxy', [
              data.proxy,
            ]),
            request_id: request_id,
            publicKey: undefined,
          },
        });
      });
    });

    describe('Using ledger cases:\n', () => {
      it('Must return success on setting proxy', async () => {
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
        data.username = userData.one.username;
        data.proxy = 'keychain';
        const requestHandler = new RequestsHandler();
        requestHandler.data.key = '#ledgerKEY!@#$';
        const result = await broadcastProxy(requestHandler, data);
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
            message: chrome.i18n.getMessage('popup_success_proxy', [
              data.proxy,
            ]),
            request_id: request_id,
            publicKey: undefined,
          },
        });
      });
    });
  });
});
