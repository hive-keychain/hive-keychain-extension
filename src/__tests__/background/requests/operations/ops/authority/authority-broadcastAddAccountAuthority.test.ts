import { broadcastAddAccountAuthority } from '@background/requests/operations/ops/authority';
import { ExtendedAccount } from '@hiveio/dhive';
import {
  RequestAddAccountAuthority,
  RequestId,
} from '@interfaces/keychain.interface';
import { KeychainError } from 'src/keychain-error';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import authority from 'src/__tests__/background/requests/operations/ops/mocks/authority';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import { transactionConfirmationSuccess } from 'src/__tests__/utils-for-testing/data/confirmations';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
describe('authority tests:\n', () => {
  const { methods, constants, mocks } = authority;
  const { requestHandler, i18n } = constants;
  const data = constants.data.addAccountAuthority;
  methods.afterEach;
  methods.beforeEach;
  describe('broadcastAddAccountAuthority cases:\n', () => {
    beforeEach(() => {
      const cloneAccountExtended = objects.clone(
        accounts.extended,
      ) as ExtendedAccount;
      mocks.getExtendedAccount(cloneAccountExtended);
    });
    it('Must throw error if account exists in auths', async () => {
      const result = await broadcastAddAccountAuthority(requestHandler, data);
      const localeMessageKey = 'already_has_authority_error';
      const error = new KeychainError(localeMessageKey);
      const message = i18n.get('bgd_ops_error') + ' : ' + localeMessageKey;
      expect(result.msg.error).toEqual(error);
      expect(result.msg.message).toBe(message);
    });
    it('Must return error if no key on handler', async () => {
      const cloneData = objects.clone(data) as RequestAddAccountAuthority &
        RequestId;
      cloneData.authorizedUsername = 'notAddedAccount';
      const resultOperation = await broadcastAddAccountAuthority(
        requestHandler,
        cloneData,
      );
      const error = new Error('html_popup_error_while_signing_transaction');
      const message =
        i18n.get('bgd_ops_error') +
        ' : ' +
        'html_popup_error_while_signing_transaction';
      expect(resultOperation.msg.error).toEqual(error);
      expect(resultOperation.msg.message).toBe(message);
    });
    it('Must broadcast update account using active key', async () => {
      const mHiveTxSendOp = jest
        .spyOn(HiveTxUtils, 'sendOperation')
        .mockResolvedValue(transactionConfirmationSuccess);
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
        messages.success.addAuth(
          transactionConfirmationSuccess,
          datas,
          cloneData,
          request_id,
        ),
      );
      mHiveTxSendOp.mockRestore();
    });
    it('Must broadcast update account using posting key', async () => {
      const mHiveTxSendOp = jest
        .spyOn(HiveTxUtils, 'sendOperation')
        .mockResolvedValue(transactionConfirmationSuccess);
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
        messages.success.addAuth(
          transactionConfirmationSuccess,
          datas,
          cloneData,
          request_id,
        ),
      );
      mHiveTxSendOp.mockRestore();
    });
  });
});
