import { AccountCreationUtils } from 'src/utils/account-creation.utils';
import AccountUtils from 'src/utils/account.utils';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import {
  transactionConfirmationFailed,
  transactionConfirmationSuccess,
} from 'src/__tests__/utils-for-testing/data/confirmations';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import accountCreationUtilsMocks from 'src/__tests__/utils/mocks/account-creation.utils-mocks';

describe('account-creation.utils.ts tests:/n', () => {
  const { constants, methods } = accountCreationUtilsMocks;
  methods.afterAll;
  describe('checkAccountNameAvailable cases:/n', () => {
    it('Must return false if not available account name', async () => {
      AccountUtils.getExtendedAccount = jest.fn().mockResolvedValue({});
      expect(
        await AccountCreationUtils.checkAccountNameAvailable('nameTaken'),
      ).toBe(false);
    });

    it('Must return true if available account name', async () => {
      AccountUtils.getExtendedAccount = jest.fn().mockResolvedValue(undefined);
      expect(
        await AccountCreationUtils.checkAccountNameAvailable('nameNotTaken'),
      ).toBe(true);
    });
  });

  describe('generateMasterKey cases:/n', () => {
    it('Must generate a random master password', () => {
      const masterPassword = AccountCreationUtils.generateMasterKey();
      expect(masterPassword[0]).toBe('P');
      expect(masterPassword.length).toBe(52);
    });
  });

  describe('validateUsername cases:/n', () => {
    it('Must return true if valid name', () => {
      expect(AccountCreationUtils.validateUsername('theghost1980')).toBe(true);
    });

    it('Must return false if invalid name', () => {
      expect(AccountCreationUtils.validateUsername('the@ghost1980')).toBe(
        false,
      );
    });
  });

  describe('createAccount cases:/n', () => {
    it('Must return localAccount when buying account', async () => {
      const mhiveTxSendOp = jest
        .spyOn(HiveTxUtils, 'sendOperation')
        .mockResolvedValue(transactionConfirmationSuccess);
      expect(
        await AccountCreationUtils.createAccount(
          constants.creationType.buying,
          constants.newAccountName,
          userData.one.username,
          userData.one.nonEncryptKeys.active,
          constants.accountAuthorities,
          1,
          constants.generatedKeys,
        ),
      ).toEqual({
        name: constants.newAccountName,
        keys: {
          active: constants.generatedKeys.active.private,
          activePubkey: constants.generatedKeys.active.public,
          posting: constants.generatedKeys.posting.private,
          postingPubkey: constants.generatedKeys.posting.public,
          memo: constants.generatedKeys.memo.private,
          memoPubkey: constants.generatedKeys.memo.public,
        },
      });
      mhiveTxSendOp.mockRestore();
    });

    it('Must return false if buying account fails', async () => {
      const mhiveTxSendOp = jest
        .spyOn(HiveTxUtils, 'sendOperation')
        .mockResolvedValue(transactionConfirmationFailed);
      expect(
        await AccountCreationUtils.createAccount(
          constants.creationType.buying,
          constants.newAccountName,
          userData.one.username,
          userData.one.nonEncryptKeys.active,
          constants.accountAuthorities,
          1,
          constants.generatedKeys,
        ),
      ).toEqual(false);
      mhiveTxSendOp.mockRestore();
    });

    it('Must return false if no generatedKeys when buying account', async () => {
      const mhiveTxSendOp = jest
        .spyOn(HiveTxUtils, 'sendOperation')
        .mockResolvedValue(transactionConfirmationSuccess);
      expect(
        await AccountCreationUtils.createAccount(
          constants.creationType.buying,
          constants.newAccountName,
          userData.one.username,
          userData.one.nonEncryptKeys.active,
          constants.accountAuthorities,
          1,
        ),
      ).toEqual(false);
      mhiveTxSendOp.mockRestore();
    });

    it('Must return localAccount when using ticket', async () => {
      const mhiveTxSendOp = jest
        .spyOn(HiveTxUtils, 'sendOperation')
        .mockResolvedValue(transactionConfirmationSuccess);
      expect(
        await AccountCreationUtils.createAccount(
          constants.creationType.usingTicket,
          constants.newAccountName,
          userData.one.username,
          userData.one.nonEncryptKeys.active,
          constants.accountAuthorities,
          1,
          constants.generatedKeys,
        ),
      ).toEqual({
        name: constants.newAccountName,
        keys: {
          active: constants.generatedKeys.active.private,
          activePubkey: constants.generatedKeys.active.public,
          posting: constants.generatedKeys.posting.private,
          postingPubkey: constants.generatedKeys.posting.public,
          memo: constants.generatedKeys.memo.private,
          memoPubkey: constants.generatedKeys.memo.public,
        },
      });
      mhiveTxSendOp.mockRestore();
    });

    it('Must return false if using ticket fails', async () => {
      const mhiveTxSendOp = jest
        .spyOn(HiveTxUtils, 'sendOperation')
        .mockResolvedValue(transactionConfirmationFailed);
      expect(
        await AccountCreationUtils.createAccount(
          constants.creationType.usingTicket,
          constants.newAccountName,
          userData.one.username,
          userData.one.nonEncryptKeys.active,
          constants.accountAuthorities,
          1,
          constants.generatedKeys,
        ),
      ).toEqual(false);
      mhiveTxSendOp.mockRestore();
    });

    it('Must return false if no generatedKeys when using ticket', async () => {
      const mhiveTxSendOp = jest
        .spyOn(HiveTxUtils, 'sendOperation')
        .mockResolvedValue(transactionConfirmationSuccess);
      expect(
        await AccountCreationUtils.createAccount(
          constants.creationType.usingTicket,
          constants.newAccountName,
          userData.one.username,
          userData.one.nonEncryptKeys.active,
          constants.accountAuthorities,
          1,
        ),
      ).toEqual(false);
      mhiveTxSendOp.mockRestore();
    });
  });
});
