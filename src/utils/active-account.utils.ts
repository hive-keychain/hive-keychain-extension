import { ActiveAccount } from 'src/interfaces/active-account.interface';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const isEmpty = (activeAccount: ActiveAccount) => {
  return (
    !activeAccount.account || Object.keys(activeAccount.account).length === 0
  );
};
/* istanbul ignore next */
const saveActiveAccountNameInLocalStorage = (activeAccountName: string) => {
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.ACTIVE_ACCOUNT_NAME,
    activeAccountName,
  );
};
/* istanbul ignore next */
const getActiveAccountNameFromLocalStorage = async () => {
  const account = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.ACTIVE_ACCOUNT_NAME,
  );
  return account && account.length ? account : undefined;
};

const ActiveAccountUtils = {
  isEmpty,
  saveActiveAccountNameInLocalStorage,
  getActiveAccountNameFromLocalStorage,
};

export default ActiveAccountUtils;
