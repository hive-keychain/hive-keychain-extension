import LedgerModule from '@background/ledger.module';
import { signTx } from '@background/requests/operations/ops/sign-tx';
import { RequestsHandler } from '@background/requests/request-handler';
import { Operation, Transaction } from '@hiveio/dhive';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import {
  KeychainRequestTypes,
  RequestId,
  RequestSignTx,
} from 'hive-keychain-commons';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

describe('sign-tx tests:\n', () => {
  const data = {
    domain: 'domain',
    type: KeychainRequestTypes.signTx,
    username: mk.user.one,
    tx: {
      ref_block_num: 1000,
      ref_block_prefix: 1,
      expiration: '12/12/2023',
      operations: [] as Operation[],
      extensions: [],
    } as Transaction,
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
  });
});
