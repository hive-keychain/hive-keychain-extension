import BgdAccountsUtils from '@background/utils/accounts.utils';
import { FavoriteUserItems } from '@interfaces/favorite-user.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { AutoCompleteValue } from 'src/common-ui/input/input.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import RpcUtils from 'src/utils/rpc.utils';

const checkAndUpdateLocalStorage = async () => {
  //TODO remove code block after finish work
  //Code Block to temporary change  storage version to 3
  saveNewLocalStorageVersion(3);
  //END Code Block

  const localStorageVersion = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.LOCAL_STORAGE_VERSION,
  );
  console.log({ localStorageVersion }); //TODO to remove
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
        /////
        //TODO remove test block
        LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.FAVORITE_USERS,
          {
            theghost1980: ['account1', 'account 2'],
            'keychain.tests': ['stoodkev', 'favUser1'],
          },
        );
        //END block

        const actualFavoriteUsers: any =
          await LocalStorageUtils.getValueFromLocalStorage(
            LocalStorageKeyEnum.FAVORITE_USERS,
          );
        console.log({ actualFavoriteUsers }); //TODO to remove
        //check on format
        let oldFormat = true;
        //validation
        if (actualFavoriteUsers) {
          for (const [key, value] of Object.entries(actualFavoriteUsers)) {
            if (Array.isArray(value)) {
              value.map((favoriteObject) => {
                if (typeof favoriteObject === 'object') {
                  oldFormat = false;
                }
              });
            }
          }
        }
        console.log({ oldFormat }); //TODO to remove
        if (oldFormat) {
          const favoriteUserData: any = {};
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
          if (actualFavoriteUsers) {
            for (const [key, value] of Object.entries(
              actualFavoriteUsers as FavoriteUserItems,
            )) {
              favoriteUserData[key] = value.map((account) => {
                return {
                  value: account,
                  subLabel: '',
                } as AutoCompleteValue;
              });
            }
          }
          console.log({ favoriteUserData }); //TODO to remove
          //save in local storage
          LocalStorageUtils.saveValueInLocalStorage(
            LocalStorageKeyEnum.FAVORITE_USERS,
            favoriteUserData,
          );
          saveNewLocalStorageVersion(4);
        }
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
