import { sleep } from '@hiveio/dhive/lib/utils';
import * as activeAccountActions from 'src/popup/actions/active-account.actions';
import HiveUtils from 'src/utils/hive.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialStateWOneKey } from 'src/__tests__/utils-for-testing/initial-states';

afterEach(() => {
  jest.clearAllMocks();
});
describe('active-account.actions tests:\n', () => {
  const fakeExtendedAccountResponse = [
    {
      name: utilsT.secondAccountOnState.name,
      reputation: 100,
    },
  ];
  const fakeManaBarResponse = {
    current_mana: 1000,
    max_mana: 10000,
    percentage: 100,
  };
  describe('refreshActiveAccount tests:\n', () => {
    test('Must refresh the activeAccount', async () => {
      HiveUtils.getClient().database.getAccounts = jest
        .fn()
        .mockResolvedValueOnce(fakeExtendedAccountResponse);
      HiveUtils.getClient().rc.getRCMana = jest
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
        keys: utilsT.secondAccountOnState.keys,
        name: utilsT.secondAccountOnState.name,
        rc: fakeManaBarResponse,
      });
    });
    // test('If the activeAccount is not located in accounts within the state, will return an empty array', async () => {
    //   const mockedStore = mockStore({
    //     accounts: [
    //       { name: utilsT.userData2.username, keys: {} },
    //     ] as LocalAccount[],
    //     activeAccount: {
    //       account: {
    //         name: utilsT.userData.username,
    //       },
    //       name: utilsT.userData.username,
    //     } as ActiveAccount,
    //   });
    //   const expectedReturnedValue: any = [];
    //   jest.useFakeTimers();
    //   return await mockedStore
    //     .dispatch<any>(activeAccountActions.refreshActiveAccount())
    //     .then(() => {
    //       jest.runAllTimers();
    //       expect(mockedStore.getActions()).toEqual(expectedReturnedValue);
    //     });
    // });
  });

  describe('refreshKeys tests:\n', () => {
    // test('Passing a valid localAccount must return SET_ACTIVE_ACCOUNT action', () => {
    //   const localAccount = {
    //     name: utilsT.userData2.username,
    //     keys: {},
    //   } as LocalAccount;
    //   expect(activeAccountActions.refreshKeys(localAccount)).toEqual({
    //     type: ActionType.SET_ACTIVE_ACCOUNT,
    //     payload: {
    //       keys: localAccount.keys,
    //     },
    //   });
    // });
  });

  describe('loadActiveAccount tests:\n', () => {
    // test('Passing a valid localAccount object, must return 3 action types(SET_ACTIVE_ACCOUNT, SET_ACTIVE_ACCOUNT_RC, SET_ACTIVE_ACCOUNT)', async () => {
    //   const mockHiveUtilsGetClientDatabaseGetAccounts =
    //     (HiveUtils.getClient().database.getAccounts = jest
    //       .fn()
    //       .mockResolvedValueOnce(fakeExtendedAccount));
    //   const mockHiveUtilsGetClientRcGetRCMana =
    //     (HiveUtils.getClient().rc.getRCMana = jest
    //       .fn()
    //       .mockResolvedValueOnce(fakeManaBarResponse));
    //   const expectedActionArray = [
    //     {
    //       payload: {
    //         keys: utilsT.keysUserData1,
    //       },
    //       type: ActionType.SET_ACTIVE_ACCOUNT,
    //     },
    //     {
    //       payload: fakeManaBarResponse,
    //       type: ActionType.SET_ACTIVE_ACCOUNT_RC,
    //     },
    //     {
    //       payload: {
    //         account: fakeExtendedAccount[0],
    //         name: utilsT.userData.username,
    //       },
    //       type: ActionType.SET_ACTIVE_ACCOUNT,
    //     },
    //   ];
    //   const mockedStore = mockStore({});
    //   return await mockedStore
    //     .dispatch<any>(
    //       activeAccountActions.loadActiveAccount(
    //         stateWAccountsWActiveAccount.accounts[0],
    //       ),
    //     )
    //     .then(() => {
    //       expect(mockedStore.getActions()).toEqual(expectedActionArray);
    //       expect(mockHiveUtilsGetClientDatabaseGetAccounts).toBeCalledTimes(1);
    //       expect(mockHiveUtilsGetClientRcGetRCMana).toBeCalledTimes(1);
    //       mockHiveUtilsGetClientDatabaseGetAccounts.mockReset();
    //       mockHiveUtilsGetClientDatabaseGetAccounts.mockRestore();
    //       mockHiveUtilsGetClientRcGetRCMana.mockReset();
    //       mockHiveUtilsGetClientRcGetRCMana.mockRestore();
    //     });
    // });
  });

  describe('getAccountRC tests:\n', () => {
    // test('Passing an existing username must return the Manabar data in a SET_ACTIVE_ACCOUNT_RC action', async () => {
    //   const expectedAction = {
    //     type: ActionType.SET_ACTIVE_ACCOUNT_RC,
    //     payload: fakeManaBarResponse,
    //   };
    //   const mockHiveUtilsGetClientRcGetRCMana =
    //     (HiveUtils.getClient().rc.getRCMana = jest
    //       .fn()
    //       .mockResolvedValueOnce(fakeManaBarResponse));
    //   const mockedStore = mockStore({});
    //   return await mockedStore
    //     .dispatch<any>(
    //       activeAccountActions.getAccountRC(utilsT.userData.username),
    //     )
    //     .then(() => {
    //       expect(mockedStore.getActions()).toEqual([expectedAction]);
    //       expect(mockHiveUtilsGetClientRcGetRCMana).toBeCalledTimes(1);
    //       mockHiveUtilsGetClientRcGetRCMana.mockReset();
    //       mockHiveUtilsGetClientRcGetRCMana.mockRestore();
    //     });
    // });
  });

  describe('resetActiveAccount tests:\n', () => {
    // test('Calling resetActiveAccount must return a RESET_ACTIVE_ACCOUNT action', () => {
    //   expect(activeAccountActions.resetActiveAccount()).toEqual({
    //     type: ActionType.RESET_ACTIVE_ACCOUNT,
    //   });
    // });
  });
});
