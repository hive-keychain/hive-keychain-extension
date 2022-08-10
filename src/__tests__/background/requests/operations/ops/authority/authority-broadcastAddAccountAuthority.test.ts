import { broadcastAddAccountAuthority } from '@background/requests/operations/ops/authority';
import { ExtendedAccount } from '@hiveio/dhive';
import {
  RequestAddAccountAuthority,
  RequestId,
} from '@interfaces/keychain.interface';
import authority from 'src/__tests__/background/requests/operations/ops/mocks/authority';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
describe('authority tests:\n', () => {
  const { methods, constants, mocks } = authority;
  const { requestHandler, confirmed } = constants;
  const data = constants.data.addAccountAuthority;
  methods.afterEach;
  methods.beforeEach;
  describe('broadcastAddAccountAuthority cases:\n', () => {
    beforeEach(() => {
      const cloneAccountExtended = objects.clone(
        accounts.extended,
      ) as ExtendedAccount;
      mocks.client.database.getAccounts([cloneAccountExtended]);
      mocks.client.broadcast.updateAccount(confirmed);
    });
    it('Must throw error if account exists in auths', async () => {
      const result = await broadcastAddAccountAuthority(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual(messages.error.hasAuthority(datas, request_id));
    });
    it('Must return error if no key on handler', async () => {
      const cloneData = objects.clone(data) as RequestAddAccountAuthority &
        RequestId;
      cloneData.authorizedUsername = 'notAddedAccount';
      const result = await broadcastAddAccountAuthority(
        requestHandler,
        cloneData,
      );
      const { request_id, ...datas } = cloneData;
      expect(result).toEqual(messages.error.keyBuffer(datas, request_id));
    });
    it('Must broadcast update account using active key', async () => {
      const cloneData = objects.clone(data) as RequestAddAccountAuthority &
        RequestId;
      cloneData.authorizedUsername = 'notAddedAccount';
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.active,
        userData.one.encryptKeys.active,
      );
      const result = await broadcastAddAccountAuthority(
        requestHandler,
        cloneData,
      );
      const { request_id, ...datas } = cloneData;
      expect(result).toEqual(
        messages.success.addAuth(confirmed, datas, cloneData, request_id),
      );
    });
    it('Must broadcast update account using posting key', async () => {
      const cloneData = objects.clone(data) as RequestAddAccountAuthority &
        RequestId;
      cloneData.authorizedUsername = 'notAddedAccount';
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.posting,
        userData.one.encryptKeys.posting,
      );
      const result = await broadcastAddAccountAuthority(
        requestHandler,
        cloneData,
      );
      const { request_id, ...datas } = cloneData;
      expect(result).toEqual(
        messages.success.addAuth(confirmed, datas, cloneData, request_id),
      );
    });
  });
});
