import { broadcastTransfer } from '@background/requests/operations/ops/transfer';
import transferMocks from 'src/__tests__/background/requests/operations/ops/mocks/transfer-mocks';
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
      it('Must return error ----- ', async () => {
        //TODO:
        // if quenting or cedric do not have other ideas:
        //  -> just implement for now and leave as it is but changing .data by 'jse_info'

        //data.amount = '100000000000.000'; //greater than: adjust_balance
        //data.amount = '1'; //wrong decimals: string_to_asset_num
        //data.amount = '-1.000'; //negative: validate
        //data.amount = '0.000'; //zero: validate

        data.currency = 'HIVE';

        // these two goes together
        data.amount = '0.001';
        data.to = 'theghost9999'; //invalid username('not found'): get_account
        //

        requestHandler.data.key = userData.one.nonEncryptKeys.active;
        requestHandler.data.accounts = accounts.twoAccounts;
        const result = await broadcastTransfer(requestHandler, data);
        methods.assert.error(result, new TypeError(), data, '');
      });
    });
    describe('Encrypted memo:\n', () => {});
  });
});
