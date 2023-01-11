import { performOperation } from '@background/requests/operations';
import { KeychainRequestTypes } from '@interfaces/keychain.interface';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { ConversionUtils } from 'src/utils/conversion.utils';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import indexMocks from 'src/__tests__/background/requests/operations/mocks/index-mocks';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
describe('index tests:\n', () => {
  const { methods, constants, spies, mocks } = indexMocks;
  const { requestHandler, _data } = constants;
  methods.afterEach;
  methods.beforeEach;
  it('Must call logger', async () => {
    await performOperation(requestHandler, _data[1], 0, 'domain', false);
    expect(spies.logger.info).toBeCalledWith('-- PERFORMING TRANSACTION --');
    expect(spies.logger.log).toBeCalledWith(_data[1]);
  });

  it('Must return error if no key on handler', async () => {
    mocks.getExtendedAccount(accounts.extended);
    const data = _data.filter(
      (dat) => dat.type === KeychainRequestTypes.transfer,
    )[0];
    const message = "Cannot read properties of undefined (reading 'toString')";
    const error = new TypeError(message);
    requestHandler.data.request_id = data.request_id;
    await performOperation(requestHandler, data, 0, 'domain', false);
    const { request_id, ...datas } = data;
    expect(spies.sendMessage).toBeCalledWith({
      command: DialogCommand.ANSWER_REQUEST,
      msg: {
        success: false,
        error: error,
        result: undefined,
        publicKey: undefined,
        data: datas,
        message: message,
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

  it('Must call each type of request', async () => {
    const mHiveTxSendOp = jest
      .spyOn(HiveTxUtils, 'sendOperation')
      .mockResolvedValue(true);
    mocks.getExtendedAccount(accounts.extended);
    const fakeArrayResponse = [
      utilsT.fakeHbdConversionsResponse,
      utilsT.fakeHiveConversionsResponse,
    ];
    ConversionUtils.getConversionRequests = jest
      .fn()
      .mockResolvedValueOnce(fakeArrayResponse);
    ConversionUtils.sendConvert = jest.fn().mockResolvedValue(true);
    for (let i = 0; i < _data.length; i++) {
      const tab = 0;
      requestHandler.data.rpc = DefaultRpcs[0];
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      requestHandler.data.accounts = accounts.twoAccounts;
      await performOperation(requestHandler, _data[i], tab, 'domain', false);
      expect(spies.tabsSendMessage.mock.calls[0][0]).toBe(tab);
      const callingArg: any = spies.tabsSendMessage.mock.calls[0][1];
      const { msg } = callingArg;
      const { data } = msg;
      expect(data.type).toBe(_data[i].type);
      spies.tabsSendMessage.mockClear();
    }
    mHiveTxSendOp.mockRestore();
  });
});
