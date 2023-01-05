import { signTx } from '@background/requests/operations/ops/sign-tx';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import signTxMocks from 'src/__tests__/background/requests/operations/ops/mocks/sign-tx-mocks';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('sign-tx tests:\n', () => {
  const { methods, constants } = signTxMocks;
  const { requestHandler, data, i18n } = constants;
  methods.afterEach;
  methods.beforeEach;
  it('Must return error if no key on handler', async () => {
    const error = "Cannot read properties of undefined (reading 'toString')";
    const result = await signTx(requestHandler, data);
    methods.assert.error(result, new TypeError(error), data, error);
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
