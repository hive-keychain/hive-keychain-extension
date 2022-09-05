import { convert } from '@background/requests/operations/ops/convert';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import convertMocks from 'src/__tests__/background/requests/operations/ops/mocks/convert-mocks';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import testsI18n from 'src/__tests__/utils-for-testing/i18n/tests-i18n';
describe('convert tests:\n', () => {
  const { methods, constants, mocks } = convertMocks;
  const { requestHandler, data, confirmed } = constants;
  methods.afterEach;
  methods.beforeEach;
  beforeEach(() => {
    mocks.client.database.call([{ requestid: 1 }], [{ requestid: 2 }]);
    requestHandler.data.rpc = DefaultRpcs[0];
  });
  it('Must return error if no key on handler', async () => {
    const result = await convert(requestHandler, data);
    const { request_id, ...datas } = data;
    expect(result).toEqual(messages.error.keyBuffer(datas, request_id));
  });
  it('Must catch error on collateralized', async () => {
    mocks.client.database.call([{ requestid: 1 }], undefined);
    const err_description = 'Promise rejected!';
    const error = new Error(err_description);
    requestHandler.setKeys(
      userData.one.nonEncryptKeys.memo,
      userData.one.encryptKeys.active,
    );
    requestHandler.getHiveClient().broadcast.sendOperations = jest
      .fn()
      .mockRejectedValue(error);
    data.collaterized = true;
    const { request_id, ...datas } = data;
    const result = await convert(requestHandler, data);
    expect(result).toEqual(
      messages.error.answerError(
        error,
        datas,
        request_id,
        `${testsI18n.get('bgd_ops_error')} : ${err_description}`,
        undefined,
      ),
    );
  });
  it('Must return success with a non collateralized convertion', async () => {
    requestHandler.setKeys(
      userData.one.nonEncryptKeys.memo,
      userData.one.encryptKeys.active,
    );
    mocks.client.broadcast.sendOperations(confirmed);
    const result = await convert(requestHandler, data);
    const { request_id, ...datas } = data;
    expect(result).toEqual(
      messages.success.convert(confirmed, datas, request_id, data.collaterized),
    );
  });
  it('Must return success with a collateralized convertion', async () => {
    requestHandler.setKeys(
      userData.one.nonEncryptKeys.memo,
      userData.one.encryptKeys.active,
    );
    mocks.client.broadcast.sendOperations(confirmed);
    data.collaterized = true;
    const result = await convert(requestHandler, data);
    const { request_id, ...datas } = data;
    expect(result).toEqual(
      messages.success.convert(confirmed, datas, request_id, data.collaterized),
    );
  });
});
