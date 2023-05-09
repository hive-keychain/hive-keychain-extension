import { broadcastRemoveKeyAuthority } from '@background/requests/operations/ops/authority';
import { ExtendedAccount } from '@hiveio/dhive';
import {
  KeychainKeyTypes,
  RequestId,
  RequestRemoveKeyAuthority,
} from '@interfaces/keychain.interface';
import authority from 'src/__tests__/background/requests/operations/ops/mocks/authority';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import { KeychainError } from 'src/keychain-error';
describe('authority tests:\n', () => {
  const { methods, constants, mocks } = authority;
  const { requestHandler, i18n } = constants;
  const data = constants.data.removeKeyAuthority;
  methods.afterEach;
  methods.beforeEach;
  describe('broadcastRemoveKeyAuthority cases:\n', () => {
    it('Must return error if no key on handler', async () => {
      const result = await broadcastRemoveKeyAuthority(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual(
        messages.error.keyBuffer(
          datas,
          request_id,
          new Error('html_popup_error_while_signing_transaction'),
          i18n.get('html_popup_error_while_signing_transaction'),
        ),
      );
    });
    it('Must return error if missing authority', async () => {
      const localeMessageKey = 'missing_authority_error';
      const cloneAccountExtended = objects.clone(
        accounts.extended,
      ) as ExtendedAccount;
      cloneAccountExtended.active = {
        weight_threshold: 1,
        account_auths: [],
        key_auths: [],
      };
      mocks.getExtendedAccount(cloneAccountExtended);
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.active,
        userData.one.encryptKeys.active,
      );
      const cloneData = objects.clone(data) as RequestRemoveKeyAuthority &
        RequestId;
      cloneData.role = KeychainKeyTypes.active;
      const result = await broadcastRemoveKeyAuthority(
        requestHandler,
        cloneData,
      );
      const { request_id, ...datas } = cloneData;
      expect(result).toEqual(
        messages.error.missingAuthority(
          datas,
          request_id,
          new KeychainError(localeMessageKey),
          i18n.get('missing_authority_error'),
        ),
      );
    });
    //TODO check & fix bellow
    // it('Must remove posting key', async () => {
    //   const mhiveTxSendOp = jest
    //     .spyOn(HiveTxUtils, 'sendOperation')
    //     .mockResolvedValue(transactionConfirmationSuccess);
    //   mocks.getExtendedAccount(
    //     objects.clone(accounts.extended) as ExtendedAccount,
    //   );
    //   requestHandler.setKeys(
    //     userData.one.nonEncryptKeys.posting,
    //     userData.one.encryptKeys.posting,
    //   );
    //   const cloneData = objects.clone(data) as RequestRemoveKeyAuthority &
    //     RequestId;
    //   cloneData.role = KeychainKeyTypes.posting;
    //   const result = await broadcastRemoveKeyAuthority(
    //     requestHandler,
    //     cloneData,
    //   );
    //   const { request_id, ...datas } = cloneData;
    //   expect(result).toEqual(
    //     messages.success.removedKey(
    //       transactionConfirmationSuccess,
    //       datas,
    //       request_id,
    //     ),
    //   );
    //   mhiveTxSendOp.mockRestore();
    // });
  });
});
