import AccountUtils from '@hiveapp/utils/account.utils';
import { isPasswordValid } from '@hiveapp/utils/password.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const login = async (password: string): Promise<boolean> => {
  let accounts = await AccountUtils.getAccountsFromLocalStorage(password);
  return accounts ? true : false;
};
/* istanbul ignore next */
const getMkFromLocalStorage = () => {
  return LocalStorageUtils.getValueFromLocalStorage(LocalStorageKeyEnum.__MK);
};
/* istanbul ignore next */
const saveMkInLocalStorage = (mk: string): void => {
  LocalStorageUtils.saveValueInLocalStorage(LocalStorageKeyEnum.__MK, mk);
};

const MkUtils = {
  isPasswordValid,
  login,
  getMkFromLocalStorage,
  saveMkInLocalStorage,
};

export default MkUtils;
