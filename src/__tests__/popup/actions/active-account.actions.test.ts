import { ExtendedAccount } from '@hiveio/dhive';
import { Manabar } from '@hiveio/dhive/lib/chain/rc';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import * as activeAccountActions from '@popup/actions/active-account.actions';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import HiveUtils from 'src/utils/hive.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';

//configuring
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
//end configuring

jest.setTimeout(100000);
describe('active-account.actions tests:\n', () => {
  describe('refreshActiveAccount tests:\n', () => {
    test('should ', async () => {
      const fakeExtendedAccount = {
        name: utilsT.userData.username,
        reward_hbd_balance: '1000.000 HBD',
      } as ExtendedAccount;
      const fakeManaBarResponse = {
        current_mana: 1000,
        max_mana: 10000,
        percentage: 100,
      } as Manabar;
      const mockHiveUtilsGetClientDatabaseGetAccounts =
        (HiveUtils.getClient().database.getAccounts = jest
          .fn()
          .mockResolvedValueOnce(fakeExtendedAccount));
      const mockHiveUtilsGetClientRcGetRCMana =
        (HiveUtils.getClient().rc.getRCMana = jest
          .fn()
          .mockResolvedValueOnce(fakeManaBarResponse));
      const mockedStore = mockStore({
        accounts: [
          { name: utilsT.userData.username, keys: utilsT.keysUserData1 },
        ] as LocalAccount[],
        activeAccount: {
          account: {
            name: utilsT.userData.username,
          },
        } as ActiveAccount,
      });
      jest.useFakeTimers();
      return await mockedStore
        .dispatch<any>(activeAccountActions.refreshActiveAccount())
        .then(async () => {
          await jest.runAllTimers();
          expect(await mockedStore.getActions()).toEqual({});
          expect(mockHiveUtilsGetClientDatabaseGetAccounts).toBeCalledTimes(1);
          expect(mockHiveUtilsGetClientRcGetRCMana).toBeCalledTimes(1);
          mockHiveUtilsGetClientDatabaseGetAccounts.mockReset();
          mockHiveUtilsGetClientDatabaseGetAccounts.mockRestore();
        });
    });
  });
});
