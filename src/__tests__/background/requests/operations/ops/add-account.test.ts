import { addAccount } from '@background/requests/operations/ops/add-account';
import { RequestAddAccount, RequestId } from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import addAccountMocks from 'src/__tests__/background/requests/operations/ops/mocks/add-account-mocks';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
describe('add-account tests:\n', () => {
  const { methods, constants, mocks, spies } = addAccountMocks;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  it('Must return message with no such account error', async () => {
    // mocks.client.database.getAccounts([]);
    //TODO mock getAccounts.
    const result = await addAccount(requestHandler, data);
    const { request_id, ...datas } = data;
    expect(result).toEqual({
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        error: true,
        result: false,
        success: false,
        data: datas,
        message: chrome.i18n.getMessage('bgd_ops_add_account_error_invalid'),
        request_id: request_id,
        publicKey: undefined,
      },
    });
  });
  it('Must return message with invalid account error if no keys on data', async () => {
    // mocks.client.database.getAccounts([accounts.extended]);
    //TODO mock get extended Account.
    mocks.getMk(mk.user.one);
    const cloneData = objects.clone(data) as RequestAddAccount & RequestId;
    cloneData.keys = {};
    const { request_id, ...datas } = cloneData;
    const result = await addAccount(requestHandler, cloneData);
    expect(result).toEqual({
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        error: true,
        result: false,
        success: false,
        data: datas,
        message: chrome.i18n.getMessage('bgd_ops_add_account_error'),
        request_id: request_id,
        publicKey: undefined,
      },
    });
  });
  it('Must return message with invalid account error if no mk', async () => {
    // mocks.client.database.getAccounts([accounts.extended]);
    //TODO mock get extended Account.
    mocks.getMk(null);
    const cloneData = objects.clone(data) as RequestAddAccount & RequestId;
    cloneData.keys = userData.one.nonEncryptKeys;
    const result = await addAccount(requestHandler, cloneData);
    const { request_id, ...datas } = cloneData;
    expect(result).toEqual({
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        error: true,
        result: false,
        success: false,
        data: datas,
        message: chrome.i18n.getMessage('bgd_ops_add_account_error'),
        request_id: request_id,
        publicKey: undefined,
      },
    });
  });
  it('Must throw an unhandled error if invalid active key', async () => {
    const cloneData = objects.clone(data) as RequestAddAccount & RequestId;
    cloneData.keys = userData.one.encryptKeys;
    await methods.tryBlock('Invalid active key', cloneData);
  });
  it('Must throw an unhandled error if invalid posting key', async () => {
    const cloneData = objects.clone(data) as RequestAddAccount & RequestId;
    cloneData.keys = {
      ...userData.one.nonEncryptKeys,
      posting: userData.one.encryptKeys.posting,
    };
    await methods.tryBlock('Invalid posting key', cloneData);
  });
  it('Must add account', async () => {
    // mocks.client.database.getAccounts([accounts.extended]);
    //TODO mock get extended Account.
    mocks.getMk(mk.user.one);
    mocks.getAccountsFromLocalStorage();
    const cloneData = objects.clone(data) as RequestAddAccount & RequestId;
    cloneData.keys = userData.one.nonEncryptKeys;
    const result = await addAccount(requestHandler, cloneData);
    const { request_id, ...datas } = cloneData;
    expect(spies.saveAccounts).toBeCalledTimes(1);
    expect(result).toEqual({
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        error: false,
        result: true,
        success: true,
        data: datas,
        message: chrome.i18n.getMessage('bgd_ops_add_account', [mk.user.one]),
        request_id: request_id,
        publicKey: undefined,
      },
    });
  });
});
