import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import AccountUtils from 'src/utils/account.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { isPasswordValid } from 'src/utils/password.utils';

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
