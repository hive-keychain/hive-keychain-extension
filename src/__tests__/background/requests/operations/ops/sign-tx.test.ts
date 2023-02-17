import { signTx } from '@background/requests/operations/ops/sign-tx';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import signTxMocks from 'src/__tests__/background/requests/operations/ops/mocks/sign-tx-mocks';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('sign-tx tests:\n', () => {
  const { methods, constants, mocks } = signTxMocks;
  const { requestHandler, data, i18n } = constants;
  methods.afterEach;
  methods.beforeEach;
  describe('Default cases:\n', () => {
    it('Must return error if no key on handler', async () => {
      const result = await signTx(requestHandler, data);
      methods.assert.error(
        result,
        new Error('html_popup_error_while_signing_transaction'),
        data,
        i18n.get('html_popup_error_while_signing_transaction'),
      );
    });
    it('Must return success', async () => {
      const mHiveTxSendOp = jest
        .spyOn(HiveTxUtils, 'sendOperation')
        .mockResolvedValue(true);
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const signedTx = await signTx(requestHandler, data);
      expect(signedTx.msg.success).toBe(true);
      expect(signedTx.msg.error).toBeUndefined();
      expect(signedTx.msg.message).toBe(i18n.get('bgd_ops_sign_tx'));
      mHiveTxSendOp.mockRestore();
    });
  });

  describe('Using ledger cases:\n', () => {
    it('Must return success', async () => {
      mocks.HiveTxUtils.sendOperation(true);
      mocks.LedgerModule.getSignatureFromLedger('signed!');
      mocks.broadcastAndConfirmTransactionWithSignature(true);
      requestHandler.data.key = '#ledger123456';
      const signedTx = await signTx(requestHandler, data);
      expect(signedTx.msg.success).toBe(true);
      expect(signedTx.msg.error).toBeUndefined();
      expect(signedTx.msg.message).toBe(i18n.get('bgd_ops_sign_tx'));
    });
  });
});
