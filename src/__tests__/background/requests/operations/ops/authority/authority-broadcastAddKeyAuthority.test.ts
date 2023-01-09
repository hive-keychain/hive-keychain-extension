import { broadcastAddKeyAuthority } from '@background/requests/operations/ops/authority';
import { ExtendedAccount } from '@hiveio/dhive';
import {
  KeychainKeyTypes,
  RequestAddKeyAuthority,
  RequestId,
} from '@interfaces/keychain.interface';
import { KeychainError } from 'src/keychain-error';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import authority from 'src/__tests__/background/requests/operations/ops/mocks/authority';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
describe('authority tests:\n', () => {
  const { methods, constants, mocks } = authority;
  const { requestHandler, confirmed, i18n } = constants;
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
      const errorMessage =
        "Cannot read properties of undefined (reading 'toString')";
      const result = await broadcastAddKeyAuthority(requestHandler, cloneData);
      const { request_id, ...datas } = cloneData;
      expect(result).toEqual(
        messages.error.keyBuffer(
          datas,
          request_id,
          new TypeError(errorMessage),
          errorMessage,
        ),
      );
    });
    describe('broadcast cases:/n', () => {
      let mhiveTxSendOp: jest.SpyInstance;
      beforeEach(() => {
        mhiveTxSendOp = jest
          .spyOn(HiveTxUtils, 'sendOperation')
          .mockResolvedValue(true);
      });
      afterEach(() => {
        mhiveTxSendOp.mockRestore();
      });
      it('Must broadcast update account active key', async () => {
        const cloneAccountExtended = objects.clone(
          accounts.extended,
        ) as ExtendedAccount;
        cloneAccountExtended.active = {
          weight_threshold: 1,
          account_auths: [],
          key_auths: [],
        };
        mocks.getExtendedAccount(cloneAccountExtended);
        const cloneData = objects.clone(data) as RequestAddKeyAuthority &
          RequestId;
        cloneData.role = KeychainKeyTypes.active;
        requestHandler.setKeys(
          userData.one.nonEncryptKeys.active,
          userData.one.encryptKeys.active,
        );
        const result = await broadcastAddKeyAuthority(
          requestHandler,
          cloneData,
        );
        const { request_id, ...datas } = cloneData;
        expect(result).toEqual(
          messages.success.addKey(true, datas, cloneData, request_id),
        );
      });
      it('Must broadcast update account posting key', async () => {
        const cloneAccountExtended = objects.clone(
          accounts.extended,
        ) as ExtendedAccount;
        cloneAccountExtended.posting = {
          weight_threshold: 1,
          account_auths: [],
          key_auths: [],
        };
        mocks.getExtendedAccount(cloneAccountExtended);
        const cloneData = objects.clone(data) as RequestAddKeyAuthority &
          RequestId;
        cloneData.role = KeychainKeyTypes.posting;
        requestHandler.setKeys(
          userData.one.nonEncryptKeys.posting,
          userData.one.encryptKeys.posting,
        );
        const result = await broadcastAddKeyAuthority(
          requestHandler,
          cloneData,
        );
        const { request_id, ...datas } = cloneData;
        expect(result).toEqual(
          messages.success.addKey(true, datas, cloneData, request_id),
        );
      });
    });
  });
});
