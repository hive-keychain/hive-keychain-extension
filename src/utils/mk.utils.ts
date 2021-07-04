import AccountUtils from 'src/utils/account.utils';

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
  try {
    let test = await AccountUtils.getAccountsFromLocalStorage(password);
  } catch (err) {
    return false;
  }
  return true;
};

const MkUtils = {isPasswordValid, login};

export default MkUtils;
