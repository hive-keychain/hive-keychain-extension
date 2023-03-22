import BgdAccountsUtils from '@background/utils/accounts.utils';
import { FavoriteUserItems } from '@interfaces/favorite-user.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import RpcUtils from 'src/utils/rpc.utils';

const checkAndUpdateLocalStorage = async () => {
  const localStorageVersion = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.LOCAL_STORAGE_VERSION,
  );
  if (!localStorageVersion) {
    const autolock = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.AUTOLOCK,
    );
    if (autolock) {
      LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.AUTOLOCK,
        JSON.parse(autolock),
      );
    }
    const rpcList = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.RPC_LIST,
    );
    if (rpcList) {
      LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.RPC_LIST,
        JSON.parse(rpcList),
      );
    }

    let activeRpc = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.CURRENT_RPC,
    );
    if (typeof activeRpc === 'string' && activeRpc !== 'DEFAULT') {
      activeRpc =
        RpcUtils.getFullList().find((rpc) => rpc.uri === activeRpc) ||
        RpcUtils.getFullList()[0];
    }

    if (!activeRpc || activeRpc.uri === 'DEFAULT' || activeRpc === 'DEFAULT') {
      LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.SWITCH_RPC_AUTO,
        true,
      );
      LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.CURRENT_RPC,
        RpcUtils.getFullList()[0],
      );
    } else {
      LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.CURRENT_RPC,
        activeRpc,
      );
      LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.SWITCH_RPC_AUTO,
        false,
      );
    }

    const noConfirm = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.NO_CONFIRM,
    );
    if (noConfirm) {
      LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.NO_CONFIRM,
        JSON.parse(noConfirm),
      );
    }
    saveNewLocalStorageVersion(2);
  } else {
    switch (localStorageVersion) {
      case 2: {
        let activeRpc: Rpc = await LocalStorageUtils.getValueFromLocalStorage(
          LocalStorageKeyEnum.CURRENT_RPC,
        );
        if (
          [
            'https://anyx.io',
            'https://api.pharesim.me/',
            'https://rpc.ausbit.dev',
            'https://hived.privex.io/',
          ].includes(activeRpc.uri)
        ) {
          LocalStorageUtils.saveValueInLocalStorage(
            LocalStorageKeyEnum.CURRENT_RPC,
            { uri: 'https://api.hive.blog', testnet: false } as Rpc,
          );
        }
        saveNewLocalStorageVersion(3);
      }
      case 3: {
        //add a third case into switch to check previous local storage and make it as the new format

        //TODO clean up, delete this test part
        //////////////test on initial loading to delete
        //OLD format
        // const data = {
        //   theghost1980: ['testing1', 'testing2', 'testing3'],
        //   'keychain.tests': ['testing3', 'testing4', 'testing5'],
        // };
        //NEW format
        // const data = {
        //   theghost1980: [
        //     {
        //       account: 'testing1',
        //       label: '',
        //     },
        //   ],
        //   'keychain.tests': [
        //     {
        //       account: 'testing2',
        //       label: '',
        //     },
        //   ],
        // };

        // LocalStorageUtils.saveValueInLocalStorage(
        //   LocalStorageKeyEnum.FAVORITE_USERS,
        //   data,
        // );
        ////////////////end test

        // const activeAccountName =
        //   await LocalStorageUtils.getValueFromLocalStorage(
        //     LocalStorageKeyEnum.ACTIVE_ACCOUNT_NAME,
        //   );

        //TODO test what would happen with a brand new account that has no favorites added???
        const actualFavoriteUsers: any =
          await LocalStorageUtils.getValueFromLocalStorage(
            LocalStorageKeyEnum.FAVORITE_USERS,
          );
        console.log({ actualFavoriteUsers }); //TODO to remove
        //check on format
        let oldFormat = true;
        //validation
        console.log('so: ', actualFavoriteUsers);
        for (const [key, value] of Object.entries(actualFavoriteUsers)) {
          if (Array.isArray(value)) {
            value.map((favoriteObject) => {
              if (typeof favoriteObject === 'object') {
                oldFormat = false;
              }
            });
          }
        }

        console.log({ oldFormat });

        //TODO update to only make editable fav user NOT exchanges nor localAccounts.
        if (oldFormat) {
          const favoriteUserData: any = {};
          //TODO initialize object from localAccounts found to avoid future errors.
          const mk = await LocalStorageUtils.getValueFromLocalStorage(
            LocalStorageKeyEnum.__MK,
          );
          const localAccounts =
            await BgdAccountsUtils.getAccountsFromLocalStorage(mk);
          //initialize object.
          for (const localAccount of localAccounts) {
            favoriteUserData[localAccount.name] = [];
          }
          //fill the object initialized
          for (const [key, value] of Object.entries(
            actualFavoriteUsers as FavoriteUserItems,
          )) {
            // console.log({ key, value }); //TODO clean up
            favoriteUserData[key] = value.map((account) => {
              return {
                account: account,
                label: '',
              };
            });
          }
          console.log({ favoriteUserData });
          //save in local storage
          LocalStorageUtils.saveValueInLocalStorage(
            LocalStorageKeyEnum.FAVORITE_USERS,
            favoriteUserData,
          );
          console.log('SAVED new format'); //TODO to remove
        }
        //omitting else as it will load using .
      }
    }
  }
};

const saveNewLocalStorageVersion = (version: number) => {
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.LOCAL_STORAGE_VERSION,
    version,
  );
};

const LocalStorageModule = { checkAndUpdateLocalStorage };

export default LocalStorageModule;
