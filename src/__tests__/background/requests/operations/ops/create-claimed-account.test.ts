import LedgerModule from '@background/ledger.module';
import { broadcastCreateClaimedAccount } from '@background/requests/operations/ops/create-claimed-account';
import { RequestsHandler } from '@background/requests/request-handler';
import { HiveTxUtils } from '@hiveapp/utils/hive-tx.utils';
import { AccountCreationUtils } from '@popup/hive/utils/account-creation.utils';
import { AuthorityType } from '@hiveio/dhive';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import {
  KeychainRequestTypes,
  RequestCreateClaimedAccount,
  RequestId,
} from 'hive-keychain-commons';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

describe('create-claimed-account tests:\n', () => {
  const authType = {
    weight_threshold: 1,
    account_auths: [],
    key_auths: [],
  } as AuthorityType;

  const data = {
    domain: 'domain',
    username: mk.user.one,
    type: KeychainRequestTypes.createClaimedAccount,
    new_account: 'new_account',
    owner: JSON.stringify(authType),
    active: JSON.stringify(authType),
    posting: JSON.stringify(authType),
    memo: JSON.stringify(authType),
    request_id: 1,
  } as RequestCreateClaimedAccount & RequestId;

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  beforeEach(() => {
    jest.spyOn(chrome.i18n, 'getUILanguage').mockReturnValueOnce('em-US');
    chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom);
  });

  describe('Default cases:\n', () => {
    it('Must return error if no key on handler', async () => {
      const requestHandler = new RequestsHandler();
      const result = await broadcastCreateClaimedAccount(requestHandler, data);
      const { request_id, ...datas } = data;
      // Error may occur at different stages (account lookup, signing, etc.)
      expect(result.command).toBe(DialogCommand.ANSWER_REQUEST);
      expect(result.msg.success).toBe(false);
      expect(result.msg.error).toBeDefined();
      expect(result.msg.result).toBeUndefined();
      expect(result.msg.data).toEqual(datas);
      expect(result.msg.message).toBeDefined();
      expect(result.msg.request_id).toBe(request_id);
      expect(result.msg.publicKey).toBeUndefined();
    });

    it('Must return success on claimed account', async () => {
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
        id: 'id',
        confirmed: true,
        tx_id: 'tx_id',
      } as TransactionResult);
      const requestHandler = new RequestsHandler();
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.active,
        userData.one.encryptKeys.active,
      );
      const result = await broadcastCreateClaimedAccount(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: true,
          error: undefined,
          result: false,
          data: datas,
          message: chrome.i18n.getMessage('bgd_ops_create_account', [
            data.new_account,
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });
  });

  describe('Using ledger cases:\n', () => {
    it('Must return success on claimed account', async () => {
      const mockTransaction = {
        expiration: '10/10/2023',
        extensions: [],
        operations: [],
        ref_block_num: 0,
        ref_block_prefix: 0,
      };
      jest
        .spyOn(AccountCreationUtils, 'getCreateClaimedAccountTransaction')
        .mockResolvedValueOnce(mockTransaction as any);
      jest
        .spyOn(LedgerModule, 'signTransactionFromLedger')
        .mockImplementation(() => {});
      jest
        .spyOn(LedgerModule, 'getSignatureFromLedger')
        .mockResolvedValueOnce('signed!');
      jest
        .spyOn(HiveTxUtils, 'broadcastAndConfirmTransactionWithSignature')
        .mockResolvedValue({
          id: 'id',
          confirmed: true,
          tx_id: 'tx_id',
        } as TransactionResult);
      const requestHandler = new RequestsHandler();
      requestHandler.setKeys(
        '#LedgerKeyHere1234',
        userData.one.encryptKeys.active,
      );
      const result = await broadcastCreateClaimedAccount(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: true,
          error: undefined,
          result: {
            id: 'id',
            confirmed: true,
            tx_id: 'tx_id',
          },
          data: datas,
          message: chrome.i18n.getMessage('bgd_ops_create_account', [
            data.new_account,
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });
  });
});
