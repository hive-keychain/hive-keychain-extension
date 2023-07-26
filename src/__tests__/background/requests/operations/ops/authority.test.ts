import LedgerModule from '@background/ledger.module';
import {
  broadcastAddAccountAuthority,
  broadcastAddKeyAuthority,
  broadcastRemoveAccountAuthority,
  broadcastRemoveKeyAuthority,
} from '@background/requests/operations/ops/authority';
import { RequestsHandler } from '@background/requests/request-handler';
import { AuthorityType, ExtendedAccount } from '@hiveio/dhive';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import {
  KeychainKeyTypes,
  KeychainKeyTypesLC,
  KeychainRequestTypes,
  RequestAddAccountAuthority,
  RequestAddKeyAuthority,
  RequestId,
  RequestRemoveAccountAuthority,
  RequestRemoveKeyAuthority,
} from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { KeychainError } from 'src/keychain-error';
import AccountUtils from 'src/utils/account.utils';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';

describe('authority tests:\n', () => {
  const commonValues = {
    domain: 'domain',
    username: mk.user.one,
  };

  const data = {
    addAccountAuthority: {
      ...commonValues,
      type: KeychainRequestTypes.addAccountAuthority,
      role: KeychainKeyTypes.posting,
      weight: 1,
      authorizedUsername: 'theghost1980',
      request_id: 1,
    } as RequestAddAccountAuthority & RequestId,
    removeAccountAuthority: {
      ...commonValues,
      type: KeychainRequestTypes.removeAccountAuthority,
      authorizedUsername: 'theghost1980',
      role: KeychainKeyTypes.posting,
      method: KeychainKeyTypes.active,
      request_id: 1,
    } as RequestRemoveAccountAuthority & RequestId,
    addKeyAuthority: {
      ...commonValues,
      type: KeychainRequestTypes.addKeyAuthority,
      authorizedKey: userData.one.encryptKeys.posting,
      method: KeychainKeyTypes.active,
      weight: 1,
      role: KeychainKeyTypes.posting,
      request_id: 1,
    } as RequestAddKeyAuthority & RequestId,
    removeKeyAuthority: {
      ...commonValues,
      type: KeychainRequestTypes.removeKeyAuthority,
      authorizedKey: userData.one.encryptKeys.posting,
      method: KeychainKeyTypes.active,
      role: KeychainKeyTypes.posting,
      request_id: 1,
    } as RequestRemoveKeyAuthority & RequestId,
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  beforeEach(() => {
    jest.spyOn(chrome.i18n, 'getUILanguage').mockReturnValueOnce('en-US');
    chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom);
  });

  describe('broadcastAddAccountAuthority cases:\n', () => {
    beforeEach(() => {
      const cloneAccountExtended = objects.clone(
        accounts.extended,
      ) as ExtendedAccount;
      jest
        .spyOn(AccountUtils, 'getExtendedAccount')
        .mockResolvedValueOnce(cloneAccountExtended);
    });

    it('Must throw error if account exists in auths', async () => {
      const requestHandler = new RequestsHandler();
      const result = await broadcastAddAccountAuthority(
        requestHandler,
        data.addAccountAuthority,
      );
      const localeMessageKey = 'already_has_authority_error';
      const error = new KeychainError(localeMessageKey);
      const message =
        chrome.i18n.getMessage('bgd_ops_error') + ' : ' + localeMessageKey;
      expect(result.msg.error).toEqual(error);
      expect(result.msg.message).toBe(message);
    });

    it('Must return error if no key on handler', async () => {
      const cloneData = objects.clone(
        data.addAccountAuthority,
      ) as RequestAddAccountAuthority & RequestId;
      cloneData.authorizedUsername = 'notAddedAccount';
      const requestHandler = new RequestsHandler();
      const resultOperation = await broadcastAddAccountAuthority(
        requestHandler,
        cloneData,
      );
      const error = new Error('html_popup_error_while_signing_transaction');
      const message =
        chrome.i18n.getMessage('bgd_ops_error') +
        ' : ' +
        'html_popup_error_while_signing_transaction';
      expect(resultOperation.msg.error).toEqual(error);
      expect(resultOperation.msg.message).toBe(message);
    });

    it('Must broadcast update account using active key', async () => {
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
        id: 'id',
        confirmed: true,
        tx_id: 'tx_id',
      } as TransactionResult);
      const cloneData = objects.clone(
        data.addAccountAuthority,
      ) as RequestAddAccountAuthority & RequestId;
      cloneData.authorizedUsername = 'notAddedAccount';
      const requestHandler = new RequestsHandler();
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.active,
        userData.one.encryptKeys.active,
      );
      const result = await broadcastAddAccountAuthority(
        requestHandler,
        cloneData,
      );
      const { request_id, ...datas } = cloneData;
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
          message: chrome.i18n.getMessage('bgd_ops_add_auth', [
            KeychainKeyTypesLC.posting,
            'notAddedAccount',
            mk.user.one,
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });

    it('Must broadcast update account using posting key', async () => {
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
        id: 'id',
        confirmed: true,
        tx_id: 'tx_id',
      } as TransactionResult);
      const cloneData = objects.clone(
        data.addAccountAuthority,
      ) as RequestAddAccountAuthority & RequestId;
      cloneData.authorizedUsername = 'notAddedAccount';
      const requestHandler = new RequestsHandler();
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.posting,
        userData.one.encryptKeys.posting,
      );
      const result = await broadcastAddAccountAuthority(
        requestHandler,
        cloneData,
      );
      const { request_id, ...datas } = cloneData;
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
          message: chrome.i18n.getMessage('bgd_ops_add_auth', [
            KeychainKeyTypesLC.posting,
            'notAddedAccount',
            mk.user.one,
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });
  });

  describe('broadcastRemoveAccountAuthority cases:\n', () => {
    it('Must return error if no key on handler', async () => {
      const cloneExtended = objects.clone(accounts.extended) as ExtendedAccount;
      cloneExtended.active = {
        weight_threshold: 1,
        account_auths: [
          ['theghost1980', 1],
          ['theghost1981', 1],
        ],
        key_auths: [[userData.one.encryptKeys.active, 1]],
      } as AuthorityType;
      jest
        .spyOn(AccountUtils, 'getExtendedAccount')
        .mockResolvedValueOnce(cloneExtended);
      const cloneData = objects.clone(
        data.removeAccountAuthority,
      ) as RequestRemoveAccountAuthority & RequestId;
      cloneData.authorizedUsername = 'theghost1980';
      const requestHandler = new RequestsHandler();
      const result = await broadcastRemoveAccountAuthority(
        requestHandler,
        cloneData,
      );
      const { request_id, ...datas } = cloneData;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error: new Error('html_popup_error_while_signing_transaction'),
          result: undefined,
          data: datas,
          message: chrome.i18n.getMessage(
            'html_popup_error_while_signing_transaction',
          ),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });

    it('Must return error if user not authorized', async () => {
      jest
        .spyOn(AccountUtils, 'getExtendedAccount')
        .mockResolvedValueOnce(accounts.extended);
      const localeMessageKey = 'nothing_to_remove_error';
      const cloneData = objects.clone(
        data.removeAccountAuthority,
      ) as RequestRemoveAccountAuthority & RequestId;
      cloneData.authorizedUsername = 'notAddedAccount';
      const requestHandler = new RequestsHandler();
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.active,
        userData.one.encryptKeys.active,
      );
      const result = await broadcastRemoveAccountAuthority(
        requestHandler,
        cloneData,
      );
      const { request_id, ...datas } = cloneData;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error: new Error(localeMessageKey),
          result: undefined,
          data: datas,
          message: chrome.i18n.getMessage(localeMessageKey),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });

    it('Must broadcast remove using active key', async () => {
      const cloneExtended = objects.clone(accounts.extended) as ExtendedAccount;
      cloneExtended.active = {
        weight_threshold: 1,
        account_auths: [['theghost1980', 1]],
        key_auths: [[userData.one.encryptKeys.active, 1]],
      } as AuthorityType;
      jest
        .spyOn(AccountUtils, 'getExtendedAccount')
        .mockResolvedValueOnce(cloneExtended);
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
        id: 'id',
        confirmed: true,
        tx_id: 'tx_id',
      } as TransactionResult);
      const cloneData = objects.clone(
        data.removeAccountAuthority,
      ) as RequestRemoveAccountAuthority & RequestId;
      cloneData.authorizedUsername = 'theghost1980';
      cloneData.role = KeychainKeyTypes.active;
      const requestHandler = new RequestsHandler();
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.active,
        userData.one.encryptKeys.active,
      );
      const result = await broadcastRemoveAccountAuthority(
        requestHandler,
        cloneData,
      );
      const { request_id, ...datas } = cloneData;
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
          message: chrome.i18n.getMessage('bgd_ops_remove_auth', [
            KeychainKeyTypesLC.active,
            'theghost1980',
            mk.user.one,
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });

    it('Must broadcast remove using posting key', async () => {
      const cloneExtended = objects.clone(accounts.extended) as ExtendedAccount;
      cloneExtended.active = {
        weight_threshold: 1,
        account_auths: [['theghost1980', 1]],
        key_auths: [[userData.one.encryptKeys.active, 1]],
      } as AuthorityType;
      jest
        .spyOn(AccountUtils, 'getExtendedAccount')
        .mockResolvedValueOnce(cloneExtended);
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
        id: 'id',
        confirmed: true,
        tx_id: 'tx_id',
      } as TransactionResult);
      const cloneData = objects.clone(
        data.removeAccountAuthority,
      ) as RequestRemoveAccountAuthority & RequestId;
      cloneData.authorizedUsername = 'theghost1980';
      cloneData.role = KeychainKeyTypes.active;
      const requestHandler = new RequestsHandler();
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.posting,
        userData.one.encryptKeys.posting,
      );
      const result = await broadcastRemoveAccountAuthority(
        requestHandler,
        cloneData,
      );
      const { request_id, ...datas } = cloneData;
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
          message: chrome.i18n.getMessage('bgd_ops_remove_auth', [
            KeychainKeyTypesLC.active,
            'theghost1980',
            mk.user.one,
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });

    it('Must broadcast using ledger', async () => {
      const cloneExtended = objects.clone(accounts.extended) as ExtendedAccount;
      cloneExtended.active = {
        weight_threshold: 1,
        account_auths: [['theghost1980', 1]],
        key_auths: [[userData.one.encryptKeys.active, 1]],
      } as AuthorityType;
      jest
        .spyOn(LedgerModule, 'getSignatureFromLedger')
        .mockResolvedValueOnce('signed!');
      jest
        .spyOn(AccountUtils, 'getExtendedAccount')
        .mockResolvedValueOnce(cloneExtended);
      jest
        .spyOn(HiveTxUtils, 'broadcastAndConfirmTransactionWithSignature')
        .mockResolvedValue({
          id: 'id',
          confirmed: true,
          tx_id: 'tx_id',
        } as TransactionResult);
      const cloneData = objects.clone(
        data.removeAccountAuthority,
      ) as RequestRemoveAccountAuthority & RequestId;
      cloneData.authorizedUsername = 'theghost1980';
      cloneData.role = KeychainKeyTypes.active;
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = '#ledgerKEY1234';
      const result = await broadcastRemoveAccountAuthority(
        requestHandler,
        cloneData,
      );
      const { request_id, ...datas } = cloneData;
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
          message: chrome.i18n.getMessage('bgd_ops_remove_auth', [
            KeychainKeyTypesLC.active,
            'theghost1980',
            mk.user.one,
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });
  });

  describe('broadcastAddKeyAuthority cases:\n', () => {
    it('Must return error if key authorized', async () => {
      jest
        .spyOn(AccountUtils, 'getExtendedAccount')
        .mockResolvedValueOnce(accounts.extended);
      const requestHandler = new RequestsHandler();
      const result = await broadcastAddKeyAuthority(
        requestHandler,
        data.addKeyAuthority,
      );
      const { request_id, ...datas } = data.addKeyAuthority;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error: new Error('already_has_authority_error'),
          result: undefined,
          data: datas,
          message: chrome.i18n.getMessage('already_has_authority_error'),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });

    it('Must return error if no key on handler', async () => {
      const cloneData = objects.clone(
        data.addKeyAuthority,
      ) as RequestAddKeyAuthority & RequestId;
      cloneData.authorizedKey = '';
      const requestHandler = new RequestsHandler();
      const result = await broadcastAddKeyAuthority(requestHandler, cloneData);
      const { request_id, ...datas } = cloneData;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error: new Error('html_popup_error_while_signing_transaction'),
          result: undefined,
          data: datas,
          message: chrome.i18n.getMessage(
            'html_popup_error_while_signing_transaction',
          ),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });

    it('Must broadcast addKey using active key', async () => {
      const cloneAccountExtended = objects.clone(
        accounts.extended,
      ) as ExtendedAccount;
      cloneAccountExtended.active = {
        weight_threshold: 1,
        account_auths: [],
        key_auths: [],
      };
      jest
        .spyOn(AccountUtils, 'getExtendedAccount')
        .mockResolvedValueOnce(cloneAccountExtended);
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
        id: 'id',
        confirmed: true,
        tx_id: 'tx_id',
      } as TransactionResult);
      const cloneData = objects.clone(
        data.addKeyAuthority,
      ) as RequestAddKeyAuthority & RequestId;
      cloneData.role = KeychainKeyTypes.active;
      cloneData.authorizedKey = userData.one.encryptKeys.active;
      const requestHandler = new RequestsHandler();
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.active,
        userData.one.encryptKeys.active,
      );
      const result = await broadcastAddKeyAuthority(requestHandler, cloneData);
      const { request_id, ...datas } = cloneData;
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
          message: chrome.i18n.getMessage('bgd_ops_add_key_auth', [
            userData.one.encryptKeys.active,
            KeychainKeyTypesLC.active,
            mk.user.one,
            cloneData.weight.toString(),
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });

    it('Must broadcast addKey using posting key', async () => {
      const cloneAccountExtended = objects.clone(
        accounts.extended,
      ) as ExtendedAccount;
      cloneAccountExtended.active = {
        weight_threshold: 1,
        account_auths: [],
        key_auths: [],
      };
      jest
        .spyOn(AccountUtils, 'getExtendedAccount')
        .mockResolvedValueOnce(cloneAccountExtended);
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
        id: 'id',
        confirmed: true,
        tx_id: 'tx_id',
      } as TransactionResult);
      const cloneData = objects.clone(
        data.addKeyAuthority,
      ) as RequestAddKeyAuthority & RequestId;
      cloneData.role = KeychainKeyTypes.active;
      cloneData.authorizedKey = userData.one.encryptKeys.posting;
      const requestHandler = new RequestsHandler();
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.posting,
        userData.one.encryptKeys.posting,
      );
      const result = await broadcastAddKeyAuthority(requestHandler, cloneData);
      const { request_id, ...datas } = cloneData;
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
          message: chrome.i18n.getMessage('bgd_ops_add_key_auth', [
            userData.one.encryptKeys.posting,
            KeychainKeyTypesLC.active,
            mk.user.one,
            cloneData.weight.toString(),
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });

    it('Must broadcast addKey using ledger', async () => {
      const cloneExtended = objects.clone(accounts.extended) as ExtendedAccount;
      cloneExtended.active = {
        weight_threshold: 1,
        account_auths: [],
        key_auths: [],
      } as AuthorityType;
      jest
        .spyOn(LedgerModule, 'getSignatureFromLedger')
        .mockResolvedValueOnce('signed!');
      jest
        .spyOn(AccountUtils, 'getExtendedAccount')
        .mockResolvedValueOnce(cloneExtended);
      jest
        .spyOn(HiveTxUtils, 'broadcastAndConfirmTransactionWithSignature')
        .mockResolvedValue({
          id: 'id',
          confirmed: true,
          tx_id: 'tx_id',
        } as TransactionResult);
      const cloneData = objects.clone(
        data.addKeyAuthority,
      ) as RequestAddKeyAuthority & RequestId;
      cloneData.authorizedKey = userData.one.encryptKeys.posting;
      cloneData.role = KeychainKeyTypes.active;
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = '#ledgerKEY1234';
      const result = await broadcastAddKeyAuthority(requestHandler, cloneData);
      const { request_id, ...datas } = cloneData;
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
          message: chrome.i18n.getMessage('bgd_ops_add_key_auth', [
            userData.one.encryptKeys.posting,
            KeychainKeyTypesLC.active,
            mk.user.one,
            cloneData.weight.toString(),
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });
  });

  describe('broadcastRemoveKeyAuthority cases:\n', () => {
    it('Must return error if no key on handler', async () => {
      const cloneAccountExtended = objects.clone(
        accounts.extended,
      ) as ExtendedAccount;
      jest
        .spyOn(AccountUtils, 'getExtendedAccount')
        .mockResolvedValueOnce(cloneAccountExtended);
      const requestHandler = new RequestsHandler();
      const result = await broadcastRemoveKeyAuthority(
        requestHandler,
        data.removeKeyAuthority,
      );
      const { request_id, ...datas } = data.removeKeyAuthority;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error: new Error('html_popup_error_while_signing_transaction'),
          result: undefined,
          data: datas,
          message: chrome.i18n.getMessage(
            'html_popup_error_while_signing_transaction',
          ),
          request_id: request_id,
          publicKey: undefined,
        },
      });
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
      jest
        .spyOn(AccountUtils, 'getExtendedAccount')
        .mockResolvedValueOnce(cloneAccountExtended);
      const requestHandler = new RequestsHandler();
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.active,
        userData.one.encryptKeys.active,
      );
      const cloneData = objects.clone(
        data.removeKeyAuthority,
      ) as RequestRemoveKeyAuthority & RequestId;
      cloneData.role = KeychainKeyTypes.active;
      cloneData.authorizedKey = userData.one.encryptKeys.active;
      const result = await broadcastRemoveKeyAuthority(
        requestHandler,
        cloneData,
      );
      const { request_id, ...datas } = cloneData;
      expect(result).toEqual({
        command: DialogCommand.ANSWER_REQUEST,
        msg: {
          success: false,
          error: new KeychainError(localeMessageKey),
          result: undefined,
          data: datas,
          message: chrome.i18n.getMessage('missing_authority_error'),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });

    it('Must remove, posting key', async () => {
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValueOnce({
        id: 'id',
        confirmed: true,
        tx_id: 'tx_id',
      } as TransactionResult);
      const cloneExtended = objects.clone(accounts.extended) as ExtendedAccount;
      jest
        .spyOn(AccountUtils, 'getExtendedAccount')
        .mockResolvedValueOnce(cloneExtended);
      const requestHandler = new RequestsHandler();
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.posting,
        userData.one.encryptKeys.posting,
      );
      const cloneData = objects.clone(
        data.removeKeyAuthority,
      ) as RequestRemoveKeyAuthority & RequestId;
      cloneData.role = KeychainKeyTypes.posting;
      cloneData.authorizedKey = userData.one.encryptKeys.posting;
      const result = await broadcastRemoveKeyAuthority(
        requestHandler,
        cloneData,
      );
      const { request_id, ...datas } = cloneData;
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
          message: chrome.i18n.getMessage('bgd_ops_remove_key_auth', [
            cloneData.authorizedKey,
            KeychainKeyTypesLC.posting,
            mk.user.one,
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });

    it('Must remove active key using ledger', async () => {
      const cloneExtended = objects.clone(accounts.extended) as ExtendedAccount;
      jest
        .spyOn(LedgerModule, 'getSignatureFromLedger')
        .mockResolvedValueOnce('signed!');
      jest
        .spyOn(AccountUtils, 'getExtendedAccount')
        .mockResolvedValueOnce(cloneExtended);
      jest
        .spyOn(HiveTxUtils, 'broadcastAndConfirmTransactionWithSignature')
        .mockResolvedValue({
          id: 'id',
          confirmed: true,
          tx_id: 'tx_id',
        } as TransactionResult);
      const cloneData = objects.clone(
        data.removeKeyAuthority,
      ) as RequestRemoveKeyAuthority & RequestId;
      cloneData.authorizedKey = userData.one.encryptKeys.active;
      cloneData.role = KeychainKeyTypes.active;
      const requestHandler = new RequestsHandler();
      requestHandler.data.key = '#ledgerKEY1234';
      const result = await broadcastRemoveKeyAuthority(
        requestHandler,
        cloneData,
      );
      const { request_id, ...datas } = cloneData;
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
          message: chrome.i18n.getMessage('bgd_ops_remove_key_auth', [
            cloneData.authorizedKey,
            KeychainKeyTypesLC.active,
            mk.user.one,
          ]),
          request_id: request_id,
          publicKey: undefined,
        },
      });
    });
  });
});
