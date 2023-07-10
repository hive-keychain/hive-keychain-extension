import LedgerModule from '@background/ledger.module';
import { broadcastDelegation } from '@background/requests/operations/ops/delegation';
import { RequestsHandler } from '@background/requests/request-handler';
import { DynamicGlobalProperties } from '@hiveio/dhive';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import {
  KeychainRequestTypes,
  RequestDelegation,
  RequestId,
} from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { DynamicGlobalPropertiesUtils } from 'src/utils/dynamic-global-properties.utils';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

describe('delegation tests:\n', () => {
  const data = {
    domain: 'domain',
    username: mk.user.one,
    type: KeychainRequestTypes.delegation,
    delegatee: 'theghost1980',
    amount: '100.000',
    unit: 'HP',
    request_id: 1,
  } as RequestDelegation & RequestId;

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
    it('Must return error if global props not received', async () => {
      jest
        .spyOn(DynamicGlobalPropertiesUtils, 'getDynamicGlobalProperties')
        .mockResolvedValueOnce({} as DynamicGlobalProperties);
      const requestHandler = new RequestsHandler();
      const result = await broadcastDelegation(requestHandler, data);
      expect(result.command).toBe(DialogCommand.ANSWER_REQUEST);
      expect(result.msg.result).toBeUndefined();
      expect(result.msg.error).not.toBeNull();
      expect(result.msg.message).toContain(
        "Cannot read properties of undefined (reading 'split')",
      );
    });

    it('Must return error if no key on handler', async () => {
      jest
        .spyOn(DynamicGlobalPropertiesUtils, 'getDynamicGlobalProperties')
        .mockResolvedValueOnce(dynamic.globalProperties);
      const requestHandler = new RequestsHandler();
      const result = await broadcastDelegation(requestHandler, data);
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
      jest
        .spyOn(DynamicGlobalPropertiesUtils, 'getDynamicGlobalProperties')
        .mockResolvedValueOnce(dynamic.globalProperties);
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
        id: 'id',
        confirmed: true,
        tx_id: 'tx_id',
      } as TransactionResult);
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const result = await broadcastDelegation(requestHandler, data);
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
          message: chrome.i18n.getMessage('bgd_ops_delegate', [
            `${datas.amount} ${datas.unit}`,
            datas.delegatee,
            datas.username!,
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });
  });

  describe('Using ledger cases:\n', () => {
    it('Must return success', async () => {
      jest
        .spyOn(DynamicGlobalPropertiesUtils, 'getDynamicGlobalProperties')
        .mockResolvedValueOnce(dynamic.globalProperties);
      jest
        .spyOn(LedgerModule, 'getSignatureFromLedger')
        .mockResolvedValueOnce('signed!');
      jest
        .spyOn(HiveTxUtils, 'broadcastAndConfirmTransactionWithSignature')
        .mockResolvedValueOnce({
          id: 'id',
          confirmed: true,
          tx_id: 'tx_id',
        } as TransactionResult);
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = '#ledgerKEY12345';
      const clonedData = objects.clone(data) as RequestDelegation & RequestId;
      clonedData.unit = 'VESTS';
      const result = await broadcastDelegation(requestHandler, clonedData);
      const { request_id, ...datas } = clonedData;
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
          message: chrome.i18n.getMessage('bgd_ops_delegate', [
            `${datas.amount} ${datas.unit}`,
            datas.delegatee,
            datas.username!,
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });
  });
});
