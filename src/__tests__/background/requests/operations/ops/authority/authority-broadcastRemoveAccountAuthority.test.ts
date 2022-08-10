import { broadcastRemoveAccountAuthority } from '@background/requests/operations/ops/authority';
import { ExtendedAccount } from '@hiveio/dhive';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import authority from 'src/__tests__/background/requests/operations/ops/mocks/authority';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';

describe('authority tests:/n', () => {
  const { methods, constants, mocks } = authority;
  const { requestHandler, confirmed } = constants;
  const data = constants.data.removeAccountAuthority;
  methods.afterEach;
  methods.beforeEach;
  describe('broadcastRemoveAccountAuthority cases:\n', () => {
    beforeEach(() => {
      const cloneAccountExtended = objects.clone(
        accounts.extended,
      ) as ExtendedAccount;
      mocks.client.database.getAccounts([cloneAccountExtended]);
      mocks.client.broadcast.updateAccount(confirmed);
    });
    it.skip('Must throw error if account not exists in auths', async () => {
      const result = await broadcastRemoveAccountAuthority(
        requestHandler,
        data,
      );
      const { request_id, ...datas } = data;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error: new Error('Already has authority'),
          result: undefined,
          data: datas,
          message: `${await chrome.i18n.getMessage(
            'bgd_ops_error',
          )} : Already has authority`,
          request_id,
          publicKey: undefined,
        },
      });
    });
    it.todo('Must return error if no key on handler');
    it.todo('Must broadcast update account using active key');
    it.todo('Must broadcast update account using posting key');
  });
});
