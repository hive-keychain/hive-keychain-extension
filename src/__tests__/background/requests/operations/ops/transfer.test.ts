import LedgerModule from '@background/ledger.module';
import { broadcastTransfer } from '@background/requests/operations/ops/transfer';
import { RequestsHandler } from '@background/requests/request-handler';
import AccountUtils from '@hiveapp/utils/account.utils';
import { HiveTxUtils } from '@hiveapp/utils/hive-tx.utils';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import {
  KeychainKeyTypesLC,
  KeychainRequestTypes,
  RequestId,
  RequestTransfer,
} from 'hive-keychain-commons';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { KeychainError } from 'src/keychain-error';

describe('transfer tests:\n', () => {
  const data = {
    domain: 'domain',
    type: KeychainRequestTypes.transfer,
    username: mk.user.one,
    to: 'theghost1980',
    amount: '0.001',
    memo: '',
    enforce: false,
    currency: 'HIVE',
    request_id: 1,
  } as RequestTransfer & RequestId;

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  beforeEach(() => {
    jest.spyOn(chrome.i18n, 'getUILanguage').mockReturnValueOnce('em-US');
    chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom);
  });

  describe('broadcastTransfer cases:\n', () => {
    describe('Default cases:\n', () => {
      describe('No encrypted memo:\n', () => {
        it('Must call getUserKey', async () => {
          const requestHandler = new RequestsHandler();
          const sGetUserKeyPair = jest.spyOn(requestHandler, 'getUserKeyPair');
          await broadcastTransfer(requestHandler, data);
          expect(sGetUserKeyPair).toBeCalledWith(
            mk.user.one,
            KeychainKeyTypesLC.memo,
          );
        });

        it('Must return error if no key on handler', async () => {
          const requestHandler = new RequestsHandler();
          const result = await broadcastTransfer(requestHandler, data);
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

        it('Must return error if receiver not found', async () => {
          const cloneData = objects.clone(data) as RequestTransfer & RequestId;
          cloneData.currency = 'HIVE';
          cloneData.amount = '0.001';
          cloneData.to = mk.user.two;
          const localeMessageKey = 'bgd_ops_transfer_get_account';
          AccountUtils.getExtendedAccount = jest.fn().mockResolvedValue(null);
          const requestHandler = new RequestsHandler();
          requestHandler.data.key = userData.one.nonEncryptKeys.active;
          requestHandler.data.accounts = accounts.twoAccounts;
          const result = await broadcastTransfer(requestHandler, cloneData);
          const { request_id, ...datas } = cloneData;
          expect(result).toEqual({
            command: DialogCommand.ANSWER_REQUEST,
            msg: {
              success: false,
              error: new KeychainError(localeMessageKey),
              result: undefined,
              data: datas,
              message: chrome.i18n.getMessage(localeMessageKey, [cloneData.to]),
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
          AccountUtils.getExtendedAccount = jest
            .fn()
            .mockResolvedValue(accounts.extended);
          const requestHandler = new RequestsHandler();
          requestHandler.data.key = userData.one.nonEncryptKeys.active;
          requestHandler.data.accounts = accounts.twoAccounts;
          const result = await broadcastTransfer(requestHandler, data);
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
              message: chrome.i18n.getMessage('bgd_ops_transfer_success', [
                data.amount,
                data.currency,
                data.username!,
                data.to,
              ]),
              request_id: request_id,
              publicKey: undefined,
            },
          });
        });
      });

      describe('Encrypted memo:\n', () => {
        it('Must return error if no memoKey', async () => {
          AccountUtils.getExtendedAccount = jest
            .fn()
            .mockResolvedValue(accounts.extended);
          const localeMessageKey = 'popup_html_memo_key_missing';
          const requestHandler = new RequestsHandler();
          requestHandler.data.key = userData.one.nonEncryptKeys.active;
          requestHandler.data.accounts = [];
          const cloneData = objects.clone(data) as RequestTransfer & RequestId;
          cloneData.to = 'nonExistentUser';
          cloneData.memo = '# To Encrypt this memo!';
          const result = await broadcastTransfer(requestHandler, cloneData);
          const { request_id, ...datas } = cloneData;
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

        it('Must return error if receiver not found', async () => {
          AccountUtils.getExtendedAccount = jest.fn().mockResolvedValue(null);
          const localeMessageKey = 'bgd_ops_transfer_get_account';
          const requestHandler = new RequestsHandler();
          requestHandler.data.key = userData.one.nonEncryptKeys.active;
          requestHandler.data.accounts = accounts.twoAccounts;
          const cloneData = objects.clone(data) as RequestTransfer & RequestId;
          cloneData.to = 'nonExistentUser';
          cloneData.memo = '# To Encrypt this memo!';
          const result = await broadcastTransfer(requestHandler, cloneData);
          const { request_id, ...datas } = cloneData;
          expect(result).toEqual({
            command: DialogCommand.ANSWER_REQUEST,
            msg: {
              success: false,
              error: new KeychainError(localeMessageKey),
              result: undefined,
              data: datas,
              message: chrome.i18n.getMessage(localeMessageKey, [cloneData.to]),
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
          AccountUtils.getExtendedAccount = jest
            .fn()
            .mockResolvedValueOnce(accounts.extended);
          const requestHandler = new RequestsHandler();
          requestHandler.data.key = userData.one.nonEncryptKeys.active;
          requestHandler.data.accounts = accounts.twoAccounts;
          const cloneData = objects.clone(data) as RequestTransfer & RequestId;
          cloneData.to = 'theghost1980';
          cloneData.memo = '# To Encrypt this memo! Get the Quan!!';
          const result = await broadcastTransfer(requestHandler, cloneData);
          const { request_id, ...datas } = cloneData;
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
              message: chrome.i18n.getMessage('bgd_ops_transfer_success', [
                cloneData.amount,
                cloneData.currency,
                cloneData.username!,
                cloneData.to,
              ]),
              request_id: request_id,
              publicKey: undefined,
            },
          });
        });
      });
    });

    describe('Using ledger cases:\n', () => {
      it('Must return success', async () => {
        jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
          id: 'id',
          confirmed: true,
          tx_id: 'tx_id',
        } as TransactionResult);
        jest
          .spyOn(LedgerModule, 'getSignatureFromLedger')
          .mockResolvedValue('signed!');
        jest
          .spyOn(HiveTxUtils, 'broadcastAndConfirmTransactionWithSignature')
          .mockResolvedValue({
            id: 'id',
            confirmed: true,
            tx_id: 'tx_id',
          } as TransactionResult);
        AccountUtils.getExtendedAccount = jest
          .fn()
          .mockResolvedValueOnce(accounts.extended);
        const clonedAccounts = objects.clone(
          accounts.twoAccounts,
        ) as LocalAccount[];
        clonedAccounts[0].keys.active = '#ledgerKey1234';
        const requestHandler = new RequestsHandler();
        requestHandler.data.accounts = clonedAccounts;
        const cloneData = objects.clone(data) as RequestTransfer & RequestId;
        const result = await broadcastTransfer(requestHandler, cloneData);
        const { request_id, ...datas } = cloneData;
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
            message: chrome.i18n.getMessage('bgd_ops_transfer_success', [
              cloneData.amount,
              cloneData.currency,
              cloneData.username!,
              cloneData.to,
            ]),
            request_id: request_id,
            publicKey: undefined,
          },
        });
      });
    });
  });
});
