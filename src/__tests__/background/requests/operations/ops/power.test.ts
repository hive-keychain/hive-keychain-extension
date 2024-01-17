import LedgerModule from '@background/ledger.module';
import {
  broadcastPowerDown,
  broadcastPowerUp,
} from '@background/requests/operations/ops/power';
import { RequestsHandler } from '@background/requests/request-handler';
import { DynamicGlobalPropertiesUtils } from '@hiveapp/utils/dynamic-global-properties.utils';
import { HiveTxUtils } from '@hiveapp/utils/hive-tx.utils';
import { DynamicGlobalProperties } from '@hiveio/dhive';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import {
  KeychainRequestTypes,
  RequestId,
  RequestPowerDown,
  RequestPowerUp,
} from 'hive-keychain-commons';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

describe('power tests:\n', () => {
  const data = {
    powerUp: {
      type: KeychainRequestTypes.powerUp,
      username: mk.user.one,
      recipient: mk.user.one,
      hive: '100',
      request_id: 1,
    } as RequestPowerUp & RequestId,
    powerDown: {
      type: KeychainRequestTypes.powerDown,
      username: mk.user.one,
      hive_power: '100',
      request_id: 1,
    } as RequestPowerDown & RequestId,
  };

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

  describe('broadcastPowerUp cases:\n', () => {
    describe('Default cases:\n', () => {
      it('Must return error if no key on handler', async () => {
        const requestHandler = new RequestsHandler();
        const result = await broadcastPowerUp(requestHandler, data.powerUp);
        const { request_id, ...datas } = data.powerUp;
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
        jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
          id: 'id',
          confirmed: true,
          tx_id: 'tx_id',
        } as TransactionResult);
        const requestHandler = new RequestsHandler();
        requestHandler.data.key = userData.one.nonEncryptKeys.active;
        const result = await broadcastPowerUp(requestHandler, data.powerUp);
        const { request_id, ...datas } = data.powerUp;
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
            message: chrome.i18n.getMessage('bgd_ops_pu', [
              datas.hive,
              datas.recipient,
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
        requestHandler.data.key = '#ledgerKEY1233';
        const result = await broadcastPowerUp(requestHandler, data.powerUp);
        const { request_id, ...datas } = data.powerUp;
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
            message: chrome.i18n.getMessage('bgd_ops_pu', [
              datas.hive,
              datas.recipient,
            ]),
            request_id: request_id,
            publicKey: undefined,
          },
        });
      });
    });
  });

  describe('broadcastPowerDown cases:\n', () => {
    describe('Default cases:\n', () => {
      it('Must return error if wrong global data', async () => {
        jest
          .spyOn(DynamicGlobalPropertiesUtils, 'getDynamicGlobalProperties')
          .mockResolvedValueOnce({} as DynamicGlobalProperties);
        const requestHandler = new RequestsHandler();
        const result = await broadcastPowerDown(requestHandler, data.powerDown);
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
        const result = await broadcastPowerDown(requestHandler, data.powerDown);
        const { request_id, ...datas } = data.powerDown;
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
        const result = await broadcastPowerDown(requestHandler, data.powerDown);
        const { request_id, ...datas } = data.powerDown;
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
            message: chrome.i18n.getMessage('bgd_ops_pd', [
              datas.hive_power,
              datas.username,
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
          .spyOn(LedgerModule, 'getSignatureFromLedger')
          .mockResolvedValueOnce('signed!');
        jest
          .spyOn(HiveTxUtils, 'broadcastAndConfirmTransactionWithSignature')
          .mockResolvedValue({
            id: 'id',
            confirmed: true,
            tx_id: 'tx_id',
          } as TransactionResult);
        jest
          .spyOn(DynamicGlobalPropertiesUtils, 'getDynamicGlobalProperties')
          .mockResolvedValueOnce(dynamic.globalProperties);
        const requestHandler = new RequestsHandler();
        requestHandler.data.key = '#ledgerKEY12345';
        const result = await broadcastPowerDown(requestHandler, data.powerDown);
        const { request_id, ...datas } = data.powerDown;
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
            message: chrome.i18n.getMessage('bgd_ops_pd', [
              datas.hive_power,
              datas.username,
            ]),
            request_id: request_id,
            publicKey: undefined,
          },
        });
      });
    });
  });
});
