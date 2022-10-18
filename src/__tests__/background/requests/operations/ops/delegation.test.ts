import { broadcastDelegation } from '@background/requests/operations/ops/delegation';
import { DynamicGlobalProperties } from '@hiveio/dhive';
import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import delegationMocks from 'src/__tests__/background/requests/operations/ops/mocks/delegation-mocks';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('delegation tests:\n', () => {
  const { methods, constants, mocks, spies } = delegationMocks;
  const { requestHandler, data, confirmed } = constants;
  methods.afterEach;
  methods.beforeEach;
  it('Must call getUserKey', async () => {
    mocks.client.database.getDynamicGlobalProperties(dynamic.globalProperties);
    await broadcastDelegation(requestHandler, data);
    expect(spies.getUserKey).toBeCalledWith(
      data.username,
      KeychainKeyTypesLC.active,
    );
  });
  it('Must return error if global props not received', async () => {
    mocks.client.database.getDynamicGlobalProperties(
      {} as DynamicGlobalProperties,
    );
    const result = await broadcastDelegation(requestHandler, data);
    expect(result.command).toBe(DialogCommand.ANSWER_REQUEST);
    expect(result.msg.result).toBeUndefined();
    expect(result.msg.error).not.toBeNull();
    expect(result.msg.message).toContain(
      chrome.i18n.getMessage('bgd_ops_error'),
    );
  });
  it('Must return error if no key on handler', async () => {
    mocks.client.database.getDynamicGlobalProperties(dynamic.globalProperties);
    const result = await broadcastDelegation(requestHandler, data);
    const { request_id, ...datas } = data;
    const errorTitle = 'private key should be a Buffer';
    expect(result).toEqual(
      messages.error.answerError(
        new TypeError(errorTitle),
        datas,
        request_id,
        chrome.i18n.getMessage('bgd_ops_error') + ' : ' + errorTitle,
        undefined,
      ),
    );
  });
  it('Must return success', async () => {
    mocks.client.database.getDynamicGlobalProperties(dynamic.globalProperties);
    requestHandler.data.key = userData.one.nonEncryptKeys.active;
    const result = await broadcastDelegation(requestHandler, data);
    const { request_id, ...datas } = data;
    expect(result).toEqual(
      messages.success.broadcast(
        confirmed,
        datas,
        request_id,
        chrome.i18n.getMessage('bgd_ops_delegate', [
          `${datas.amount} ${datas.unit}`,
          datas.delegatee,
          datas.username!,
        ]),
      ),
    );
  });
});
