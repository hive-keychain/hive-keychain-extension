import { ExtendedAccount } from '@hiveio/dhive';
import { Manabar } from '@hiveio/dhive/lib/chain/rc';
import { Keys, KeyType } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import * as accountActions from 'src/popup/actions/account.actions';
import AccountUtils from 'src/utils/account.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import {
  initialEmptyStateStore,
  initialStateWAccountsWActiveAccountStore,
  initialStateWOneKey,
} from 'src/__tests__/utils-for-testing/initial-states';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import config from 'src/__tests__/utils-for-testing/setups/config';
config.byDefault();
afterEach(() => {
  jest.clearAllMocks();
});
describe('account.actions tests:\n', () => {
  describe('retrieveAccounts tests:\n', () => {
    test('With no accounts returned from local storage', async () => {
      let fakeStore = getFakeStore(initialEmptyStateStore);
      const mk = utilsT.userData.username;
      jest
        .spyOn(AccountUtils, 'getAccountsFromLocalStorage')
        .mockResolvedValueOnce(undefined);

      await fakeStore.dispatch<any>(accountActions.retrieveAccounts(mk));
      expect(fakeStore.getState().accounts).toEqual([]);
    });

    test('With accounts returned from local storage', async () => {
      let fakeStore = getFakeStore(initialEmptyStateStore);

      const mk = utilsT.userData.username;

      const spyGetAccountsFromLocalStorage = jest
        .spyOn(AccountUtils, 'getAccountsFromLocalStorage')
        .mockResolvedValueOnce(
          initialStateWAccountsWActiveAccountStore.accounts,
        );

      await fakeStore.dispatch<any>(accountActions.retrieveAccounts(mk));
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
        name: utilsT.userData.username,
        keys: { activePubkey: utilsT.userData.encryptKeys.active },
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
        name: utilsT.secondAccountOnState.name,
        keys: { ...utilsT.secondAccountOnState.keys, active: activePrivateKey },
      } as LocalAccount;
      jest
        .spyOn(AccountUtils, 'addKey')
        .mockResolvedValueOnce([accountAddedKey]);
      let fakeStore = getFakeStore(initialStateWOneKey);
      await fakeStore.dispatch<any>(
        accountActions.addKey(activePrivateKey, keyType),
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
        accountActions.addKey(activePrivateKey, keyType),
      );
      expect(fakeStore.getState().accounts).toEqual(
        initialStateWOneKey.accounts,
      );
    });
  });
  describe('removeKey tests:\n', () => {
    const fakeExtendedAccountResponse = [
      {
        name: utilsT.secondAccountOnState.name,
        reputation: 100,
      } as ExtendedAccount,
    ];
    const fakeManaBarResponse = { current_mana: 99 } as Manabar;
    const accountNoPostingKeys = {
      name: utilsT.secondAccountOnState.name,
      keys: {},
    } as LocalAccount;
    test('Must not remove the key since it is the last one', async () => {
      let fakeStore = getFakeStore(initialStateWOneKey);

      const keyType = KeyType.POSTING;
      jest
        .spyOn(AccountUtils, 'deleteKey')
        .mockReturnValueOnce(initialStateWOneKey.accounts);
      mockPreset.setOrDefault({
        app: {
          getAccount: fakeExtendedAccountResponse,
          getRCMana: fakeManaBarResponse,
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
          name: utilsT.userData.username,
          keys: {
            active: utilsT.keysUserData1.active,
            activePubkey: utilsT.keysUserData1.activePubkey,
            memo: utilsT.keysUserData1.memo,
            memoPubkey: utilsT.keysUserData1.memoPubkey,
          } as Keys,
        },
        utilsT.secondAccountOnState,
      ] as LocalAccount[];
      const keyType = KeyType.POSTING;
      jest
        .spyOn(AccountUtils, 'deleteKey')
        .mockReturnValueOnce(deletedPostingKeyAccounts);
      let fakeStore = getFakeStore(initialStateWAccountsWActiveAccountStore);
      await fakeStore.dispatch<any>(accountActions.removeKey(keyType));
      expect(fakeStore.getState().accounts).toEqual(deletedPostingKeyAccounts);
      expect(fakeStore.getState().activeAccount).toEqual({
        account: { name: utilsT.userData.username },
        keys: deletedPostingKeyAccounts[0].keys,
        name: utilsT.userData.username,
        rc: {},
      });
    });
    test('Must remove the active key and update active account keys', async () => {
      const deletedActiveKeyAccounts = [
        {
          name: utilsT.userData.username,
          keys: {
            memo: utilsT.keysUserData1.memo,
            memoPubkey: utilsT.keysUserData1.memoPubkey,
            posting: utilsT.keysUserData1.posting,
            postingPubkey: utilsT.keysUserData1.postingPubkey,
          } as Keys,
        },
        utilsT.secondAccountOnState,
      ] as LocalAccount[];
      const keyType = KeyType.ACTIVE;
      jest
        .spyOn(AccountUtils, 'deleteKey')
        .mockReturnValueOnce(deletedActiveKeyAccounts);
      let fakeStore = getFakeStore(initialStateWAccountsWActiveAccountStore);
      await fakeStore.dispatch<any>(accountActions.removeKey(keyType));
      expect(fakeStore.getState().accounts).toEqual(deletedActiveKeyAccounts);
      expect(fakeStore.getState().activeAccount).toEqual({
        account: { name: utilsT.userData.username },
        keys: deletedActiveKeyAccounts[0].keys,
        name: utilsT.userData.username,
        rc: {},
      });
    });
    test('Must remove the memo key and update active account keys', async () => {
      const deletedMemoKeyAccounts = [
        {
          name: utilsT.userData.username,
          keys: {
            active: utilsT.keysUserData1.active,
            activePubkey: utilsT.keysUserData1.activePubkey,
            posting: utilsT.keysUserData1.posting,
            postingPubkey: utilsT.keysUserData1.postingPubkey,
          } as Keys,
        },
        utilsT.secondAccountOnState,
      ] as LocalAccount[];
      const keyType = KeyType.MEMO;
      jest
        .spyOn(AccountUtils, 'deleteKey')
        .mockReturnValueOnce(deletedMemoKeyAccounts);
      let fakeStore = getFakeStore(initialStateWAccountsWActiveAccountStore);
      await fakeStore.dispatch<any>(accountActions.removeKey(keyType));
      expect(fakeStore.getState().accounts).toEqual(deletedMemoKeyAccounts);
      expect(fakeStore.getState().activeAccount).toEqual({
        account: { name: utilsT.userData.username },
        keys: deletedMemoKeyAccounts[0].keys,
        name: utilsT.userData.username,
        rc: {},
      });
    });
  });
});
