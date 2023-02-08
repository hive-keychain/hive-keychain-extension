import { convert } from '@background/requests/operations/ops/convert';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import convertMocks from 'src/__tests__/background/requests/operations/ops/mocks/convert-mocks';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import { ResultOperation } from 'src/__tests__/utils-for-testing/interfaces/assertions';
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
    const resultOperation = (await convert(
      requestHandler,
      data,
    )) as ResultOperation;
    const { success, result, error, ...datas } = resultOperation.msg;
    expect(success).toBe(false);
    expect(result).toBeUndefined();
    expect((error as TypeError).message).toContain('private key');
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
