import { broadcastTransfer } from '@background/requests/operations/ops/transfer';
import { LocalAccount } from '@interfaces/local-account.interface';
import { KeychainError } from 'src/keychain-error';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import transferMocks from 'src/__tests__/background/requests/operations/ops/mocks/transfer-mocks';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
describe('transfer tests:\n', () => {
  const { methods, constants, spies, mocks } = transferMocks;
  const { requestHandler, data, params, confirmed } = constants;
  methods.afterEach;
  methods.beforeEach;
  describe('broadcastTransfer cases:\n', () => {
    describe('Default cases:\n', () => {
      describe('No encrypted memo:\n', () => {
        it('Must call getUserKey', async () => {
          await broadcastTransfer(requestHandler, data);
          expect(spies.getUserKey).toBeCalledTimes(1);
          expect(spies.getUserKey).toBeCalledWith(...params.getUserKey[0]);
        });
        it('Must return error if no key on handler', async () => {
          const errorMsg =
            "Cannot read properties of undefined (reading 'toString')";
          const result = await broadcastTransfer(requestHandler, data);
          methods.assert.error(result, new TypeError(errorMsg), data, errorMsg);
        });
        it('Must return error if receiver not found', async () => {
          data.currency = 'HIVE';
          data.amount = '0.001';
          data.to = 'theghost9999';
          const localeMessageKey = 'bgd_ops_transfer_get_account';
          mocks.getExtendedAccount(undefined);
          requestHandler.data.key = userData.one.nonEncryptKeys.active;
          requestHandler.data.accounts = accounts.twoAccounts;
          const result = await broadcastTransfer(requestHandler, data);
          methods.assert.error(
            result,
            new KeychainError(localeMessageKey),
            data,
            chrome.i18n.getMessage(localeMessageKey, [data.to]),
          );
        });
        it('Must return success', async () => {
          const mHiveTxSendOp = jest
            .spyOn(HiveTxUtils, 'sendOperation')
            .mockResolvedValue(true);
          mocks.getExtendedAccount(accounts.extended);
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
          mHiveTxSendOp.mockRestore();
        });
      });
      describe('Encrypted memo:\n', () => {
        it('Must return error if no memoKey', async () => {
          mocks.getExtendedAccount(accounts.extended);
          const localeMessageKey = 'popup_html_memo_key_missing';
          requestHandler.data.key = userData.one.nonEncryptKeys.active;
          requestHandler.data.accounts = [];
          data.to = 'nonExistentUser';
          data.memo = '# To Encrypt this memo!';
          const result = await broadcastTransfer(requestHandler, data);
          methods.assert.error(
            result,
            new KeychainError(localeMessageKey),
            data,
            chrome.i18n.getMessage(localeMessageKey),
          );
        });
        it('Must return error if receiver not found', async () => {
          mocks.getExtendedAccount(undefined);
          const localeMessageKey = 'bgd_ops_transfer_get_account';
          requestHandler.data.key = userData.one.nonEncryptKeys.active;
          requestHandler.data.accounts = accounts.twoAccounts;
          data.to = 'nonExistentUser';
          data.memo = '# To Encrypt this memo!';
          const result = await broadcastTransfer(requestHandler, data);
          methods.assert.error(
            result,
            new KeychainError(localeMessageKey),
            data,
            chrome.i18n.getMessage(localeMessageKey, [data.to]),
          );
        });
        it('Must return success', async () => {
          const mHiveTxSendOp = jest
            .spyOn(HiveTxUtils, 'sendOperation')
            .mockResolvedValue(true);
          mocks.getExtendedAccount(accounts.extended);
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
          mHiveTxSendOp.mockRestore();
        });
      });
    });

    describe('Using ledger cases:\n', () => {
      it('Must return success', async () => {
        mocks.HiveTxUtils.sendOperation(true);
        mocks.LedgerModule.getSignatureFromLedger('signed!');
        mocks.broadcastAndConfirmTransactionWithSignature(true);
        mocks.getExtendedAccount(accounts.extended);
        const clonedAccounts = objects.clone(
          accounts.twoAccounts,
        ) as LocalAccount[];
        clonedAccounts[0].keys.active = '#ledgerKey1234';
        requestHandler.data.accounts = clonedAccounts;
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
