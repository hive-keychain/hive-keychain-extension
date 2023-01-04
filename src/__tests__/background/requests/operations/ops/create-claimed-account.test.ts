import { broadcastCreateClaimedAccount } from '@background/requests/operations/ops/create-claimed-account';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import createClaimedAccount from 'src/__tests__/background/requests/operations/ops/mocks/create-claimed-account';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('create-claimed-account tests:\n', () => {
  const { methods, constants, mocks } = createClaimedAccount;
  const { requestHandler, data, confirmed } = constants;
  methods.afterEach;
  methods.beforeEach;
  it('Must return error if no key on handler', async () => {
    const message = "Cannot read properties of undefined (reading 'toString')";
    const result = await broadcastCreateClaimedAccount(requestHandler, data);
    const { request_id, ...datas } = data;
    expect(result).toEqual(
      messages.error.keyBuffer(
        datas,
        request_id,
        new TypeError(message),
        message,
      ),
    );
  });
  it('Must return success on claimed account', async () => {
    const mHiveTxSendOp = jest
      .spyOn(HiveTxUtils, 'sendOperation')
      .mockResolvedValueOnce(true);
    requestHandler.setKeys(
      userData.one.nonEncryptKeys.active,
      userData.one.encryptKeys.active,
    );
    const result = await broadcastCreateClaimedAccount(requestHandler, data);
    const { request_id, ...datas } = data;
    expect(result).toEqual(
      messages.success.broadcast(
        false,
        datas,
        request_id,
        chrome.i18n.getMessage('bgd_ops_create_account', [data.new_account]),
      ),
    );
    mHiveTxSendOp.mockRestore();
  });
});
