import { sleep } from '@hiveio/dhive/lib/utils';
import * as activeAccountActions from 'src/popup/actions/active-account.actions';
import HiveUtils from 'src/utils/hive.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import {
  initialEmptyStateStore,
  initialStateDifferentAccounts,
  initialStateWOneKey,
} from 'src/__tests__/utils-for-testing/initial-states';

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
    test('If the activeAccount is not located in accounts, wont refresh', async () => {
      HiveUtils.getClient().database.getAccounts = jest
        .fn()
        .mockResolvedValueOnce(fakeExtendedAccountResponse);
      HiveUtils.getClient().rc.getRCMana = jest
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

  describe('loadActiveAccount tests:\n', () => {
    test('must refreshKeys and set activeAccount', async () => {
      HiveUtils.getClient().database.getAccounts = jest
        .fn()
        .mockResolvedValueOnce(fakeExtendedAccountResponse);
      HiveUtils.getClient().rc.getRCMana = jest
        .fn()
        .mockResolvedValueOnce(fakeManaBarResponse);

      let fakeStore = getFakeStore(initialEmptyStateStore);
      await fakeStore.dispatch<any>(
        activeAccountActions.loadActiveAccount(utilsT.secondAccountOnState),
      );
      expect(fakeStore.getState().activeAccount).toEqual({
        account: fakeExtendedAccountResponse[0],
        keys: utilsT.secondAccountOnState.keys,
        name: utilsT.secondAccountOnState.name,
        rc: fakeManaBarResponse,
      });
    });
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
