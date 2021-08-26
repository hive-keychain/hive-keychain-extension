import { ActiveAccount } from 'src/interfaces/active-account.interface';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const isEmpty = (activeAccount: ActiveAccount) => {
  return Object.keys(activeAccount.account).length === 0;
};

const saveActiveAccountNameInLocalStorage = (activeAccountName: string) => {
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.ACTIVE_ACCOUNT_NAME,
    activeAccountName,
  );
};

const getActiveAccountNameFromLocalStorage = async () => {
  return await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.ACTIVE_ACCOUNT_NAME,
  );
};

const ActiveAccountUtils = {
  isEmpty,
  saveActiveAccountNameInLocalStorage,
  getActiveAccountNameFromLocalStorage,
};

export default ActiveAccountUtils;
