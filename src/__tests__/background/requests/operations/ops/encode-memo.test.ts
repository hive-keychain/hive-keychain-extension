import { encodeMessage } from '@background/requests/operations/ops/encode-memo';
import { KeychainKeyTypes } from '@interfaces/keychain.interface';
import encodeMemo from 'src/__tests__/background/requests/operations/ops/mocks/encode-memo';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import memo from 'src/__tests__/utils-for-testing/data/memo';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import { ResultOperation } from 'src/__tests__/utils-for-testing/interfaces/assertions';
describe('encode-memo tests:\n', () => {
  const { methods, constants, mocks, spies } = encodeMemo;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  it('Must return error if no key on handler', async () => {
    mocks.client.database.getAccounts([accounts.extended]);
    data.message = memo._default.decoded;
    const resultOperation = (await encodeMessage(
      requestHandler,
      data,
    )) as ResultOperation;
    const { success, result, error, ...datas } = resultOperation.msg;
    expect(success).toBe(false);
    expect(result).toBeNull();
    expect((error as TypeError).message).toContain('private_key');
  });
  it('Must return error if receiver not received', async () => {
    mocks.client.database.getAccounts([]);
    requestHandler.data.key = userData.one.nonEncryptKeys.memo;
    data.message = memo._default.decoded;
    const resultOperation = (await encodeMessage(
      requestHandler,
      data,
    )) as ResultOperation;
    const { success, result, error, ...datas } = resultOperation.msg;
    expect(success).toBe(false);
    expect(result).toBeNull();
    expect((error as TypeError).message).toContain('memo_key');
  });
  it('Must use memo_key if method as memo', async () => {
    mocks.client.database.getAccounts([accounts.extended]);
    requestHandler.data.key = userData.one.nonEncryptKeys.memo;
    data.message = memo._default.decoded;
    await encodeMessage(requestHandler, data);
    expect(spies.encode).toBeCalledWith(
      userData.one.nonEncryptKeys.memo,
      userData.one.encryptKeys.memo,
      data.message,
    );
  });
  it('Must use key_auths if method not memo', async () => {
    mocks.client.database.getAccounts([accounts.extended]);
    requestHandler.data.key = userData.one.nonEncryptKeys.memo;
    data.method = KeychainKeyTypes.posting;
    data.message = memo._default.decoded;
    await encodeMessage(requestHandler, data);
    expect(spies.encode).toBeCalledWith(
      userData.one.nonEncryptKeys.memo,
      accounts.extended.posting.key_auths[0][0],
      data.message,
    );
  });
  it('Must return success', async () => {
    mocks.client.database.getAccounts([accounts.extended]);
    requestHandler.data.key = userData.one.nonEncryptKeys.memo;
    data.message = memo._default.decoded;
    data.method = KeychainKeyTypes.memo;
    const result = await encodeMessage(requestHandler, data);
    const _newlyGenerated = result.msg.result;
    const { request_id, ...datas } = data;
    expect(result).toEqual(
      messages.success.answerSucess(
        _newlyGenerated,
        datas,
        request_id,
        chrome.i18n.getMessage('bgd_ops_encode'),
        null,
      ),
    );
  });
});
