import { decodeMessage } from '@background/requests/operations/ops/decode-memo';
import decodeMemo from 'src/__tests__/background/requests/operations/ops/mocks/decode-memo';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('decode-memo tests:\n', () => {
  const { methods, constants, mocks, spies } = decodeMemo;
  const { requestHandler, data, confirmed, memo } = constants;
  methods.afterEach;
  methods.beforeEach;
  it.skip('Must return error if no key on handler', async () => {
    requestHandler.data.key = userData.one.nonEncryptKeys.memo;
    data.message = memo.encoded;
    const result = await decodeMessage(requestHandler, data);
    expect(result).toEqual({});
  });
});
