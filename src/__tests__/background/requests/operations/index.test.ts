import { performOperation } from '@background/requests/operations';
import { KeychainRequestTypes } from '@interfaces/keychain.interface';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { requestsData } from 'src/__tests__/background/requests/operations/mocks/index-data';
import indexMocks from 'src/__tests__/background/requests/operations/mocks/index-mocks';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('index tests:\n', () => {
  const { methods, constants, spies } = indexMocks;
  const { requestHandler, _data } = constants;
  methods.afterEach;
  methods.beforeEach;
  it('Must call logger', async () => {
    await performOperation(requestHandler, _data[1], 0, 'domain', false);
    expect(spies.logger.info).toBeCalledWith('-- PERFORMING TRANSACTION --');
    expect(spies.logger.log).toBeCalledWith(_data[1]);
  });
  it('Must call logger and sendMessage', async () => {
    const data = _data.filter(
      (dat) => dat.type === KeychainRequestTypes.transfer,
    )[0];
    const error = new TypeError('private key should be a Buffer');
    requestHandler.data.request_id = data.request_id;
    await performOperation(requestHandler, data, 0, 'domain', false);
    const { request_id, ...datas } = data;
    expect(spies.logger.error).toBeCalledWith(error);
    expect(spies.sendMessage).toBeCalledWith({
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        success: false,
        error: error,
        result: undefined,
        publicKey: undefined,
        data: datas,
        message: chrome.i18n.getMessage('bgd_ops_error_broadcasting'),
        request_id: request_id,
      },
    });
  });
  it('Must call addToWhitelist,reset and removeWindow', async () => {
    const data = _data[1];
    requestHandler.data.key = userData.one.nonEncryptKeys.active;
    requestHandler.data.windowId = 1;
    await performOperation(requestHandler, data, 0, 'domain', true);
    expect(spies.addToWhitelist).toBeCalledWith(
      data.username!,
      'domain',
      data.type,
    );
    expect(spies.removeWindow).toBeCalledWith(requestHandler.data.windowId);
    expect(spies.reset).toBeCalledWith(false);
  });
  it.skip('Must call each type of request', async () => {
    //loop TODO.
    for (let i = 0; i < requestsData.length; i++) {
      const tab = 0;
      requestHandler.data.rpc = DefaultRpcs[0];
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      requestHandler.data.accounts = accounts.twoAccounts;
      await performOperation(
        requestHandler,
        requestsData[i].data,
        tab,
        'domain',
        false,
      );
      expect(spies.tabsSendMessage.mock.calls[0][0]).toBe(tab);
      const callingArg: any = spies.tabsSendMessage.mock.calls[0][1];
      console.log(callingArg);
      const { msg } = callingArg;
      const { data } = msg;
      expect(data.type).toBe(requestsData[i].data.type);
      //expect(msg.success).toBe(true);
      spies.tabsSendMessage.mockClear();
    }
  });
});
