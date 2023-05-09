import { broadcastAddKeyAuthority } from '@background/requests/operations/ops/authority';
import {
  RequestAddKeyAuthority,
  RequestId,
} from '@interfaces/keychain.interface';
import authority from 'src/__tests__/background/requests/operations/ops/mocks/authority';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import { KeychainError } from 'src/keychain-error';
describe('authority tests:\n', () => {
  const { methods, constants, mocks } = authority;
  const { requestHandler, i18n } = constants;
  const data = constants.data.addKeyAuthority;
  methods.afterEach;
  methods.beforeEach;
  describe('broadcastAddKeyAuthority cases:\n', () => {
    it('Must return error if key authorized', async () => {
      mocks.getExtendedAccount(accounts.extended);
      const localeMessageKey = 'already_has_authority_error';
      const result = await broadcastAddKeyAuthority(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual(
        messages.error.hasAuthority(
          datas,
          request_id,
          new KeychainError(localeMessageKey),
          i18n.get(localeMessageKey),
        ),
      );
    });
    it('Must return error if no key on handler', async () => {
      const cloneData = objects.clone(data) as RequestAddKeyAuthority &
        RequestId;
      cloneData.authorizedKey = '';
      const result = await broadcastAddKeyAuthority(requestHandler, cloneData);
      const { request_id, ...datas } = cloneData;
      expect(result).toEqual(
        messages.error.keyBuffer(
          datas,
          request_id,
          new Error('html_popup_error_while_signing_transaction'),
          i18n.get('html_popup_error_while_signing_transaction'),
        ),
      );
    });
    //TODO check & fix bellow
    // describe('broadcast cases:/n', () => {
    //   let mhiveTxSendOp: jest.SpyInstance;
    //   beforeEach(() => {
    //     mhiveTxSendOp = jest
    //       .spyOn(HiveTxUtils, 'sendOperation')
    //       .mockResolvedValue(transactionConfirmationSuccess);
    //   });
    //   afterEach(() => {
    //     mhiveTxSendOp.mockRestore();
    //   });
    //   it('Must broadcast update account active key', async () => {
    //     const cloneAccountExtended = objects.clone(
    //       accounts.extended,
    //     ) as ExtendedAccount;
    //     cloneAccountExtended.active = {
    //       weight_threshold: 1,
    //       account_auths: [],
    //       key_auths: [],
    //     };
    //     mocks.getExtendedAccount(cloneAccountExtended);
    //     const cloneData = objects.clone(data) as RequestAddKeyAuthority &
    //       RequestId;
    //     cloneData.role = KeychainKeyTypes.active;
    //     requestHandler.setKeys(
    //       userData.one.nonEncryptKeys.active,
    //       userData.one.encryptKeys.active,
    //     );
    //     const result = await broadcastAddKeyAuthority(
    //       requestHandler,
    //       cloneData,
    //     );
    //     const { request_id, ...datas } = cloneData;
    //     expect(result).toEqual(
    //       messages.success.addKey(
    //         transactionConfirmationSuccess,
    //         datas,
    //         cloneData,
    //         request_id,
    //       ),
    //     );
    //   });
    //   it('Must broadcast update account posting key', async () => {
    //     const cloneAccountExtended = objects.clone(
    //       accounts.extended,
    //     ) as ExtendedAccount;
    //     cloneAccountExtended.posting = {
    //       weight_threshold: 1,
    //       account_auths: [],
    //       key_auths: [],
    //     };
    //     mocks.getExtendedAccount(cloneAccountExtended);
    //     const cloneData = objects.clone(data) as RequestAddKeyAuthority &
    //       RequestId;
    //     cloneData.role = KeychainKeyTypes.posting;
    //     requestHandler.setKeys(
    //       userData.one.nonEncryptKeys.posting,
    //       userData.one.encryptKeys.posting,
    //     );
    //     const result = await broadcastAddKeyAuthority(
    //       requestHandler,
    //       cloneData,
    //     );
    //     const { request_id, ...datas } = cloneData;
    //     expect(result).toEqual(
    //       messages.success.addKey(
    //         transactionConfirmationSuccess,
    //         datas,
    //         cloneData,
    //         request_id,
    //       ),
    //     );
    //   });
    // });
  });
});
