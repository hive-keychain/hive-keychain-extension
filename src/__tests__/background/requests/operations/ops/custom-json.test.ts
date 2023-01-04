import { broadcastCustomJson } from '@background/requests/operations/ops/custom-json';
import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import customJsonMocks from 'src/__tests__/background/requests/operations/ops/mocks/custom-json-mocks';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('custom-json tests:\n', () => {
  const { methods, constants, mocks, spies } = customJsonMocks;
  const { requestHandler, data, confirmed } = constants;
  methods.afterEach;
  methods.beforeEach;
  it('Must call getUserKey if no key on handler', async () => {
    await broadcastCustomJson(requestHandler, data);
    expect(spies.getUserKey).toBeCalledWith(
      data.username!,
      data.method.toLowerCase() as KeychainKeyTypesLC,
    );
  });
  it('Must return success', async () => {
    const mHiveTxSendOp = jest
      .spyOn(HiveTxUtils, 'sendOperation')
      .mockResolvedValueOnce(true);
    requestHandler.data.key = userData.one.nonEncryptKeys.active;
    const result = await broadcastCustomJson(requestHandler, data);
    const { request_id, ...datas } = data;
    expect(result).toEqual(
      messages.success.broadcast(
        true,
        datas,
        request_id,
        chrome.i18n.getMessage('bgd_ops_broadcast'),
      ),
    );
    mHiveTxSendOp.mockRestore();
  });
});
