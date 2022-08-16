import { broadcastTransfer } from '@background/requests/operations/ops/transfer';
import transferMocks from 'src/__tests__/background/requests/operations/ops/mocks/transfer-mocks';
import { RPCError } from 'src/__tests__/utils-for-testing/classes/errors/rpc';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('transfer tests:\n', () => {
  const { methods, constants, spies, mocks } = transferMocks;
  const { requestHandler, data, params, confirmed } = constants;
  methods.afterEach;
  methods.beforeEach;
  describe('broadcastTransfer cases:\n', () => {
    describe('No encrypted memo:\n', () => {
      it('Must call getUserKey', async () => {
        await broadcastTransfer(requestHandler, data);
        expect(spies.getUserKey).toBeCalledTimes(2);
        expect(spies.getUserKey).toBeCalledWith(...params.getUserKey[0]);
      });
      it('Must return error if no key on handler', async () => {
        const errorMsg = chrome.i18n.getMessage('bgd_ops_error_broadcasting');
        const result = await broadcastTransfer(requestHandler, data);
        methods.assert.error(result, new TypeError(), data, errorMsg);
      });
      it('Must return error if receiver not found', async () => {
        data.currency = 'HIVE';
        data.amount = '0.001';
        data.to = 'theghost9999';
        const rpcError = new RPCError(`Cannot find account @${data.to}.`, {
          stack: [{ context: { method: 'get_account' } }],
        });
        mocks.client.broadcast.transfer('error', rpcError);
        requestHandler.data.key = userData.one.nonEncryptKeys.active;
        requestHandler.data.accounts = accounts.twoAccounts;
        const result = await broadcastTransfer(requestHandler, data);
        methods.assert.error(
          result,
          rpcError,
          data,
          chrome.i18n.getMessage('bgd_ops_transfer_get_account', [data.to]),
        );
      });
      it('Must return error if not enough balance', async () => {
        data.currency = 'HIVE';
        data.amount = '1000000.000';
        data.to = 'theghost1980';
        const rpcError = new RPCError(
          `Insufficient balance ${data.amount} ${data.currency} on account @${data.username}.`,
          {
            stack: [{ context: { method: 'adjust_balance' } }],
          },
        );
        mocks.client.broadcast.transfer('error', rpcError);
        requestHandler.data.key = userData.one.nonEncryptKeys.active;
        requestHandler.data.accounts = accounts.twoAccounts;
        const result = await broadcastTransfer(requestHandler, data);
        methods.assert.error(
          result,
          rpcError,
          data,
          chrome.i18n.getMessage('bgd_ops_transfer_adjust_balance', [
            data.currency,
            data.username!,
          ]),
        );
      });
      it('Must return default error if not found on switch cases', async () => {
        data.currency = 'HIVE';
        data.amount = '1000';
        data.to = 'theghost1980';
        const rpcError = new RPCError(`Wrong decimal places, please validate`, {
          stack: [{ context: { method: 'string_to_asset_num' } }],
        });
        mocks.client.broadcast.transfer('error', rpcError);
        requestHandler.data.key = userData.one.nonEncryptKeys.active;
        requestHandler.data.accounts = accounts.twoAccounts;
        const result = await broadcastTransfer(requestHandler, data);
        methods.assert.error(
          result,
          rpcError,
          data,
          chrome.i18n.getMessage('bgd_ops_error_broadcasting'),
        );
      });
      it('Must return success', async () => {
        mocks.client.broadcast.transfer('success', confirmed);
        requestHandler.data.key = userData.one.nonEncryptKeys.active;
        requestHandler.data.accounts = accounts.twoAccounts;
        const result = await broadcastTransfer(requestHandler, data);
        methods.assert.success(
          result,
          chrome.i18n.getMessage('bgd_ops_transfer_success', [
            data.amount,
            data.currency,
            data.username!,
            data.to,
          ]),
        );
      });
    });
    describe('Encrypted memo:\n', () => {
      it('Must return error if no memoKey', async () => {
        mocks.client.database.getAccounts([accounts.extended]);
        const error = 'Could not encode memo.';
        requestHandler.data.key = userData.one.nonEncryptKeys.active;
        requestHandler.data.accounts = [];
        data.to = 'nonExistentUser';
        data.memo = '# To Encrypt this memo!';
        const result = await broadcastTransfer(requestHandler, data);
        methods.assert.error(
          result,
          new Error(error),
          data,
          chrome.i18n.getMessage('bgd_ops_error_broadcasting'),
        );
      });
      it('Must return error if receiver not found', async () => {
        mocks.client.database.getAccounts([]);
        const error = 'Could not encode memo.';
        requestHandler.data.key = userData.one.nonEncryptKeys.active;
        requestHandler.data.accounts = accounts.twoAccounts;
        data.to = 'nonExistentUser';
        data.memo = '# To Encrypt this memo!';
        const result = await broadcastTransfer(requestHandler, data);
        methods.assert.error(
          result,
          new Error(error),
          data,
          chrome.i18n.getMessage('bgd_ops_error_broadcasting'),
        );
      });
      it('Must return success', async () => {
        mocks.client.database.getAccounts([accounts.extended]);
        requestHandler.data.key = userData.one.nonEncryptKeys.active;
        requestHandler.data.accounts = accounts.twoAccounts;
        data.to = 'theghost1980';
        data.memo = '# To Encrypt this memo! Get the Quan!!';
        const result = await broadcastTransfer(requestHandler, data);
        methods.assert.success(
          result,
          chrome.i18n.getMessage('bgd_ops_transfer_success', [
            data.amount,
            data.currency,
            data.username!,
            data.to,
          ]),
        );
      });
    });
  });
});
