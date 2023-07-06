import { ExtendedAccount } from '@hiveio/dhive';
import { Keys, KeyType } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import {
  initialEmptyStateStore,
  initialStateWAccountsWActiveAccountStore,
  initialStateWOneKey,
} from 'src/__tests__/utils-for-testing/initial-states';
import * as accountActions from 'src/popup/hive/actions/account.actions';
import { setErrorMessage } from 'src/popup/hive/actions/message.actions';
import AccountUtils from 'src/utils/account.utils';

describe('account.actions tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('retrieveAccounts tests:\n', () => {
    test('With no accounts returned from local storage', async () => {
      let fakeStore = getFakeStore(initialEmptyStateStore);
      jest
        .spyOn(AccountUtils, 'getAccountsFromLocalStorage')
        .mockResolvedValueOnce([]);

      await fakeStore.dispatch<any>(
        accountActions.retrieveAccounts(mk.user.one),
      );
      expect(fakeStore.getState().accounts).toEqual([]);
    });

    test('With accounts returned from local storage', async () => {
      let fakeStore = getFakeStore(initialEmptyStateStore);

      const spyGetAccountsFromLocalStorage = jest
        .spyOn(AccountUtils, 'getAccountsFromLocalStorage')
        .mockResolvedValueOnce(
          initialStateWAccountsWActiveAccountStore.accounts,
        );

      await fakeStore.dispatch<any>(
        accountActions.retrieveAccounts(mk.user.one),
      );
      expect(fakeStore.getState().accounts).toEqual(
        initialStateWAccountsWActiveAccountStore.accounts,
      );
      spyGetAccountsFromLocalStorage.mockReset();
      spyGetAccountsFromLocalStorage.mockRestore();
    });
  });

  describe('addAccount tests:\n', () => {
    test('Must add the new account', async () => {
      let fakeStore = getFakeStore(initialEmptyStateStore);
      const account = {
        name: mk.user.one,
        keys: { activePubkey: userData.one.encryptKeys.active },
      } as LocalAccount;
      await fakeStore.dispatch<any>(accountActions.addAccount(account));
      expect(fakeStore.getState().accounts).toEqual([account]);
    });
  });

  describe('resetAccount tests:\n', () => {
    test('Must delete accounts', async () => {
      let fakeStore = getFakeStore(initialStateWAccountsWActiveAccountStore);
      await fakeStore.dispatch<any>(accountActions.resetAccount());
      expect(fakeStore.getState().accounts).toEqual([]);
    });
  });

  describe('setAccounts tests:\n', () => {
    test('Must set accounts', async () => {
      const accounts = [
        { name: 'aggroed', keys: {} },
        { name: 'quentin', keys: {} },
      ] as LocalAccount[];
      let fakeStore = getFakeStore(initialStateWAccountsWActiveAccountStore);
      await fakeStore.dispatch<any>(accountActions.setAccounts(accounts));
      expect(fakeStore.getState().accounts).toEqual(accounts);
    });
  });

  describe('addKey tests:\n', () => {
    const activePrivateKey =
      '5AAR76THISBLbISkmFAKEMND95bMveeEu8jPSZWLh5X6DhcnKzM';
    const keyType = KeyType.ACTIVE;
    test('with a valid key, must add the key to the existing account', async () => {
      const accountAddedKey = {
        name: userData.two.username,
        keys: { ...userData.two.keys, active: activePrivateKey },
      } as LocalAccount;
      jest
        .spyOn(AccountUtils, 'addKey')
        .mockResolvedValueOnce([accountAddedKey]);
      let fakeStore = getFakeStore(initialStateWOneKey);
      await fakeStore.dispatch<any>(
        accountActions.addKey(activePrivateKey, keyType, setErrorMessage),
      );
      expect(fakeStore.getState().accounts).toEqual([accountAddedKey]);
      expect(fakeStore.getState().activeAccount.keys.active).toBe(
        activePrivateKey,
      );
    });
    test('with an invalid key, must not affect accounts', async () => {
      jest.spyOn(AccountUtils, 'addKey').mockResolvedValueOnce(undefined);
      let fakeStore = getFakeStore(initialStateWOneKey);
      await fakeStore.dispatch<any>(
        accountActions.addKey(activePrivateKey, keyType, setErrorMessage),
      );
      expect(fakeStore.getState().accounts).toEqual(
        initialStateWOneKey.accounts,
      );
    });
  });

  describe('removeKey tests:\n', () => {
    const fakeExtendedAccountResponse = [
      {
        name: userData.two.username,
        reputation: 100,
      } as ExtendedAccount,
    ];
    test('Must not remove the key since it is the last one', async () => {
      let fakeStore = getFakeStore(initialStateWOneKey);

      const keyType = KeyType.POSTING;
      jest
        .spyOn(AccountUtils, 'deleteKey')
        .mockReturnValueOnce(initialStateWOneKey.accounts);
      jest
        .spyOn(AccountUtils, 'getAccount')
        .mockResolvedValueOnce(fakeExtendedAccountResponse);
      jest.spyOn(AccountUtils, 'getRCMana').mockResolvedValueOnce({
        current_mana: 99,
        received_delegated_rc: 0,
        max_mana: 100,
        max_rc: 100,
        delegated_rc: 0,
        percentage: 100,
        rc_manabar: {
          current_mana: '12321000',
          last_update_time: 12311224,
        },
      });

      await fakeStore.dispatch<any>(accountActions.removeKey(keyType));
      expect(fakeStore.getState().accounts).toEqual(
        initialStateWOneKey.accounts,
      );
      expect(fakeStore.getState().activeAccount).toEqual(
        initialStateWOneKey.activeAccount,
      );
    });
    test('Must remove the posting key and update active account keys', async () => {
      const deletedPostingKeyAccounts = [
        {
          name: mk.user.one,
          keys: {
            active: userData.one.nonEncryptKeys.active,
            activePubkey: userData.one.encryptKeys.active,
            memo: userData.one.nonEncryptKeys.memo,
            memoPubkey: userData.one.encryptKeys.memo,
          } as Keys,
        },
        userData.two,
      ] as LocalAccount[];
      const keyType = KeyType.POSTING;
      jest
        .spyOn(AccountUtils, 'deleteKey')
        .mockReturnValueOnce(deletedPostingKeyAccounts);
      let fakeStore = getFakeStore(initialStateWAccountsWActiveAccountStore);
      await fakeStore.dispatch<any>(accountActions.removeKey(keyType));
      expect(fakeStore.getState().accounts).toEqual(deletedPostingKeyAccounts);
      expect(fakeStore.getState().activeAccount).toEqual({
        account: { name: mk.user.one },
        keys: deletedPostingKeyAccounts[0].keys,
        name: mk.user.one,
        rc: {},
      });
    });
    test('Must remove the active key and update active account keys', async () => {
      const deletedActiveKeyAccounts = [
        {
          name: mk.user.one,
          keys: {
            memo: userData.one.nonEncryptKeys.memo,
            memoPubkey: userData.one.encryptKeys.active,
            posting: userData.one.nonEncryptKeys.posting,
            postingPubkey: userData.one.encryptKeys.active,
          } as Keys,
        },
        userData.two,
      ] as LocalAccount[];
      const keyType = KeyType.ACTIVE;
      jest
        .spyOn(AccountUtils, 'deleteKey')
        .mockReturnValueOnce(deletedActiveKeyAccounts);
      let fakeStore = getFakeStore(initialStateWAccountsWActiveAccountStore);
      await fakeStore.dispatch<any>(accountActions.removeKey(keyType));
      expect(fakeStore.getState().accounts).toEqual(deletedActiveKeyAccounts);
      expect(fakeStore.getState().activeAccount).toEqual({
        account: { name: mk.user.one },
        keys: deletedActiveKeyAccounts[0].keys,
        name: mk.user.one,
        rc: {},
      });
    });
    test('Must remove the memo key and update active account keys', async () => {
      const deletedMemoKeyAccounts = [
        {
          name: mk.user.one,
          keys: {
            active: userData.one.nonEncryptKeys.active,
            activePubkey: userData.one.encryptKeys.active,
            posting: userData.one.nonEncryptKeys.posting,
            postingPubkey: userData.one.encryptKeys.active,
          } as Keys,
        },
        userData.two,
      ] as LocalAccount[];
      const keyType = KeyType.MEMO;
      jest
        .spyOn(AccountUtils, 'deleteKey')
        .mockReturnValueOnce(deletedMemoKeyAccounts);
      let fakeStore = getFakeStore(initialStateWAccountsWActiveAccountStore);
      await fakeStore.dispatch<any>(accountActions.removeKey(keyType));
      expect(fakeStore.getState().accounts).toEqual(deletedMemoKeyAccounts);
      expect(fakeStore.getState().activeAccount).toEqual({
        account: { name: mk.user.one },
        keys: deletedMemoKeyAccounts[0].keys,
        name: mk.user.one,
        rc: {},
      });
    });
  });
});
