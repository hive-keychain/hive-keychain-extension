import { KeychainApi } from '@api/keychain';
import Hive, { Settings } from '@engrave/ledger-app-hive';
import { HiveTxUtils } from '@hiveapp/utils/hive-tx.utils';
import TransferUtils from '@hiveapp/utils/transfer.utils';
import {
  AccountCreateOperation,
  Operation,
  SignedTransaction,
} from '@hiveio/dhive';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import {
  Transaction as HiveTransaction,
  config as HiveTxConfig,
} from 'hive-tx';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import { KeychainError } from 'src/keychain-error';
import { LedgerUtils } from 'src/utils/ledger.utils';
import Logger from 'src/utils/logger.utils';

describe('hive-tx.utils.ts tests:\n', () => {
  const constants = {
    operations: [
      {
        0: 'account_create',
        1: {
          fee: '1 HIVE',
          creator: mk.user.one,
          new_account_name: 'new_account',
          owner: accounts.extended.owner,
          active: accounts.extended.active,
          posting: accounts.extended.posting,
          memo_key: accounts.extended.memo_key,
          json_metadata: {},
        } as unknown as AccountCreateOperation,
      },
    ] as Operation[],
    tx: {
      expiration: '10/10/2023',
      extensions: [],
      operations: [
        TransferUtils.getRecurrentTransferOperation(
          'sender',
          'receiver',
          '1.000 HBD',
          '',
          24,
          2,
        ),
      ],
      ref_block_num: 1125554,
      ref_block_prefix: 1111222,
    },
    broadcastResponse: {
      success: {
        id: 999,
        jsonrpc: 'condenser_api',
        result: {
          tx_id: '9999',
          status: 'confirmed',
        },
      },
      error: {
        error: 'Error',
      },
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  describe('setRpc cases:\n', () => {
    it('Must set Rpc from KeychainApi', async () => {
      jest
        .spyOn(KeychainApi, 'get')
        .mockResolvedValue({ rpc: DefaultRpcs[1].uri });
      await HiveTxUtils.setRpc({ uri: 'DEFAULT', testnet: false });
      expect(HiveTxConfig.node).toEqual(DefaultRpcs[1].uri);
    });

    it('Must set Rpc', async () => {
      await HiveTxUtils.setRpc({ ...DefaultRpcs[2], chainId: 'chain_Id' });
      expect(HiveTxConfig.node).toEqual(DefaultRpcs[2].uri);
    });
  });

  describe('createSignAndBroadcastTransaction cases: \n', () => {
    describe('not using ledger & no signHash:\n', () => {
      it('Must catch error, call logger and throw Error if not valid key', async () => {
        const sLoggerError = jest.spyOn(Logger, 'error');
        jest
          .spyOn(HiveTransaction.prototype, 'create')
          .mockResolvedValue(constants.tx);
        try {
          await HiveTxUtils.createSignAndBroadcastTransaction(
            constants.operations,
            userData.one.encryptKeys.posting,
          );
        } catch (error) {
          expect(sLoggerError).toBeCalledWith(new Error('invalid private key'));
          expect(error).toEqual(
            new Error('html_popup_error_while_signing_transaction'),
          );
        }
      });
    });

    describe('using ledger:\n', () => {
      it('Must catch and throw error if is not Displayable On Device', async () => {
        jest
          .spyOn(HiveTransaction.prototype, 'create')
          .mockResolvedValue(constants.tx);
        jest
          .spyOn(LedgerUtils, 'getSettings')
          .mockResolvedValue({ hashSignPolicy: false } as Settings);
        jest.spyOn(Hive, 'isDisplayableOnDevice').mockReturnValue(false);
        try {
          await HiveTxUtils.createSignAndBroadcastTransaction(
            constants.operations,
            '#ajjsk1121312312',
          );
        } catch (error) {
          expect(error).toEqual(
            new KeychainError('error_ledger_no_hash_sign_policy'),
          );
        }
      });

      it('Must throw error', async () => {
        jest
          .spyOn(HiveTransaction.prototype, 'create')
          .mockResolvedValue(constants.tx);
        jest
          .spyOn(LedgerUtils, 'getSettings')
          .mockResolvedValue({ hashSignPolicy: true } as Settings);
        jest.spyOn(Hive, 'isDisplayableOnDevice').mockReturnValue(true);
        jest
          .spyOn(LedgerUtils, 'signTransaction')
          .mockResolvedValue({} as SignedTransaction);
        const sLoggerError = jest.spyOn(Logger, 'error');
        try {
          await HiveTxUtils.createSignAndBroadcastTransaction(
            constants.operations,
            '#ajjsk1121312312',
          );
        } catch (error) {
          expect(error).toEqual(
            new TypeError("Cannot read properties of undefined (reading '0')"), //new KeychainError('popup_html_ledger_unknown_error'),
          );
          expect(sLoggerError).toBeCalledWith(
            new TypeError("Cannot read properties of undefined (reading '0')"),
          );
        }
      });

      it('Must throw error and call logger if getSettings fails', async () => {
        jest
          .spyOn(HiveTransaction.prototype, 'create')
          .mockResolvedValue(constants.tx);
        jest
          .spyOn(LedgerUtils, 'getSettings')
          .mockRejectedValue(new Error('error getting settings'));

        try {
          await HiveTxUtils.createSignAndBroadcastTransaction(
            constants.operations,
            '#ajjsk1121312312',
          );
        } catch (error) {
          expect(error).toEqual(
            new KeychainError('popup_html_ledger_unknown_error'),
          );
        }
      });

      it('Must throw error if broadcast fails', async () => {
        jest
          .spyOn(HiveTransaction.prototype, 'create')
          .mockResolvedValue(constants.tx);
        jest
          .spyOn(LedgerUtils, 'getSettings')
          .mockResolvedValue({ hashSignPolicy: true } as Settings);
        jest.spyOn(Hive, 'isDisplayableOnDevice').mockReturnValue(false);
        jest
          .spyOn(HiveTransaction.prototype, 'addSignature')
          .mockReturnValue({ ...constants.tx, signatures: ['signature'] });
        jest
          .spyOn(Hive, 'getTransactionDigest')
          .mockReturnValue('string_digest');
        jest.spyOn(LedgerUtils, 'signHash').mockResolvedValue('signed_string');
        jest
          .spyOn(HiveTransaction.prototype, 'broadcast')
          .mockRejectedValue(new Error('error broadcasting'));

        try {
          await HiveTxUtils.createSignAndBroadcastTransaction(
            constants.operations,
            '#ajjsk1121312312',
          );
        } catch (error) {
          expect(error).toEqual(
            new Error('html_popup_error_while_broadcasting'),
          );
        }
      });
    });
  });

  describe('signTransaction cases:\n', () => {
    describe('isUsingLedger cases:\n', () => {
      it('Must throw error if no hashSignPolicy prop', async () => {
        jest
          .spyOn(LedgerUtils, 'getSettings')
          .mockRejectedValue(new Error('ledger not detected'));
        try {
          await HiveTxUtils.signTransaction(constants.tx, '#1qw23eer4e');
        } catch (error) {
          expect(error).toEqual(
            new KeychainError('popup_html_ledger_unknown_error'),
          );
        }
      });

      it('Must throw error if signHash', async () => {
        jest
          .spyOn(LedgerUtils, 'getSettings')
          .mockResolvedValue({ hashSignPolicy: false });

        try {
          await HiveTxUtils.signTransaction(constants.tx, '#1qw23eer4e');
        } catch (error) {
          expect(error).toEqual(
            new KeychainError('error_ledger_no_hash_sign_policy'),
          );
        }
      });

      it('Must throw error if is not Displayable On Device & hashSignPolicy is false', async () => {
        jest
          .spyOn(LedgerUtils, 'getSettings')
          .mockResolvedValue({ hashSignPolicy: false });
        jest.spyOn(Hive, 'isDisplayableOnDevice').mockReturnValue(false);
        try {
          await HiveTxUtils.signTransaction(constants.tx, '#1qw23eer4e');
        } catch (error) {
          expect(error).toEqual(
            new KeychainError('error_ledger_no_hash_sign_policy'),
          );
        }
      });

      it('Must return signature using LedgerUtils.signTransaction', async () => {
        jest
          .spyOn(LedgerUtils, 'getSettings')
          .mockResolvedValue({ hashSignPolicy: true });
        jest.spyOn(Hive, 'isDisplayableOnDevice').mockReturnValue(true);
        jest.spyOn(LedgerUtils, 'signTransaction').mockResolvedValue({
          ...constants.tx,
          signatures: ['signed_here'],
        });
        expect(
          await HiveTxUtils.signTransaction(constants.tx, '#qqqw11'),
        ).toEqual({
          ...constants.tx,
          signatures: ['signed_here'],
        });
      });

      it('Must throw error if LedgerUtils.signTransaction fails', async () => {
        jest
          .spyOn(LedgerUtils, 'getSettings')
          .mockResolvedValue({ hashSignPolicy: false });
        jest.spyOn(Hive, 'isDisplayableOnDevice').mockReturnValue(true);

        try {
          await HiveTxUtils.signTransaction(constants.tx, '#qqqw11');
        } catch (error) {
          expect(error).toEqual(new KeychainError('html_ledger_not_supported'));
        }
      });

      it('Must throw error and call logger if signHash fails', async () => {
        jest
          .spyOn(LedgerUtils, 'getSettings')
          .mockResolvedValue({ hashSignPolicy: true });
        jest.spyOn(Hive, 'isDisplayableOnDevice').mockReturnValue(false);
        jest
          .spyOn(Hive, 'getTransactionDigest')
          .mockReturnValue('string_digest');
        jest
          .spyOn(LedgerUtils, 'signHash')
          .mockRejectedValue(new Error('signHash error'));
        const sLoggerError = jest.spyOn(Logger, 'error');
        try {
          await HiveTxUtils.signTransaction(constants.tx, '#qqqw11');
        } catch (error) {
          expect(error).toEqual(new Error('signHash error'));
          expect(sLoggerError).toBeCalledWith(new Error('signHash error'));
        }
      });
    });

    describe('not using Ledger cases:\n', () => {
      it('Must return transaction signed', async () => {
        jest
          .spyOn(HiveTransaction.prototype, 'sign')
          .mockReturnValue({ ...constants.tx, signatures: ['signed'] });
        expect(
          await HiveTxUtils.signTransaction(
            constants.tx,
            userData.one.nonEncryptKeys.active,
          ),
        ).toEqual({ ...constants.tx, signatures: ['signed'] });
      });

      it('Must throw error and call logger if not valid key', async () => {
        const sLoggerError = jest.spyOn(Logger, 'error');
        try {
          await HiveTxUtils.signTransaction(
            constants.tx,
            userData.one.encryptKeys.active,
          );
        } catch (error) {
          expect(error).toEqual(
            new KeychainError('html_popup_error_while_signing_transaction'),
          );
          expect(sLoggerError).toBeCalledWith(new Error('invalid private key'));
        }
      });
    });
  });

  describe('broadcastAndConfirmTransactionWithSignature cases:\n', () => {
    it('Must throw error and call logger if error on Hive Tx', async () => {
      jest
        .spyOn(HiveTransaction.prototype, 'addSignature')
        .mockReturnValue({ ...constants.tx, signatures: ['signature'] });
      jest
        .spyOn(HiveTransaction.prototype, 'broadcast')
        .mockRejectedValue(constants.broadcastResponse.error);
      const sLoggerError = jest.spyOn(Logger, 'error');
      try {
        await HiveTxUtils.broadcastAndConfirmTransactionWithSignature(
          constants.tx,
          'signature',
        );
      } catch (error) {
        expect(error).toEqual(
          new KeychainError('html_popup_error_while_broadcasting'),
        );
        expect(sLoggerError).toBeCalledWith(constants.broadcastResponse.error);
      }
    });

    it('Must throw error and call logger if error on broadcast', async () => {
      jest
        .spyOn(HiveTransaction.prototype, 'addSignature')
        .mockReturnValue({ ...constants.tx, signatures: ['signature'] });
      jest
        .spyOn(HiveTransaction.prototype, 'broadcast')
        .mockRejectedValue(new Error('error on broadcast'));
      const sLoggerError = jest.spyOn(Logger, 'error');
      try {
        await HiveTxUtils.broadcastAndConfirmTransactionWithSignature(
          constants.tx,
          'signature',
        );
      } catch (error) {
        expect(error).toEqual(new Error('html_popup_error_while_broadcasting'));
        expect(sLoggerError).toBeCalledWith(new Error('error on broadcast'));
      }
    });
  });
});
