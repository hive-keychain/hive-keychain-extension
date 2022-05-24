import { KeyType } from '@interfaces/keys.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { ActionType } from '@popup/actions/action-type.enum';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as accountActions from 'src/popup/actions/account.actions';
import AccountUtils from 'src/utils/account.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';

//configuring
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
//end configuring

jest.setTimeout(10000);
describe('account.actions tests:\n', () => {
  describe('retrieveAccounts tests:\n', () => {
    test('Calling retrieveAccounts when no localAccounts stored must return specific ActionType', async () => {
      const mk = utilsT.userData.username;
      const storedAccounts = [] as LocalAccount[];
      const expectedAction = [
        { payload: storedAccounts, type: ActionType.SET_ACCOUNTS },
      ];
      const spyGetAccountsFromLocalStorage = jest
        .spyOn(AccountUtils, 'getAccountsFromLocalStorage')
        .mockResolvedValueOnce(storedAccounts);
      const mockedStore = mockStore({});
      return mockedStore
        .dispatch<any>(accountActions.retrieveAccounts(mk))
        .then(() => {
          expect(spyGetAccountsFromLocalStorage).toBeCalledTimes(1);
          expect(spyGetAccountsFromLocalStorage).toBeCalledWith(mk);
          expect(mockedStore.getActions()).toEqual(expectedAction);
          spyGetAccountsFromLocalStorage.mockReset();
          spyGetAccountsFromLocalStorage.mockRestore();
        });
    });
    test('Calling retrieveAccounts with localAccounts stored, must return specific ActionType and that object as payload', async () => {
      const mk = utilsT.userData.username;
      const storedAccounts = [
        { name: 'aggroed', keys: {} },
        { name: 'quentin', keys: {} },
      ] as LocalAccount[];
      const expectedAction = [
        { payload: storedAccounts, type: ActionType.SET_ACCOUNTS },
      ];
      const spyGetAccountsFromLocalStorage = jest
        .spyOn(AccountUtils, 'getAccountsFromLocalStorage')
        .mockResolvedValueOnce(storedAccounts);
      const mockedStore = mockStore({});
      return mockedStore
        .dispatch<any>(accountActions.retrieveAccounts(mk))
        .then(() => {
          expect(spyGetAccountsFromLocalStorage).toBeCalledTimes(1);
          expect(spyGetAccountsFromLocalStorage).toBeCalledWith(mk);
          expect(mockedStore.getActions()).toEqual(expectedAction);
          spyGetAccountsFromLocalStorage.mockReset();
          spyGetAccountsFromLocalStorage.mockRestore();
        });
    });
  });

  describe('addAccount tests:\n', () => {
    test('Calling addAccount with a payload should return a structured object', () => {
      const account = {
        name: utilsT.userData.username,
        keys: { activePubkey: utilsT.userData.encryptKeys.active },
      } as LocalAccount;
      const expectedObject = {
        type: ActionType.ADD_ACCOUNT,
        payload: account,
      };
      expect(accountActions.addAccount(account)).toEqual(expectedObject);
    });
  });

  describe('resetAccount tests:\n', () => {
    test('Calling resetAccount must return an object with ActionType.RESET_ACCOUNT', () => {
      expect(accountActions.resetAccount()).toEqual({
        type: ActionType.RESET_ACCOUNT,
      });
    });
  });

  describe('setAccounts tests:\n', () => {
    test('Calling setAccounts must return an object of type ActionType.SET_ACCOUNTS with the passed payload', () => {
      const accounts = [
        { name: 'aggroed', keys: {} },
        { name: 'quentin', keys: {} },
      ] as LocalAccount[];
      expect(accountActions.setAccounts(accounts)).toEqual({
        type: ActionType.SET_ACCOUNTS,
        payload: accounts,
      });
    });
  });

  describe('addKey tests:\n', () => {
    test('Calling addKey with newAccounts must dispatch 2 actions as specified bellow', async () => {
      const privateKey = utilsT.userData.nonEncryptKeys.active;
      const keyType = KeyType.ACTIVE;
      const accountsSuccesFullyStored = [
        { name: 'aggroed', keys: {} },
        { name: 'quentin', keys: {} },
        { name: utilsT.userData.username, keys: { active: privateKey } },
      ] as LocalAccount[];
      const expectedActionArray = [
        {
          payload: accountsSuccesFullyStored,
          type: ActionType.SET_ACCOUNTS,
        },
        {
          payload: {
            keys: utilsT.initialStateWAccountsWActiveAccountStore.activeAccount
              .keys,
          },
          type: ActionType.SET_ACTIVE_ACCOUNT,
        },
      ];
      const mockAccountUtilsAddKey = (AccountUtils.addKey = jest
        .fn()
        .mockResolvedValueOnce(accountsSuccesFullyStored));
      const mockedStore = mockStore(
        utilsT.initialStateWAccountsWActiveAccountStore,
      );
      return mockedStore
        .dispatch<any>(accountActions.addKey(privateKey, keyType))
        .then(() => {
          expect(mockAccountUtilsAddKey).toBeCalledTimes(1);
          expect(mockedStore.getActions()).toEqual(expectedActionArray);
          mockAccountUtilsAddKey.mockClear();
          mockAccountUtilsAddKey.mockReset();
        });
    });
    test('Calling addKey with no newAccounts must call zero actions', async () => {
      const privateKey = utilsT.userData.nonEncryptKeys.active;
      const keyType = KeyType.ACTIVE;
      const mockAccountUtilsAddKey = (AccountUtils.addKey = jest
        .fn()
        .mockResolvedValueOnce(undefined));
      const mockedStore = mockStore(
        utilsT.initialStateWAccountsWActiveAccountStore,
      );
      return mockedStore
        .dispatch<any>(accountActions.addKey(privateKey, keyType))
        .then(() => {
          expect(mockAccountUtilsAddKey).toBeCalledTimes(1);
          expect(mockedStore.getActions()).toEqual([]); //as zero actions being called.
          mockAccountUtilsAddKey.mockClear();
          mockAccountUtilsAddKey.mockReset();
        });
    });
  });

  describe('removeKey tests:\n', () => {});
});
