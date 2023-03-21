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

        // LocalStorageUtils.saveValueInLocalStorage(
        //   LocalStorageKeyEnum.FAVORITE_USERS,
        //   data,
        // );
        ////////////////end test

        const activeAccountName =
          await LocalStorageUtils.getValueFromLocalStorage(
            LocalStorageKeyEnum.ACTIVE_ACCOUNT_NAME,
          );
        const actualFavoriteUsers: any =
          await LocalStorageUtils.getValueFromLocalStorage(
            LocalStorageKeyEnum.FAVORITE_USERS,
          );
        console.log({ actualFavoriteUsers }); //TODO to remove
        //check on format
        let oldFormat = true;
        //validation
        console.log('so: ', actualFavoriteUsers[activeAccountName]);
        for (const [key, value] of Object.entries(
          actualFavoriteUsers[activeAccountName],
        )) {
          // console.log({ value });
          if ((value as any).name) {
            oldFormat = false;
          }
        }
        // for (const [key, value] of Object.entries(actualFavoriteUsers)) {
        //   if ((value as any).name === FavoriteUserListName.EXCHANGES) {
        //     oldFormat = false;
        //   }
        // }
        //load data depending on oldFormat
        console.log({ oldFormat });
        //TODO uncomment
        // if (oldFormat) {
        //   const mk = await LocalStorageUtils.getValueFromLocalStorage(
        //     LocalStorageKeyEnum.__MK,
        //   );
        //   const localAccounts =
        //     await BgdAccountsUtils.getAccountsFromLocalStorage(mk);

        //   const favoriteUserData: any = {};
        //   //iterate on each account + initialize
        //   for (const localAccount of localAccounts) {
        //     //Initialize new format to store
        //     const aboutToSaveNewFormatCompleteObject =
        //       await FavoriteUserUtils.getFavoriteListOldFormatAndReformat(
        //         localAccount.name,
        //         localAccounts,
        //         {
        //           addExchanges: true,
        //           addSwaps: true,
        //         },
        //       );
        //     console.log({ aboutToSaveNewFormatCompleteObject });
        //     favoriteUserData[localAccount.name] =
        //       aboutToSaveNewFormatCompleteObject;
        //   }

        //   console.log({ favoriteUserData });
        //   //TODO uncomment
        //   //save in local storage
        //   LocalStorageUtils.saveValueInLocalStorage(
        //     LocalStorageKeyEnum.FAVORITE_USERS,
        //     favoriteUserData,
        //   );
        //   console.log('SAVED new format!!!'); //TODO to remove
        // }
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
