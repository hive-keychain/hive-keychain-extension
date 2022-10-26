import { signTx } from '@background/requests/operations/ops/sign-tx';
import { AssertionError } from 'assert';
import signTxMocks from 'src/__tests__/background/requests/operations/ops/mocks/sign-tx-mocks';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('sign-tx tests:\n', () => {
  const { methods, constants } = signTxMocks;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  it('Must return error if no key on handler', async () => {
    const error = 'private_key required';
    const result = await signTx(requestHandler, data);
    methods.assert.error(
      result,
      new AssertionError({ expected: true, operator: '==', message: error }),
      data,
      error,
    );
  });
  it('Must return success', async () => {
    requestHandler.data.key = userData.one.nonEncryptKeys.active;
    const signedTx = await signTx(requestHandler, data);
    methods.assert.success(
      signedTx,
      data,
      chrome.i18n.getMessage('bgd_ops_sign_tx'),
    );
  });
});
