import LedgerModule from '@background/ledger.module';
import { signTx } from '@background/requests/operations/ops/sign-tx';
import { RequestsHandler } from '@background/requests/request-handler';
import { Operation, Transaction } from '@hiveio/dhive';
import { DynamicGlobalPropertiesUtils } from '@popup/hive/utils/dynamic-global-properties.utils';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import {
  KeychainRequestTypes,
  RequestId,
  RequestSignTx,
} from 'hive-keychain-commons';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const buildTx = (overrides?: Partial<Transaction>) =>
  ({
    ref_block_num: 1000,
    ref_block_prefix: 123456789,
    expiration: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    operations: [
      [
        'transfer',
        {
          from: mk.user.one,
          to: 'alice',
          amount: '1.000 HIVE',
          memo: 'test',
        },
      ],
    ] as Operation[],
    extensions: [],
    ...overrides,
  } as Transaction);

describe('sign-tx tests:\n', () => {
  const data = {
    domain: 'domain',
    type: KeychainRequestTypes.signTx,
    username: mk.user.one,
    tx: buildTx(),
    request_id: 1,
  } as RequestSignTx & RequestId;

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
    jest
      .spyOn(DynamicGlobalPropertiesUtils, 'getDynamicGlobalProperties')
      .mockResolvedValue({ head_block_number: 1100 } as any);
  });

  describe('Default cases:\n', () => {
    it('Must return error if no key on handler', async () => {
      const requestHandler = new RequestsHandler();
      const result = await signTx(requestHandler, data);
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
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const signedTx = await signTx(requestHandler, data);
      expect(signedTx.msg.success).toBe(true);
      expect(signedTx.msg.error).toBeUndefined();
      expect(signedTx.msg.message).toBe(
        chrome.i18n.getMessage('bgd_ops_sign_tx'),
      );
    });

    it('Rejects expired transactions', async () => {
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const signedTx = await signTx(requestHandler, {
        ...data,
        tx: buildTx({ expiration: new Date(Date.now() - 1000).toISOString() }),
      });

      expect(signedTx.msg.success).toBe(false);
      expect(signedTx.msg.error).toBe('invalid_transaction');
      expect(signedTx.msg.message).toBe('This transaction has already expired.');
    });

    it('Rejects missing expiration', async () => {
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const signedTx = await signTx(requestHandler, {
        ...data,
        tx: buildTx({ expiration: undefined as any }),
      });

      expect(signedTx.msg.success).toBe(false);
      expect(signedTx.msg.error).toBe('invalid_transaction');
      expect(signedTx.msg.message).toBe('Invalid transaction expiration.');
    });

    it('Rejects expiration too far in the future', async () => {
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const signedTx = await signTx(requestHandler, {
        ...data,
        tx: buildTx({
          expiration: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
        }),
      });

      expect(signedTx.msg.success).toBe(false);
      expect(signedTx.msg.error).toBe('invalid_transaction');
      expect(signedTx.msg.message).toBe(
        'Transaction expiration is too far in the future.',
      );
    });

    it('Rejects invalid ref block fields', async () => {
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const signedTx = await signTx(requestHandler, {
        ...data,
        tx: buildTx({ ref_block_num: 0, ref_block_prefix: -1 }),
      });

      expect(signedTx.msg.success).toBe(false);
      expect(signedTx.msg.error).toBe('invalid_transaction');
      expect(signedTx.msg.message).toBe(
        'Invalid transaction reference block fields.',
      );
    });

    it('Rejects malformed transaction shapes', async () => {
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const signedTx = await signTx(requestHandler, {
        ...data,
        tx: { expiration: new Date(Date.now() + 1000).toISOString() } as any,
      });

      expect(signedTx.msg.success).toBe(false);
      expect(signedTx.msg.error).toBe('invalid_transaction');
      expect(signedTx.msg.message).toBe(
        'This transaction must include at least one operation.',
      );
    });
  });

  describe('Using ledger cases:\n', () => {
    it('Must return success', async () => {
      jest
        .spyOn(LedgerModule, 'getSignatureFromLedger')
        .mockResolvedValue('signed!');
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = '#ledger123456';
      const signedTx = await signTx(requestHandler, data);
      expect(signedTx.msg.success).toBe(true);
      expect(signedTx.msg.error).toBeUndefined();
      expect(signedTx.msg.message).toBe(
        chrome.i18n.getMessage('bgd_ops_sign_tx'),
      );
    });

    it('Preserves existing signatures when adding a ledger signature', async () => {
      jest
        .spyOn(LedgerModule, 'getSignatureFromLedger')
        .mockResolvedValue('signed!');
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = '#ledger123456';
      const signedTx = await signTx(requestHandler, {
        ...data,
        tx: {
          ...buildTx(),
          signatures: ['existing-signature'],
        } as Transaction,
      });

      expect(signedTx.msg.success).toBe(true);
      expect(signedTx.msg.result.signatures).toEqual([
        'existing-signature',
        'signed!',
      ]);
    });
  });
});
