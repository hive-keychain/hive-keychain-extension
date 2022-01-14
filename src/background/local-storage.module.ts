import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

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

    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.LOCAL_STORAGE_VERSION,
      2,
    );
  }
};

const LocalStorageModule = { checkAndUpdateLocalStorage };

export default LocalStorageModule;
