import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const checkAndUpdateLocalStorage = async () => {
  const localStorageVersion = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.LOCAL_STORAGE_VERSION,
  );
  if (!localStorageVersion) {
    // Update localStorage
  }
};

const LocalStorageModule = { checkAndUpdateLocalStorage };

export default LocalStorageModule;
