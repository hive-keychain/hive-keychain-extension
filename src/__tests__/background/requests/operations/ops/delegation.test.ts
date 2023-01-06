import { broadcastDelegation } from '@background/requests/operations/ops/delegation';
import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import delegationMocks from 'src/__tests__/background/requests/operations/ops/mocks/delegation-mocks';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
describe('delegation tests:\n', () => {
  const { methods, constants, spies } = delegationMocks;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  it('Must call getUserKey', async () => {
    mocksImplementation.hiveTxUtils.getData({
      dynamicGlobalProperties: dynamic.globalProperties,
    });
    await broadcastDelegation(requestHandler, data);
    expect(spies.getUserKey).toBeCalledWith(
      data.username,
      KeychainKeyTypesLC.active,
    );
  });
  it('Must return error if global props not received', async () => {
    mocksImplementation.hiveTxUtils.getData({ dynamicGlobalProperties: {} });
    const result = await broadcastDelegation(requestHandler, data);
    expect(result.command).toBe(DialogCommand.ANSWER_REQUEST);
    expect(result.msg.result).toBeUndefined();
    expect(result.msg.error).not.toBeNull();
    expect(result.msg.message).toContain(
      "Cannot read properties of undefined (reading 'split')",
    );
  });
  it('Must return error if no key on handler', async () => {
    mocksImplementation.hiveTxUtils.getData({
      dynamicGlobalProperties: dynamic.globalProperties,
    });
    const result = await broadcastDelegation(requestHandler, data);
    const { request_id, ...datas } = data;
    const errorTitle =
      "Cannot read properties of undefined (reading 'toString')";
    expect(result).toEqual(
      messages.error.answerError(
        new TypeError(errorTitle),
        datas,
        request_id,
        errorTitle,
        undefined,
      ),
    );
  });
  it('Must return success', async () => {
    mocksImplementation.hiveTxUtils.getData({
      dynamicGlobalProperties: dynamic.globalProperties,
    });
    const mHiveTxSendOp = jest
      .spyOn(HiveTxUtils, 'sendOperation')
      .mockResolvedValue(true);
    requestHandler.data.key = userData.one.nonEncryptKeys.active;
    const result = await broadcastDelegation(requestHandler, data);
    const { request_id, ...datas } = data;
    expect(result).toEqual(
      messages.success.broadcast(
        true,
        datas,
        request_id,
        chrome.i18n.getMessage('bgd_ops_delegate', [
          `${datas.amount} ${datas.unit}`,
          datas.delegatee,
          datas.username!,
        ]),
      ),
    );
    mHiveTxSendOp.mockRestore();
  });
});
