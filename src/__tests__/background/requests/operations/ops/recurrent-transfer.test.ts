import { recurrentTransfer } from '@background/requests/operations/ops/recurrent-transfer';
import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import recurrentTransferMocks from 'src/__tests__/background/requests/operations/ops/mocks/recurrent-transfer-mocks';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('recurrent-transfer tests:\n', () => {
  const { methods, constants, spies, mocks } = recurrentTransferMocks;
  const { requestHandler, data } = constants;
  methods.afterEach;
  methods.beforeEach;
  describe('Without encrypted memo:\n', () => {
    it('Must call getUserKey', async () => {
      mocks.client.database.getAccounts([]);
      await recurrentTransfer(requestHandler, data);
      expect(spies.getUserKey).toBeCalledWith(
        data.username!,
        KeychainKeyTypesLC.active,
      );
    });
    it('Must return error if no key on handler', async () => {
      const error = 'private key should be a Buffer';
      const result = await recurrentTransfer(requestHandler, data);
      methods.assert.error(result, new TypeError(error), data, error);
    });
    it('Must return sucess on start recurrent', async () => {
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const result = await recurrentTransfer(requestHandler, data);
      methods.assert.success(
        result,
        chrome.i18n.getMessage('bgd_ops_recurrent_transfer'),
      );
    });
    it('Must return sucess on stop recurrent', async () => {
      data.amount = '0';
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const result = await recurrentTransfer(requestHandler, data);
      methods.assert.success(
        result,
        chrome.i18n.getMessage('bgd_ops_stop_recurrent_transfer'),
      );
    });
  });
  describe('With encrypted memo', () => {
    it('Must call getUserKey', async () => {
      data.memo = '# To encrypt!';
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      await recurrentTransfer(requestHandler, data);
      expect(spies.getUserKey).toBeCalledWith(
        data.username!,
        KeychainKeyTypesLC.memo,
      );
    });
    it('Must return error if no receiver data', async () => {
      const error = 'Could not encode memo.';
      data.memo = '# To encrypt!';
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const result = await recurrentTransfer(requestHandler, data);
      methods.assert.error(result, new Error(error), data, error);
    });
    it('Must return error if no memoKey data', async () => {
      mocks.client.database.getAccounts(accounts.asArray.extended);
      const error = 'Could not encode memo.';
      data.memo = '# To encrypt!';
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const result = await recurrentTransfer(requestHandler, data);
      methods.assert.error(result, new Error(error), data, error);
    });
    it('Must return success on started recurrent', async () => {
      requestHandler.data.accounts = accounts.twoAccounts;
      mocks.client.database.getAccounts(accounts.asArray.extended);
      data.amount = '1000';
      data.memo = '# To encrypt!';
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const result = await recurrentTransfer(requestHandler, data);
      methods.assert.success(
        result,
        chrome.i18n.getMessage('bgd_ops_recurrent_transfer'),
      );
    });
    it('Must return success on stop recurrent', async () => {
      requestHandler.data.accounts = accounts.twoAccounts;
      mocks.client.database.getAccounts(accounts.asArray.extended);
      data.memo = '# To encrypt!';
      data.amount = '0';
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const result = await recurrentTransfer(requestHandler, data);
      methods.assert.success(
        result,
        chrome.i18n.getMessage('bgd_ops_stop_recurrent_transfer'),
      );
    });
  });
});
