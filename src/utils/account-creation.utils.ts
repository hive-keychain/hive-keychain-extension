import { PrivateKey } from '@hiveio/dhive';
import AccountUtils from 'src/utils/account.utils';

const checkAccountNameAvailable = async (username: string) => {
  const account = await AccountUtils.getExtendedAccount(username);
  return account ? false : true;
};

const generateMasterKey = () => {
  const array = new Uint32Array(10);
  crypto.getRandomValues(array);
  return 'P' + PrivateKey.fromSeed(array.toString()).toString();
};

const validateUsername = (username: string) => {
  return new RegExp(
    /^(?=.{3,16}$)[a-z]([0-9a-z]|[0-9a-z\-](?=[0-9a-z])){2,}([\.](?=[a-z][0-9a-z\-][0-9a-z\-])[a-z]([0-9a-z]|[0-9a-z\-](?=[0-9a-z])){1,}){0,}$/,
  ).test(username);
};

// const createAccount = ()

export const AccountCreationUtils = {
  checkAccountNameAvailable,
  generateMasterKey,
  validateUsername,
};
