import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
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
      console.log('saving new rpc and switch to true');
      LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.SWITCH_RPC_AUTO,
        true,
      );
      LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.CURRENT_RPC,
        RpcUtils.getFullList()[0],
      );
    } else {
      Logger.log('saving switch to false');
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

    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.LOCAL_STORAGE_VERSION,
      2,
    );
  } else {
    Logger.log('Already has updated local storage');
  }
};

const LocalStorageModule = { checkAndUpdateLocalStorage };

export default LocalStorageModule;
