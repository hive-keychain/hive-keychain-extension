import { decodeMessage } from '@background/requests/operations/ops/decode-memo';
import { AssertionError } from 'assert';
import decodeMemo from 'src/__tests__/background/requests/operations/ops/mocks/decode-memo';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import memo from 'src/__tests__/utils-for-testing/data/memo';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('decode-memo tests:\n', () => {
  const { methods, constants } = decodeMemo;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  it('Must return success and decoded memo', async () => {
    requestHandler.data.key = userData.one.nonEncryptKeys.memo;
    data.message = memo._default.encoded;
    const result = await decodeMessage(requestHandler, data);
    const { request_id, ...datas } = data;
    expect(result).toEqual(
      messages.success.decoded(
        memo._default.decoded,
        datas,
        request_id,
        chrome.i18n.getMessage('bgd_ops_decode'),
      ),
    );
  });
  it('Must return error if no key on handler', async () => {
    requestHandler.data.key = undefined;
    data.message = memo._default.encoded;
    const result = await decodeMessage(requestHandler, data);
    const { request_id, ...datas } = data;
    expect(result).toEqual(
      messages.error.answerError(
        new AssertionError({
          expected: true,
          operator: '==',
          message: 'private_key is required',
        }),
        datas,
        request_id,
        chrome.i18n.getMessage('bgd_ops_decode_err'),
        null,
      ),
    );
  });
});
