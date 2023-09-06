import { RequestsHandler } from '@background/requests/request-handler';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { KeychainRequestWrapper } from 'hive-keychain-commons';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import { HiveEngineConfigData } from 'src/__tests__/utils-for-testing/data/hive-engine-config';
import keychainRequest from 'src/__tests__/utils-for-testing/data/keychain-request';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import * as DialogLifeCycle from 'src/background/requests/dialog-lifecycle';
import * as Init from 'src/background/requests/init';
import Config from 'src/config';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('index tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  it('Must create a new RequestHandler Instance', () => {
    const requestHandler = new RequestsHandler();
    expect(requestHandler).toBeInstanceOf(RequestsHandler);
  });

  it('Must match this values by default', () => {
    expect(keychainRequest.requestHandler.data).toEqual({ confirmed: false });
    expect(keychainRequest.requestHandler.hiveEngineConfig).toEqual(
      Config.hiveEngine,
    );
  });

  it('Must return handler if no values on local storage', async () => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(undefined);
    const sGetValueFromLocalStorage = jest.spyOn(
      LocalStorageUtils,
      'getValueFromLocalStorage',
    );
    const _requestHandler = await RequestsHandler.getFromLocalStorage();
    expect(sGetValueFromLocalStorage).toBeCalledWith(
      LocalStorageKeyEnum.__REQUEST_HANDLER,
    );
    expect(_requestHandler).toBeInstanceOf(RequestsHandler);
  });

  it('Must initialize parameters', async () => {
    const requestHandler = new RequestsHandler();
    requestHandler.initializeParameters(
      accounts.twoAccounts,
      DefaultRpcs[1],
      {},
    );
    expect(requestHandler.data.accounts).toEqual(accounts.twoAccounts);
    expect(requestHandler.hiveEngineConfig).toEqual(
      HiveEngineConfigData.byDefault,
    );
  });

  it('Must not reset resetWinId and reset data', () => {
    const sSaveValueInLocalStorage = jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockReturnValue(undefined);
    const requestHandler = new RequestsHandler();
    requestHandler.reset(false);
    expect(requestHandler.data).toEqual({
      confirmed: false,
      windowId: undefined,
    });
    expect(sSaveValueInLocalStorage).toBeCalledWith(
      LocalStorageKeyEnum.__REQUEST_HANDLER,
      {
        confirmed: false,
        windowId: undefined,
      },
    );
  });

  it('Must set windowId and call removeWindow', () => {
    const sRemoveWindow = jest.spyOn(DialogLifeCycle, 'removeWindow');
    const requestHandler = new RequestsHandler();
    requestHandler.setWindowId(1);
    expect(requestHandler.data.windowId).toBe(1);
    requestHandler.closeWindow();
    expect(sRemoveWindow).toHaveBeenNthCalledWith(1, 1);
  });

  it('Must reset resetWinId', async () => {
    const sRemoveFromLocalStorage = jest
      .spyOn(LocalStorageUtils, 'removeFromLocalStorage')
      .mockResolvedValue(undefined);
    const requestHandler = new RequestsHandler();
    requestHandler.reset(true);
    expect(sRemoveFromLocalStorage).toBeCalledWith(
      LocalStorageKeyEnum.__REQUEST_HANDLER,
    );
  });

  it('Must set confirmed', () => {
    const requestHandler = new RequestsHandler();
    [false, true].forEach((value) => {
      requestHandler.setConfirmed(value);
      expect(requestHandler.data.confirmed).toBe(value);
    });
  });

  it('Must set keys', () => {
    const requestHandler = new RequestsHandler();
    requestHandler.setKeys(
      userData.one.nonEncryptKeys.posting,
      userData.one.encryptKeys.posting,
    );
    expect(requestHandler.data.key).toBe(userData.one.nonEncryptKeys.posting);
    expect(requestHandler.data.publicKey).toBe(
      userData.one.encryptKeys.posting,
    );
  });

  it('Must call init', () => {
    const sInit = jest.spyOn(Init, 'default').mockResolvedValue(undefined);
    const requestHandler = new RequestsHandler();
    requestHandler.sendRequest(
      { tab: { id: 1 } } as chrome.runtime.MessageSender,
      {
        domain: 'domain',
        request: keychainRequest.noValues.decode,
      } as KeychainRequestWrapper,
    );
    expect(sInit).toBeCalledWith(
      keychainRequest.noValues.decode,
      requestHandler.data.tab,
      'domain',
      requestHandler,
    );
  });
});
