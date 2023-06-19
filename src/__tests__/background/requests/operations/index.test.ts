import MkModule from '@background/mk.module';
import { performOperation } from '@background/requests/operations';
import { RequestsHandler } from '@background/requests/request-handler';
import {
  KeychainRequest,
  KeychainRequestTypes,
  RequestAddAccount,
  RequestAddAccountKeys,
  RequestId,
} from '@interfaces/keychain.interface';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import conversions from 'src/__tests__/utils-for-testing/data/conversions';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import * as DialogLifeCycle from 'src/background/requests/dialog-lifecycle';
import AccountUtils from 'src/utils/account.utils';
import { ConversionUtils } from 'src/utils/conversion.utils';
import { DynamicGlobalPropertiesUtils } from 'src/utils/dynamic-global-properties.utils';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import Logger from 'src/utils/logger.utils';
import * as PreferencesUtils from 'src/utils/preferences.utils';

describe('index tests:\n', () => {
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
    chrome.i18n.getUILanguage = jest.fn().mockReturnValue('en-US');
    chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom);
    AccountUtils.getAccountsFromLocalStorage = jest
      .fn()
      .mockResolvedValue(accounts.twoAccounts);
    MkModule.getMk = jest.fn().mockResolvedValue(mk.user.one);
    AccountUtils.getExtendedAccount = jest
      .fn()
      .mockResolvedValue(accounts.extended);
  });

  it('Must call logger', async () => {
    const sLoggerInfo = jest.spyOn(Logger, 'info');
    const sLoggerLog = jest.spyOn(Logger, 'log');
    const requestHandler = new RequestsHandler();
    requestHandler.data.rpc = DefaultRpcs[1];
    const keychainRequestGeneric = keychainRequest.getWithAllGenericData();
    keychainRequestGeneric.type = KeychainRequestTypes.transfer;
    await performOperation(
      requestHandler,
      keychainRequestGeneric,
      0,
      'domain',
      false,
    );
    expect(sLoggerInfo).toBeCalledWith('-- PERFORMING TRANSACTION --');
    expect(sLoggerLog).toBeCalledWith(keychainRequestGeneric);
  });

  it('Must return error if no key on handler', async () => {
    const sSendMessage = jest.spyOn(chrome.tabs, 'sendMessage');
    const requestHandler = new RequestsHandler();
    const cloneData = objects.clone(data) as KeychainRequest;
    cloneData.type = KeychainRequestTypes.transfer;
    const error = new Error('html_popup_error_while_signing_transaction');
    requestHandler.data.rpc = DefaultRpcs[1];
    await performOperation(requestHandler, cloneData, 0, 'domain', false);
    const { request_id, ...datas } = cloneData;
    expect(sSendMessage).toBeCalledWith(0, {
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        success: false,
        error: error,
        result: undefined,
        publicKey: undefined,
        data: datas,
        message: chrome.i18n.getMessage(
          'html_popup_error_while_signing_transaction',
        ),
        request_id: request_id,
      },
    });
  });

  it('Must call addToWhitelist, reset and removeWindow', async () => {
    const sAddToWhitelist = jest.spyOn(PreferencesUtils, 'addToWhitelist');
    const sRemoveWindow = jest.spyOn(DialogLifeCycle, 'removeWindow');
    const requestHandler = new RequestsHandler();
    const sReset = jest.spyOn(requestHandler, 'reset');
    const cloneData = objects.clone(data) as KeychainRequest;
    requestHandler.data.key = userData.one.nonEncryptKeys.active;
    requestHandler.data.windowId = 1;
    requestHandler.data.rpc = DefaultRpcs[1];
    await performOperation(requestHandler, cloneData, 0, 'domain', true);
    expect(sAddToWhitelist).toBeCalledWith(
      cloneData.username!,
      'domain',
      cloneData.type,
    );
    expect(sRemoveWindow).toBeCalledWith(requestHandler.data.windowId);
    expect(sReset).toBeCalledWith(false);
  });

  it('Must call each type of request', async () => {
    jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValue({
      confirmed: true,
      tx_id: '45dfd45ds54ds65f4sd5',
      id: 'id',
    });
    ConversionUtils.getConversionRequests = jest
      .fn()
      .mockResolvedValue([
        conversions.fakeHbdConversionsResponse,
        conversions.fakeHiveConversionsResponse,
      ]);
    ConversionUtils.sendConvert = jest.fn().mockResolvedValue(true);
    DynamicGlobalPropertiesUtils.getDynamicGlobalProperties = jest
      .fn()
      .mockResolvedValue(dynamic.globalProperties);

    const RequestTypeList = Object.keys(KeychainRequestTypes).filter(
      (requestType) => requestType !== 'signedCall',
    );

    const sSendMessage = jest.spyOn(chrome.tabs, 'sendMessage');

    for (let i = 0; i < RequestTypeList.length; i++) {
      const keychainRequestGeneric = keychainRequest.getWithAllGenericData();
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      requestHandler.data.rpc = DefaultRpcs[1];
      keychainRequestGeneric.type = RequestTypeList[i] as KeychainRequestTypes;
      await performOperation(
        requestHandler,
        keychainRequestGeneric,
        0,
        'domain',
        false,
      );
      expect(JSON.stringify(sSendMessage.mock.calls[0][1])).toContain(
        RequestTypeList[i],
      );
      sSendMessage.mockReset();
    }
  });
});
