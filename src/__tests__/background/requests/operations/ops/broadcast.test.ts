import { broadcastOperations } from '@background/requests/operations/ops/broadcast';
import { RequestBroadcast, RequestId } from '@interfaces/keychain.interface';
import { KeychainError } from 'src/keychain-error';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import broadcast from 'src/__tests__/background/requests/operations/ops/mocks/broadcast';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import operation from 'src/__tests__/utils-for-testing/data/operation';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
describe('broadcast tests:\n', () => {
  const { methods, constants, mocks } = broadcast;
  const { requestHandler, data, i18n } = constants;
  methods.afterEach;
  methods.beforeEach;
  describe('Default cases:\n', () => {
    it('Must return error if parsing fails', async () => {
      const cloneData = objects.clone(data) as RequestBroadcast & RequestId;
      cloneData.operations = '//!!';
      const message = 'Unexpected token / in JSON at position 0';
      const result = await broadcastOperations(requestHandler, cloneData);
      const { request_id, ...datas } = cloneData;
      expect(result).toEqual(
        messages.error.parsedFailed(
          datas,
          request_id,
          new SyntaxError(message),
          message,
        ),
      );
    });
    it('Must return error if invalid operations format', async () => {
      const cloneData = objects.clone(data) as RequestBroadcast & RequestId;
      cloneData.operations = '{}';
      const message = 'operations is not iterable';
      const result = await broadcastOperations(requestHandler, cloneData);
      const { request_id, ...datas } = cloneData;
      expect(result).toEqual(
        messages.error.notIterable(
          datas,
          request_id,
          new TypeError(message),
          message,
        ),
      );
    });
    it('Must return error if receiver not found', async () => {
      mocks.getExtendedAccount(undefined);
      const transfers = operation.array.filter((op) => op['0'] === 'transfer');
      transfers[0]['1'].memo = '# enconded memo';
      const cloneData = objects.clone(data) as RequestBroadcast & RequestId;
      cloneData.operations = transfers;
      const result = await broadcastOperations(requestHandler, cloneData);
      const localeMessageKey = 'bgd_ops_transfer_get_account';
      const error = new KeychainError(localeMessageKey, [transfers[0]['1'].to]);
      expect(result.msg.error).toEqual(error);
      expect(result.msg.message).toBe(
        i18n.get('bgd_ops_transfer_get_account', [transfers[0]['1'].to]),
      );
    });
    it('Must return error if memo key not found in handler', async () => {
      mocks.getExtendedAccount(accounts.extended);
      const transfers = operation.array.filter((op) => op['0'] === 'transfer');
      transfers[0]['1'].memo = '# enconded memo';
      const cloneData = objects.clone(data) as RequestBroadcast & RequestId;
      cloneData.operations = transfers;
      const result = await broadcastOperations(requestHandler, cloneData);
      const localeMessageKey = 'popup_html_memo_key_missing';
      const error = new KeychainError(localeMessageKey, []);
      expect(result.msg.error).toEqual(error);
      expect(result.msg.message).toBe(i18n.get(localeMessageKey));
    });
    it('Must return error if not key on handler', async () => {
      mocks.getExtendedAccount(accounts.extended);
      const transfers = operation.array.filter((op) => op['0'] === 'transfer');
      transfers[0]['1'].memo = '# enconded memo';
      const cloneData = objects.clone(data) as RequestBroadcast & RequestId;
      cloneData.operations = transfers;
      requestHandler.data.accounts = [
        {
          name: mk.user.one,
          keys: {
            memo: userData.one.nonEncryptKeys.active,
            memoPubkey: userData.one.encryptKeys.memo,
          },
        },
      ];
      const result = await broadcastOperations(requestHandler, cloneData);
      const message =
        "Cannot read properties of undefined (reading 'toString')";
      expect(result.msg.error).toEqual(new TypeError(message));
      expect(result.msg.message).toBe(message);
    });
    it('Must return success on transfer', async () => {
      mocks.getExtendedAccount(accounts.extended);
      const mHiveTxSendOp = jest
        .spyOn(HiveTxUtils, 'sendOperation')
        .mockResolvedValue(true);
      const transfers = operation.array.filter((op) => op['0'] === 'transfer');
      transfers[0]['1'].memo = '# enconded memo';
      const cloneData = objects.clone(data) as RequestBroadcast & RequestId;
      cloneData.operations = transfers;
      const { request_id, ...datas } = cloneData;
      requestHandler.data.accounts = [
        {
          name: mk.user.one,
          keys: {
            memo: userData.one.nonEncryptKeys.memo,
            memoPubkey: userData.one.encryptKeys.memo,
          },
        },
      ];
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.active,
        userData.one.encryptKeys.active,
      );
      const result = await broadcastOperations(requestHandler, cloneData);
      expect(result).toEqual(
        messages.success.broadcast(
          true,
          datas,
          request_id,
          chrome.i18n.getMessage('bgd_ops_broadcast'),
        ),
      );
      mHiveTxSendOp.mockRestore();
    });
    it('Must return success broadcasting operations', async () => {
      mocks.getExtendedAccount(accounts.extended);
      const mHiveTxSendOp = jest
        .spyOn(HiveTxUtils, 'sendOperation')
        .mockResolvedValue(true);

      const operations = operation.array.filter((op) => op['0'] !== 'transfer');
      const cloneData = objects.clone(data) as RequestBroadcast & RequestId;
      cloneData.operations = JSON.stringify(operations);
      const { request_id, ...datas } = cloneData;
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.active,
        userData.one.encryptKeys.active,
      );
      const result = await broadcastOperations(requestHandler, cloneData);
      expect(result).toEqual(
        messages.success.broadcast(
          true,
          datas,
          request_id,
          chrome.i18n.getMessage('bgd_ops_broadcast'),
        ),
      );
      mHiveTxSendOp.mockRestore();
    });
  });

  describe('Using ledger cases:\n', () => {
    it('Must return success on transfer', async () => {
      mocks.getExtendedAccount(accounts.extended);
      mocks.HiveTxUtils.sendOperation(true);
      mocks.LedgerModule.getSignatureFromLedger('signed!');
      mocks.broadcastAndConfirmTransactionWithSignature(true);
      const transfers = operation.array.filter((op) => op['0'] === 'transfer');
      transfers[0]['1'].memo = '# enconded memo';
      const cloneData = objects.clone(data) as RequestBroadcast & RequestId;
      cloneData.operations = transfers;
      const { request_id, ...datas } = cloneData;
      requestHandler.data.accounts = [
        {
          name: mk.user.one,
          keys: {
            memo: userData.one.nonEncryptKeys.memo,
            memoPubkey: userData.one.encryptKeys.memo,
          },
        },
      ];
      requestHandler.setKeys('#ledgerKey1234', userData.one.encryptKeys.active);
      const result = await broadcastOperations(requestHandler, cloneData);
      expect(result).toEqual(
        messages.success.broadcast(
          true,
          datas,
          request_id,
          chrome.i18n.getMessage('bgd_ops_broadcast'),
        ),
      );
    });
  });
});
