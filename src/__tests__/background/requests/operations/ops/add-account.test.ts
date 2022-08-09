import { addAccount } from '@background/requests/operations/ops/add-account';
import { RequestAddAccount, RequestId } from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import addAccountMocks from 'src/__tests__/background/requests/operations/ops/mocks/add-account-mocks';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
describe('add-account tests:\n', () => {
  const { methods, constants, mocks } = addAccountMocks;
  const { requestHandler, data, dataNoId } = constants;
  methods.afterEach;
  beforeEach(() => {
    mocks.getUILanguage();
    mocks.i18n();
  });
  it('Must return message with no such account error', async () => {
    mocks.client.database.getAccounts([]);
    const result = await addAccount(requestHandler, data);
    expect(result).toEqual({
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        error: true,
        result: false,
        success: false,
        data: dataNoId,
        message: chrome.i18n.getMessage('bgd_ops_add_account_error_invalid'),
        request_id: data.request_id,
        publicKey: undefined,
      },
    });
  });
  it('Must return message with invalid account error if no keys on data', async () => {
    mocks.client.database.getAccounts([accounts.extended]);
    mocks.getMk(mk.user.one);
    const result = await addAccount(requestHandler, data);
    expect(result).toEqual({
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        error: true,
        result: false,
        success: false,
        data: dataNoId,
        message: chrome.i18n.getMessage('bgd_ops_add_account_error'),
        request_id: data.request_id,
        publicKey: undefined,
      },
    });
  });
  it('Must return message with invalid account error if no mk', async () => {
    mocks.client.database.getAccounts([accounts.extended]);
    mocks.getMk(null);
    const cloneData = objects.clone(data) as RequestAddAccount & RequestId;
    cloneData.keys = userData.one.nonEncryptKeys;
    const result = await addAccount(requestHandler, cloneData);
    expect(result).toEqual({
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        error: true,
        result: false,
        success: false,
        data: { ...dataNoId, keys: userData.one.nonEncryptKeys },
        message: chrome.i18n.getMessage('bgd_ops_add_account_error'),
        request_id: data.request_id,
        publicKey: undefined,
      },
    });
  });
  //mock as empty:
  //    - AccountUtils.getAccountsFromLocalStorage
  //    - AccountUtils.saveAccounts
  //    and just check calling params on both.
  it.todo('Must add add account');
});
