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
        //test to delete
        // LocalStorageUtils.saveValueInLocalStorage(
        //   LocalStorageKeyEnum.FAVORITE_USERS,
        //   {
        //     theghost1980: [
        //       { account: 'testing', label: '' },
        //       { account: 'testing2', label: 'One here!' },
        //     ],
        //   },
        // );
        //end test

        //TODO here add another function to keep old ways to save data...

        const actualFavoriteUsers: any =
          await LocalStorageUtils.getValueFromLocalStorage(
            LocalStorageKeyEnum.FAVORITE_USERS,
          );
        console.log({ actualFavoriteUsers }); //TODO to remove
        //check on format
        let oldFormat = true;
        Object.entries(actualFavoriteUsers).map((favorite: any) => {
          // console.log({ value: favorite[1], type: typeof favorite[1] });
          if (typeof favorite[1] === 'object') {
            favorite[1].map((favItem: any) => {
              if (favItem.account && favItem.label) {
                oldFormat = false;
              }
            });
          }
        });
        console.log({ oldFormat });
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
