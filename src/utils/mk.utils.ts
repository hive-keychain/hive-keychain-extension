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
  let accounts = await AccountUtils.getAccountsFromLocalStorage(password);
  return accounts ? true : false;
};

const MkUtils = { isPasswordValid, login };

export default MkUtils;
