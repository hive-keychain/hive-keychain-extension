import { ExtendedAccount } from '@hiveio/dhive';
import { Manabar } from '@hiveio/dhive/lib/chain/rc';
import { sleep } from '@hiveio/dhive/lib/utils';
import { LocalAccount } from '@interfaces/local-account.interface';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import {
  initialEmptyStateStore,
  initialStateDifferentAccounts,
  initialStateNoKeys,
  initialStateWOneKey,
} from 'src/__tests__/utils-for-testing/initial-states';
import * as activeAccountActions from 'src/popup/hive/actions/active-account.actions';
import AccountUtils from 'src/utils/account.utils';

describe('active-account.actions tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  const fakeExtendedAccountResponse = [
    {
      name: userData.two.username,
      reputation: 100,
    } as ExtendedAccount,
  ];
  const fakeManaBarResponse = {
    current_mana: 1000,
    max_mana: 10000,
    percentage: 100,
  } as Manabar;
  describe('refreshActiveAccount tests:\n', () => {
    test('Must refresh the activeAccount', async () => {
      AccountUtils.getExtendedAccount = jest
        .fn()
        .mockResolvedValue(fakeExtendedAccountResponse[0]);
      AccountUtils.getRCMana = jest
        .fn()
        .mockResolvedValueOnce(fakeManaBarResponse);
      let fakeStore = getFakeStore(initialStateWOneKey);
      await fakeStore.dispatch<any>(
        activeAccountActions.refreshActiveAccount(),
      );
      const delay = 3100;
      await sleep(delay);
      expect(fakeStore.getState().activeAccount).toEqual({
        account: fakeExtendedAccountResponse[0],
        keys: userData.two.keys,
        name: userData.two.username,
        rc: fakeManaBarResponse,
      });
    });
    test('If the activeAccount is not located in accounts, wont refresh', async () => {
      AccountUtils.getExtendedAccount = jest
        .fn()
        .mockResolvedValue(fakeExtendedAccountResponse[0]);
      AccountUtils.getRCMana = jest
        .fn()
        .mockResolvedValueOnce(fakeManaBarResponse);

      let fakeStore = getFakeStore(initialStateDifferentAccounts);
      await fakeStore.dispatch<any>(
        activeAccountActions.refreshActiveAccount(),
      );
      const delay = 3100;
      await sleep(delay);
      expect(fakeStore.getState().activeAccount).toEqual(
        initialStateDifferentAccounts.activeAccount,
      );
    });
  });

  describe('refreshKeys tests:\n', () => {
    test('Must set keys on activeAccount', async () => {
      const localAccount = {
        name: userData.two.username,
        keys: userData.two.keys,
      } as LocalAccount;
      const fakeStore = getFakeStore(initialStateNoKeys);
      await fakeStore.dispatch<any>(
        activeAccountActions.refreshKeys(localAccount),
      );
      expect(fakeStore.getState().activeAccount).toEqual({
        account: {
          name: localAccount.name,
        },
        keys: localAccount.keys,
        name: localAccount.name,
        rc: {},
      });
    });
  });
  describe('loadActiveAccount tests:\n', () => {
    test('must refreshKeys and set activeAccount', async () => {
      AccountUtils.getExtendedAccount = jest
        .fn()
        .mockResolvedValue(fakeExtendedAccountResponse[0]);
      AccountUtils.getRCMana = jest
        .fn()
        .mockResolvedValueOnce(fakeManaBarResponse);

      let fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(
        activeAccountActions.loadActiveAccount({
          ...userData.two,
          name: userData.two.username,
        }),
      );
      expect(fakeStore.getState().activeAccount).toEqual({
        account: fakeExtendedAccountResponse[0],
        keys: userData.two.keys,
        name: userData.two.username,
        rc: fakeManaBarResponse,
      });
    });
  });

  describe('getAccountRC tests:\n', () => {
    test('Must set manabar of activeAccount', async () => {
      AccountUtils.getRCMana = jest
        .fn()
        .mockResolvedValueOnce(fakeManaBarResponse);

      let fakeStore = getFakeStore(initialStateWOneKey);
      await fakeStore.dispatch<any>(
        activeAccountActions.getAccountRC(userData.two.username),
      );
      expect(fakeStore.getState().activeAccount).toEqual({
        account: {
          name: userData.two.username,
        },
        keys: userData.two.keys,
        name: userData.two.username,
        rc: fakeManaBarResponse,
      });
    });
  });

  describe('resetActiveAccount tests:\n', () => {
    const defaultResetValues = {
      account: {} as ExtendedAccount,
      keys: {},
      rc: {} as Manabar,
    };
    test('Must reset activeAccount to default values', async () => {
      const fakeStore = getFakeStore(initialStateWOneKey);
      await fakeStore.dispatch<any>(activeAccountActions.resetActiveAccount());
      expect(fakeStore.getState().activeAccount).toEqual(defaultResetValues);
    });
  });
});
