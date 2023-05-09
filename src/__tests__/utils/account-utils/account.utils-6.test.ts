import mk from 'src/__tests__/utils-for-testing/data/mk';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import config from 'src/__tests__/utils-for-testing/setups/config';
import accountUtilsMocks from 'src/__tests__/utils/mocks/account-utils-mocks';
import { KeychainError } from 'src/keychain-error';
import AccountUtils from 'src/utils/account.utils';
import MkUtils from 'src/utils/mk.utils';
config.byDefault();
describe('account.utils part 6 tests:\n', () => {
  const { extraMocks, constants, methods } = accountUtilsMocks;
  const { userData, userDataKeys, activeAccountData, accounts } = constants;
  methods.afterEach;
  describe('addAuthorizedAccount tests:\n', () => {
    afterEach(() => {
      jest.fn().mockClear();
    });
    test('Must throw error if empty data', async () => {
      try {
        await AccountUtils.addAuthorizedAccount('', '', []);
      } catch (error) {
        expect(error).toEqual(new KeychainError('popup_accounts_fill'));
      }
    });
    test('Must throw error if empty authorizedAccount,existingAccounts', async () => {
      try {
        await AccountUtils.addAuthorizedAccount('workerjab1', '', []);
      } catch (error) {
        expect(error).toEqual(new KeychainError('popup_accounts_fill'));
      }
    });
    test('Must throw error if account not present', async () => {
      try {
        await AccountUtils.addAuthorizedAccount('workerjab1', 'workerjab2', []);
      } catch (error) {
        expect(error).toEqual(new KeychainError('popup_no_auth_account'));
      }
    });
    test('Must throw error if already registered', async () => {
      try {
        await AccountUtils.addAuthorizedAccount('workerjab1', 'workerjab1', [
          { name: 'workerjab1', keys: {} },
          { name: 'someguy123', keys: {} },
        ]);
      } catch (error) {
        expect(error).toEqual(
          new KeychainError('popup_accounts_already_registered'),
        );
      }
    });
    test('Must throw error if account not found', async () => {
      AccountUtils.getAccount = jest.fn().mockResolvedValue(undefined);
      try {
        await AccountUtils.addAuthorizedAccount('workerjab', 'workerjab1', [
          { name: 'workerjab1', keys: {} },
          { name: 'someguy123', keys: {} },
        ]);
      } catch (error) {
        expect(error).toEqual(
          new KeychainError('popup_accounts_incorrect_user'),
        );
      }
    });
    test('Must throw error if unathorized account', async () => {
      AccountUtils.getAccount = jest
        .fn()
        .mockResolvedValue([utilsT.fakeQuentinAccResponseWithNoAuth]);
      try {
        await AccountUtils.addAuthorizedAccount('quentin', 'workerjab1', [
          { name: 'workerjab1', keys: userDataKeys },
        ]);
      } catch (error) {
        expect(error).toEqual(new KeychainError('popup_accounts_no_auth'));
      }
    });
    test('Must return account keys', async () => {
      AccountUtils.getAccount = jest
        .fn()
        .mockResolvedValue([utilsT.fakeQuentinAccResponseWithAuth]);
      const expectedKeysObject = {
        posting: userData.nonEncryptKeys.posting,
        postingPubkey: `@${userData.username}`,
        active: userData.nonEncryptKeys.active,
        activePubkey: `@${userData.username}`,
      };
      const result_addAuthorizedAccount =
        await AccountUtils.addAuthorizedAccount('quentin', 'keychain.tests', [
          { name: 'keychain.tests', keys: userDataKeys },
        ]);

      expect(result_addAuthorizedAccount).toEqual(expectedKeysObject);
    });
  });

  describe('addKeyFromLedger cases:\n', () => {
    const { spies } = accountUtilsMocks;
    it('Must call saveAccounts', async () => {
      MkUtils.getMkFromLocalStorage = jest.fn().mockResolvedValue(mk.user.one);
      AccountUtils.getAccountsFromLocalStorage = jest
        .fn()
        .mockResolvedValue(accounts);
      await AccountUtils.addKeyFromLedger(mk.user.one, {});
      expect(spies.saveAccounts()).toBeCalledWith(accounts, mk.user.one);
    });
  });

  //TODO bellow fix tests!
  // describe('claimAccounts cases:\n', () => {
  //   const { spies } = accountUtilsMocks;
  //   it('Must call logger after success', async () => {
  //     const oldOconfig = Config.claims.freeAccount;
  //     Config.claims.freeAccount.MIN_RC = 0;
  //     Config.claims.freeAccount.MIN_RC_PCT = 0;
  //     HiveTxUtils.sendOperation = jest.fn().mockResolvedValue(true);
  //     expect(
  //       await AccountUtils.claimAccounts(
  //         { percentage: 100, current_mana: 10000000 } as Manabar,
  //         activeAccountData,
  //       ),
  //     ).toBe(true);
  //     expect(spies.logger.info).toBeCalledWith(
  //       `Claiming free account for @${activeAccountData.name}`,
  //     );
  //     Config.claims.freeAccount.MIN_RC = oldOconfig.MIN_RC;
  //     Config.claims.freeAccount.MIN_RC_PCT = oldOconfig.MIN_RC_PCT;
  //   });
  //   // it('Must call logger info if not RC enough', async () => {
  //   //   const oldOconfig = Config.claims.freeAccount;
  //   //   Config.claims.freeAccount.MIN_RC = 10;
  //   //   Config.claims.freeAccount.MIN_RC_PCT = 10;
  //   //   HiveTxUtils.sendOperation = jest.fn().mockResolvedValue(true);
  //   //   expect(
  //   //     await AccountUtils.claimAccounts(
  //   //       { percentage: 0, current_mana: 0 } as Manabar,
  //   //       activeAccountData,
  //   //     ),
  //   //   ).toBe(undefined);
  //   //   expect(spies.logger.info).toBeCalledWith(
  //   //     'Not enough RC% to claim account',
  //   //   );
  //   //   Config.claims.freeAccount.MIN_RC = oldOconfig.MIN_RC;
  //   //   Config.claims.freeAccount.MIN_RC_PCT = oldOconfig.MIN_RC_PCT;
  //   // });
  // });
});
