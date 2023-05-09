import { broadcastRemoveAccountAuthority } from '@background/requests/operations/ops/authority';
import {
  RequestId,
  RequestRemoveAccountAuthority,
} from '@interfaces/keychain.interface';
import authority from 'src/__tests__/background/requests/operations/ops/mocks/authority';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
describe('authority tests:/n', () => {
  const { methods, constants, mocks } = authority;
  const { requestHandler, i18n } = constants;
  const data = constants.data.removeAccountAuthority;
  methods.afterEach;
  methods.beforeEach;
  describe('broadcastRemoveAccountAuthority cases:\n', () => {
    it('Must return error if no key on handler', async () => {
      const cloneData = objects.clone(data) as RequestRemoveAccountAuthority &
        RequestId;
      cloneData.authorizedUsername = 'notAddedAccount';
      const localeMessageKey = 'html_popup_error_while_signing_transaction';
      const result = await broadcastRemoveAccountAuthority(
        requestHandler,
        data,
      );
      const { request_id, ...datas } = data;
      expect(result).toEqual(
        messages.error.keyBuffer(
          datas,
          request_id,
          new Error(localeMessageKey),
          i18n.get(localeMessageKey),
        ),
      );
    });
    it('Must return error if user not authorized', async () => {
      const localeMessageKey = 'nothing_to_remove_error';
      const cloneData = objects.clone(data) as RequestRemoveAccountAuthority &
        RequestId;
      cloneData.authorizedUsername = 'notAddedAccount';
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.active,
        userData.one.encryptKeys.active,
      );
      const result = await broadcastRemoveAccountAuthority(
        requestHandler,
        cloneData,
      );
      const { request_id, ...datas } = cloneData;
      expect(result).toEqual(
        messages.error.nothingToRemove(
          datas,
          request_id,
          new Error(localeMessageKey),
          i18n.get(localeMessageKey),
        ),
      );
    });
    //TODO check & fix
    // it('Must broadcast update account using active key', async () => {
    //   const cloneExtended = objects.clone(accounts.extended) as ExtendedAccount;
    //   (cloneExtended.active = {
    //     weight_threshold: 1,
    //     account_auths: [['theghost1980', 1]],
    //     key_auths: [[userData.one.encryptKeys.active, 1]],
    //   } as AuthorityType),
    //     mocks.getExtendedAccount(cloneExtended);
    //   const mhiveTxSendOp = jest
    //     .spyOn(HiveTxUtils, 'sendOperation')
    //     .mockResolvedValue(transactionConfirmationSuccess);
    //   const cloneData = objects.clone(data) as RequestRemoveAccountAuthority &
    //     RequestId;
    //   cloneData.authorizedUsername = 'theghost1980';
    //   cloneData.role = KeychainKeyTypes.active;
    //   requestHandler.setKeys(
    //     userData.one.nonEncryptKeys.active,
    //     userData.one.encryptKeys.active,
    //   );
    //   const result = await broadcastRemoveAccountAuthority(
    //     requestHandler,
    //     cloneData,
    //   );
    //   const { request_id, ...datas } = cloneData;
    //   expect(result).toEqual(
    //     messages.success.removedAuth(
    //       transactionConfirmationSuccess,
    //       datas,
    //       request_id,
    //     ),
    //   );
    //   mhiveTxSendOp.mockRestore();
    // });
    // it('Must broadcast update account using posting key', async () => {
    //   mocks.getExtendedAccount(accounts.extended);
    //   const mhiveTxSendOp = jest
    //     .spyOn(HiveTxUtils, 'sendOperation')
    //     .mockResolvedValue(transactionConfirmationSuccess);
    //   const cloneData = objects.clone(data) as RequestRemoveAccountAuthority &
    //     RequestId;
    //   cloneData.authorizedUsername = 'theghost1980';
    //   cloneData.role = KeychainKeyTypes.posting;
    //   requestHandler.setKeys(
    //     userData.one.nonEncryptKeys.posting,
    //     userData.one.encryptKeys.posting,
    //   );
    //   const result = await broadcastRemoveAccountAuthority(
    //     requestHandler,
    //     cloneData,
    //   );
    //   const { request_id, ...datas } = cloneData;
    //   expect(result).toEqual(
    //     messages.success.removedAuth(
    //       transactionConfirmationSuccess,
    //       datas,
    //       request_id,
    //     ),
    //   );
    //   mhiveTxSendOp.mockRestore();
    // });
  });
});
