import { RequestsHandler } from '@background/requests';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import Config from 'src/config';
import indexMocks from 'src/__tests__/background/requests/mocks';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
describe('index tests:\n', () => {
  const { spies, constants, methods } = indexMocks;
  const { LSKEnum, requestData, hiveEngineConfigByDefault } = constants;
  const { resetData, keys, sender, msg } = constants;
  const requestHandler = new RequestsHandler();
  methods.afterEach;
  it('Must create a new RequestHandler Instance', () => {
    expect(requestHandler).toBeInstanceOf(RequestsHandler);
  });
  it('Must match this values by default', () => {
    expect(requestHandler.data).toEqual({ confirmed: false });
    expect(requestHandler.hiveEngineConfig).toEqual(Config.hiveEngine);
  });
  it('Must return handler if no values on local storage', async () => {
    spies.getValueFromLocalStorage(undefined);
    const _requestHandler = await RequestsHandler.getFromLocalStorage();
    expect(spies.getValueFromLocalStorage(undefined)).toBeCalledWith(LSKEnum);
    expect(_requestHandler).toBeInstanceOf(RequestsHandler);
  });
  //TODO tests: uncomment when add the conditional on setupRpc.
  // it('Must init handler by calling setupRpc', async () => {
  //   const requestDataRpc1 = { rpc: DefaultRpcs[1] } as RequestDataMocks;
  //   spies.getValueFromLocalStorage(requestDataRpc1);
  //   const _requestHandler = await RequestsHandler.getFromLocalStorage();
  //   expect(_requestHandler).toBeInstanceOf(RequestsHandler);
  //   expect(spies.getValueFromLocalStorage(undefined)).toBeCalledWith(LSKEnum);
  //   expect(_requestHandler.hiveClient.address).toBe(DefaultRpcs[1].uri);
  // });
  it('Must initialize parameters', async () => {
    requestHandler.initializeParameters(
      accounts.twoAccounts,
      DefaultRpcs[1],
      {},
    );
    expect(requestHandler.data.accounts).toEqual(accounts.twoAccounts);
    expect(requestHandler.hiveEngineConfig).toEqual(hiveEngineConfigByDefault);
    //TODO when setupRpc updated, this must change to check on initializeParam rpc assigned.
  });
  it('Must not reset resetWinId and reset data', () => {
    requestHandler.reset(false);
    expect(requestHandler.data).toEqual(resetData);
    expect(spies.saveValueInLocalStorage).toBeCalledWith(LSKEnum, resetData);
  });
  it('Must set windowId and call removeWindow', () => {
    requestHandler.setWindowId(1);
    expect(requestHandler.data.windowId).toBe(1);
    requestHandler.closeWindow();
    expect(spies.removeWindow.mock.calls[0][0]).toBe(1);
  });
  it('Must reset resetWinId', async () => {
    requestHandler.reset(true);
    expect(spies.removeFromLocalStorage).toBeCalledWith(LSKEnum);
  });
  it('Must set confirmed', () => {
    [false, true].forEach((value) => {
      requestHandler.setConfirmed(value);
      expect(requestHandler.data.confirmed).toBe(value);
    });
  });
  it('Must set keys', () => {
    requestHandler.setKeys(keys.key, keys.publicKey);
    expect(requestHandler.data.key).toBe(keys.key);
    expect(requestHandler.data.publicKey).toBe(keys.publicKey);
  });
  it('Must call init', () => {
    requestHandler.sendRequest(sender, msg);
    expect(spies.init).toBeCalledWith(
      msg.request,
      requestHandler.data.tab,
      msg.domain,
      requestHandler,
    );
  });
});
