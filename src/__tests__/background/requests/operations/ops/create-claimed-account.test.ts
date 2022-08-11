import { broadcastCreateClaimedAccount } from '@background/requests/operations/ops/create-claimed-account';
import createClaimedAccount from 'src/__tests__/background/requests/operations/ops/mocks/create-claimed-account';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import userData from 'src/__tests__/utils-for-testing/data/user-data';

describe('create-claimed-account tests:\n', () => {
  const { methods, constants, mocks } = createClaimedAccount;
  const { requestHandler, data, confirmed } = constants;
  methods.afterEach;
  methods.beforeEach;
  it('Must return error if not key on handler', async () => {
    mocks.client.broadcast.sendOperations(confirmed);
    const result = await broadcastCreateClaimedAccount(requestHandler, data);
    const { request_id, ...datas } = data;
    expect(result).toEqual(messages.error.keyBuffer(datas, request_id));
  });
  it('Must return success on claimed account', async () => {
    mocks.client.broadcast.sendOperations(confirmed);
    requestHandler.setKeys(
      userData.one.nonEncryptKeys.active,
      userData.one.encryptKeys.active,
    );
    const result = await broadcastCreateClaimedAccount(requestHandler, data);
    const { request_id, ...datas } = data;
    expect(result).toEqual(
      messages.success.broadcast(
        confirmed,
        datas,
        request_id,
        chrome.i18n.getMessage('bgd_ops_create_account', [data.new_account]),
      ),
    );
  });
});
