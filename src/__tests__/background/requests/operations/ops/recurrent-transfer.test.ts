import { recurrentTransfer } from '@background/requests/operations/ops/recurrent-transfer';
import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { KeychainError } from 'src/keychain-error';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import recurrentTransferMocks from 'src/__tests__/background/requests/operations/ops/mocks/recurrent-transfer-mocks';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import { transactionConfirmationSuccess } from 'src/__tests__/utils-for-testing/data/confirmations';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
describe('recurrent-transfer tests:\n', () => {
  const { methods, constants, spies, mocks } = recurrentTransferMocks;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  describe('Without encrypted memo:\n', () => {
    it('Must call getUserKey', async () => {
      mocks.getExtendedAccount(undefined);
      await recurrentTransfer(requestHandler, data);
      expect(spies.getUserKey).toBeCalledWith(
        data.username!,
        KeychainKeyTypesLC.active,
      );
    });
    it('Must return error if no key on handler', async () => {
      const result = await recurrentTransfer(requestHandler, data);
      methods.assert.error(
        result,
        new Error('html_popup_error_while_signing_transaction'),
        data,
        mocksImplementation.i18nGetMessageCustom(
          'html_popup_error_while_signing_transaction',
        ),
      );
    });
    it('Must return sucess on start recurrent', async () => {
      const mHiveTxSendOp = jest
        .spyOn(HiveTxUtils, 'sendOperation')
        .mockResolvedValue(transactionConfirmationSuccess);
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const result = await recurrentTransfer(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual(
        messages.success.answerSucess(
          transactionConfirmationSuccess,
          datas,
          request_id,
          chrome.i18n.getMessage('bgd_ops_recurrent_transfer'),
          undefined,
        ),
      );
      mHiveTxSendOp.mockRestore();
    });
    it('Must return sucess on start recurrent, using ledger', async () => {
      mocks.HiveTxUtils.sendOperation(transactionConfirmationSuccess);
      mocks.LedgerModule.getSignatureFromLedger('signed!');
      mocks.broadcastAndConfirmTransactionWithSignature(
        transactionConfirmationSuccess,
      );
      requestHandler.data.key = '#ledgerKEY1234';
      const result = await recurrentTransfer(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual(
        messages.success.answerSucess(
          transactionConfirmationSuccess,
          datas,
          request_id,
          chrome.i18n.getMessage('bgd_ops_recurrent_transfer'),
          undefined,
        ),
      );
    });
    it('Must return sucess on stop recurrent', async () => {
      const mHiveTxSendOp = jest
        .spyOn(HiveTxUtils, 'sendOperation')
        .mockResolvedValue(transactionConfirmationSuccess);
      data.amount = '0';
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const result = await recurrentTransfer(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual(
        messages.success.answerSucess(
          transactionConfirmationSuccess,
          datas,
          request_id,
          chrome.i18n.getMessage('bgd_ops_stop_recurrent_transfer'),
          undefined,
        ),
      );
      mHiveTxSendOp.mockRestore();
    });
  });
  describe('With encrypted memo', () => {
    it('Must call getUserKey', async () => {
      mocks.getExtendedAccount(undefined);
      data.memo = '# To encrypt!';
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      await recurrentTransfer(requestHandler, data);
      expect(spies.getUserKey).toBeCalledWith(
        data.username!,
        KeychainKeyTypesLC.memo,
      );
    });
    it('Must return error if no private key', async () => {
      const localeMessageKey = 'bgd_ops_encode_err';
      const errorMessage = chrome.i18n.getMessage('bgd_ops_encode_err');
      data.memo = '# To encrypt!';
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const result = await recurrentTransfer(requestHandler, data);
      methods.assert.error(
        result,
        new KeychainError(localeMessageKey),
        data,
        errorMessage,
      );
    });
    it('Must return error if no memoKey data', async () => {
      const localeMessageKey = 'bgd_ops_encode_err';
      const errorMessage = chrome.i18n.getMessage('bgd_ops_encode_err');
      mocks.getExtendedAccount(accounts.extended);
      data.memo = '# To encrypt!';
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const result = await recurrentTransfer(requestHandler, data);
      methods.assert.error(
        result,
        new KeychainError(localeMessageKey),
        data,
        errorMessage,
      );
    });
    it('Must return success on started recurrent', async () => {
      requestHandler.data.accounts = accounts.twoAccounts;
      const mHiveTxSendOp = jest
        .spyOn(HiveTxUtils, 'sendOperation')
        .mockResolvedValue(transactionConfirmationSuccess);
      mocks.getExtendedAccount(accounts.extended);
      data.amount = '1000';
      data.memo = '# To encrypt!';
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const result = await recurrentTransfer(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual(
        messages.success.answerSucess(
          transactionConfirmationSuccess,
          datas,
          request_id,
          chrome.i18n.getMessage('bgd_ops_recurrent_transfer'),
          undefined,
        ),
      );
      mHiveTxSendOp.mockRestore();
    });
    it('Must return success on stop recurrent', async () => {
      const mHiveTxSendOp = jest
        .spyOn(HiveTxUtils, 'sendOperation')
        .mockResolvedValue(transactionConfirmationSuccess);
      requestHandler.data.accounts = accounts.twoAccounts;
      mocks.getExtendedAccount(accounts.extended);
      data.memo = '# To encrypt!';
      data.amount = '0';
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const result = await recurrentTransfer(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual(
        messages.success.answerSucess(
          transactionConfirmationSuccess,
          datas,
          request_id,
          chrome.i18n.getMessage('bgd_ops_stop_recurrent_transfer'),
          undefined,
        ),
      );
      mHiveTxSendOp.mockRestore();
    });
  });
});
