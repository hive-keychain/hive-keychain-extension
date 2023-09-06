import MkModule from '@background/mk.module';
import { addAccount } from '@background/requests/operations/ops/add-account';
import { RequestsHandler } from '@background/requests/request-handler';
import {
  KeychainRequestTypes,
  RequestAddAccount,
  RequestAddAccountKeys,
  RequestId,
} from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import AccountUtils from 'src/utils/account.utils';

describe('add-account tests:\n', () => {
  const data = {
    domain: 'domain',
    username: mk.user.one,
    type: KeychainRequestTypes.addAccount,
    keys: userData.one.nonEncryptKeys as RequestAddAccountKeys,
    request_id: 1,
  } as RequestAddAccount & RequestId;

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  beforeEach(() => {
    jest.spyOn(chrome.i18n, 'getUILanguage').mockReturnValueOnce('en-US');
    chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom);
  });

  it('Must return error with no such account', async () => {
    AccountUtils.getExtendedAccount = jest
      .fn()
      .mockResolvedValueOnce(undefined);
    const requestHandler = new RequestsHandler();
    const result = await addAccount(requestHandler, data);
    const { request_id, ...datas } = data;
    expect(result).toEqual({
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        success: false,
        error: true,
        result: false,
        data: datas,
        message: chrome.i18n.getMessage('bgd_ops_add_account_error_invalid'),
        request_id: request_id,
        publicKey: undefined,
      },
    });
  });

  it('Must return message with invalid account error if no keys on data', async () => {
    AccountUtils.getExtendedAccount = jest
      .fn()
      .mockResolvedValueOnce(accounts.extended);
    jest.spyOn(MkModule, 'getMk').mockResolvedValueOnce(mk.user.one);
    const cloneData = objects.clone(data) as RequestAddAccount & RequestId;
    cloneData.keys = {};
    const { request_id, ...datas } = cloneData;
    const requestHandler = new RequestsHandler();
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

  it('Must return message with invalid account if no mk', async () => {
    AccountUtils.getExtendedAccount = jest
      .fn()
      .mockResolvedValueOnce(accounts.extended);
    jest.spyOn(MkModule, 'getMk').mockResolvedValueOnce(null);
    const cloneData = objects.clone(data) as RequestAddAccount & RequestId;
    cloneData.keys = userData.one.nonEncryptKeys;
    const requestHandler = new RequestsHandler();
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
    try {
      AccountUtils.getExtendedAccount = jest
        .fn()
        .mockResolvedValueOnce(accounts.extended);
      jest.spyOn(MkModule, 'getMk').mockResolvedValueOnce(null);
      const cloneData = objects.clone(data) as RequestAddAccount & RequestId;
      cloneData.keys = userData.one.encryptKeys;
      const requestHandler = new RequestsHandler();
      await addAccount(requestHandler, cloneData);
    } catch (error) {
      expect(error).toEqual(new Error('Invalid active key'));
    }
  });

  it('Must throw an unhandled error if invalid posting key', async () => {
    try {
      AccountUtils.getExtendedAccount = jest
        .fn()
        .mockResolvedValueOnce(accounts.extended);
      jest.spyOn(MkModule, 'getMk').mockResolvedValueOnce(null);
      const cloneData = objects.clone(data) as RequestAddAccount & RequestId;
      cloneData.keys = {
        ...userData.one.nonEncryptKeys,
        posting: userData.one.encryptKeys.posting,
      };
      const requestHandler = new RequestsHandler();
      await addAccount(requestHandler, cloneData);
    } catch (error) {
      expect(error).toEqual(new Error('Invalid posting key'));
    }
  });

  it('Must add account', async () => {
    AccountUtils.getExtendedAccount = jest
      .fn()
      .mockResolvedValueOnce(accounts.extended);
    jest.spyOn(MkModule, 'getMk').mockResolvedValueOnce(mk.user.one);
    jest
      .spyOn(AccountUtils, 'getAccountsFromLocalStorage')
      .mockResolvedValueOnce(accounts.twoAccounts);
    const sSaveAccounts = jest
      .spyOn(AccountUtils, 'saveAccounts')
      .mockResolvedValue(undefined);
    const cloneData = objects.clone(data) as RequestAddAccount & RequestId;
    cloneData.keys = userData.one.nonEncryptKeys;
    const requestHandler = new RequestsHandler();
    const result = await addAccount(requestHandler, cloneData);
    const { request_id, ...datas } = cloneData;
    expect(sSaveAccounts).toBeCalledTimes(1);
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
