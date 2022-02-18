import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import AccountUtils from 'src/utils/account.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const isPasswordValid = (password: string) => {
  return (
    password.length >= 16 ||
    (password.length >= 8 &&
      password.match(/.*[a-z].*/) &&
      password.match(/.*[A-Z].*/) &&
      password.match(/.*[0-9].*/))
  );
};

const login = async (password: string): Promise<boolean> => {
  let accounts = await AccountUtils.getAccountsFromLocalStorage(password);
  return accounts ? true : false;
};

const getMkFromLocalStorage = () => {
  return LocalStorageUtils.getValueFromLocalStorage(LocalStorageKeyEnum.__MK);
};

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
