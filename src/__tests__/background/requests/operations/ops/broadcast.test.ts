import { broadcastOperations } from '@background/requests/operations/ops/broadcast';
import {
  KeychainKeyTypesLC,
  RequestBroadcast,
  RequestId,
} from '@interfaces/keychain.interface';
import broadcast from 'src/__tests__/background/requests/operations/ops/mocks/broadcast';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import operation from 'src/__tests__/utils-for-testing/data/operation';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
describe('broadcast tests:\n', () => {
  const { methods, constants, mocks } = broadcast;
  const { requestHandler, data, confirmed } = constants;
  methods.afterEach;
  methods.beforeEach;
  it('Must return error if parsing fails', async () => {
    const cloneData = objects.clone(data) as RequestBroadcast & RequestId;
    cloneData.operations = '//!!';
    const result = await broadcastOperations(requestHandler, cloneData);
    const { request_id, ...datas } = cloneData;
    expect(result).toEqual(messages.error.parsedFailed(datas, request_id));
  });
  it('Must return error if invalid operations format', async () => {
    const cloneData = objects.clone(data) as RequestBroadcast & RequestId;
    cloneData.operations = '{}';
    const result = await broadcastOperations(requestHandler, cloneData);
    const { request_id, ...datas } = cloneData;
    expect(result).toEqual(messages.error.notIterable(datas, request_id));
  });
  it('Must return error if receiver memo key not found on hive', async () => {
    mocks.client.database.getAccounts([]);
    const transfers = operation.array.filter((op) => op['0'] === 'transfer');
    transfers[0]['1'].memo = '# enconded memo';
    const cloneData = objects.clone(data) as RequestBroadcast & RequestId;
    cloneData.operations = transfers;
    const { request_id, ...datas } = cloneData;
    const result = await broadcastOperations(requestHandler, cloneData);
    expect(result).toEqual(messages.error.receiverMemoKey(datas, request_id));
  });
  it('Must return error if memoKey not found on handler', async () => {
    mocks.client.database.getAccounts([accounts.extended]);
    const transfers = operation.array.filter((op) => op['0'] === 'transfer');
    transfers[0]['1'].memo = '# enconded memo';
    const cloneData = objects.clone(data) as RequestBroadcast & RequestId;
    cloneData.operations = transfers;
    const { request_id, ...datas } = cloneData;
    const result = await broadcastOperations(requestHandler, cloneData);
    expect(result).toEqual(
      messages.error.missingKey(datas, request_id, KeychainKeyTypesLC.memo),
    );
  });
  it('Must return error if not key on handler', async () => {
    mocks.client.database.getAccounts([accounts.extended]);
    const transfers = operation.array.filter((op) => op['0'] === 'transfer');
    transfers[0]['1'].memo = '# enconded memo';
    const cloneData = objects.clone(data) as RequestBroadcast & RequestId;
    cloneData.operations = transfers;
    const { request_id, ...datas } = cloneData;
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
    expect(result).toEqual(messages.error.keyBuffer(datas, request_id));
  });
  it('Must return success on transfer', async () => {
    mocks.client.database.getAccounts([accounts.extended]);
    mocks.client.broadcast.sendOperations(confirmed);
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
        confirmed,
        datas,
        request_id,
        chrome.i18n.getMessage('bgd_ops_broadcast'),
      ),
    );
  });
  it('Must return success broadcasting operations', async () => {
    mocks.client.database.getAccounts([accounts.extended]);
    mocks.client.broadcast.sendOperations(confirmed);
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
        confirmed,
        datas,
        request_id,
        chrome.i18n.getMessage('bgd_ops_broadcast'),
      ),
    );
  });
});
