import LedgerModule from '@background/ledger.module';
import { broadcastProxy } from '@background/requests/operations/ops/proxy';
import { RequestsHandler } from '@background/requests/request-handler';
import { HiveTxUtils } from '@hiveapp/utils/hive-tx.utils';
import ProxyUtils from '@popup/hive/utils/proxy.utils';
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
        const mockTransaction = {
          expiration: '10/10/2023',
          extensions: [],
          operations: [],
          ref_block_num: 0,
          ref_block_prefix: 0,
        };
        jest
          .spyOn(ProxyUtils, 'getSetProxyTransaction')
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
