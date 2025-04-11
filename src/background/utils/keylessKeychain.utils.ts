import { KeylessAuthDataUserDictionary } from '@interfaces/keyless-keychain.interface';

import MkModule from '@background/mk.module';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { KeylessAuthData } from '@interfaces/keyless-keychain.interface';

import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
//TODO: logic for register user and dapp
const registerUserAndDapp = async (
  request: KeychainRequest,
  domain: string,
) => {
  console.log('registerUserAndDapp', request, domain);
  if (!request?.username) {
    return undefined;
  }

  let keyless_auth_data = await getKeylessAuthDataByAppName(
    request.username,
    domain,
  );
  if (!keyless_auth_data) {
    //generate new keyless auth data
    keyless_auth_data = await generateKeylessAuthData(request.username, domain);
    console.log('generate new keyless_auth_data', keyless_auth_data);
    //TODO: Logic for initial authentication
  }
  if (keyless_auth_data) {
    if (isKeylessAuthDataExpired(keyless_auth_data)) {
      //handle reauthentication
      //TODO: logic for reauthentication
    }
    // return and proceed to request
  }
};

/**
 * Generate keyless auth data for a given username and app name and store it in the local storage
 * @param username - The username of the user
 * @param app_name - The app name of the dapp
 * @returns The keyless auth data
 */
const generateKeylessAuthData = async (
  username: string,
  app_name: string,
): Promise<KeylessAuthData | undefined> => {
  try {
    let keyless_auth_data_user_dictionary =
      await getKeylessAuthDataUserDictionary();
    console.log(
      'keyless_auth_data_user_dictionary',
      keyless_auth_data_user_dictionary,
    );
    const auth_key = crypto.randomUUID();
    if (!keyless_auth_data_user_dictionary) {
      keyless_auth_data_user_dictionary = {} as KeylessAuthDataUserDictionary;
    }
    if (!keyless_auth_data_user_dictionary[username]) {
      keyless_auth_data_user_dictionary[username] = [];
    }
    keyless_auth_data_user_dictionary[username].push({
      app_name,
      auth_key,
    });
    console.log(
      'keyless_auth_data_user_dictionary',
      keyless_auth_data_user_dictionary,
    );
    await storeKeylessAuthDataUserDictionary(keyless_auth_data_user_dictionary);
    return keyless_auth_data_user_dictionary[username].find(
      (data: KeylessAuthData) => data.app_name === app_name,
    );
  } catch (e) {
    console.error('error generating keyless auth data', e);
    return undefined;
  }
};

/**
 * Get the keyless auth data user dictionary
 * @returns The keyless auth data user dictionary
 */
const getKeylessAuthDataUserDictionary = async (): Promise<
  KeylessAuthDataUserDictionary | undefined
> => {
  const keyless_auth_data_user_dictionary =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.KEYLESS_KEYCHAIN_AUTH_DATA_USER_DICT,
    );
  if (!keyless_auth_data_user_dictionary) return undefined;
  const mk = await MkModule.getMk();
  if (!mk) throw new Error('MK not found');
  //decrypt the keyless_auth_data_user_dictionary with mk
  const decrypted_keyless_auth_data_user_dictionary =
    EncryptUtils.decryptToJson(keyless_auth_data_user_dictionary, mk);
  return decrypted_keyless_auth_data_user_dictionary;
};

const storeKeylessAuthDataUserDictionary = async (
  keyless_auth_data_user_dictionary: KeylessAuthDataUserDictionary,
) => {
  const mk = await MkModule.getMk();
  if (!mk) throw new Error('MK not found');
  const encrypted_keyless_auth_data_user_dictionary = EncryptUtils.encrypt(
    JSON.stringify(keyless_auth_data_user_dictionary),
    mk,
  );
  console.log(
    'encrypted_keyless_auth_data_user_dictionary',
    encrypted_keyless_auth_data_user_dictionary,
  );
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.KEYLESS_KEYCHAIN_AUTH_DATA_USER_DICT,
    encrypted_keyless_auth_data_user_dictionary,
  );
};

/**
 * Get the keyless auth data for a given username
 * @param username - The username of the user
 * @returns The array of keyless auth data for the given username
 */
const getKeylessAuthDataArray = async (
  username: string,
): Promise<KeylessAuthData[] | undefined> => {
  const keyless_auth_data_user_dictionary =
    await getKeylessAuthDataUserDictionary();
  if (!keyless_auth_data_user_dictionary) return undefined;
  return keyless_auth_data_user_dictionary[username];
};

/**
 * Get the keyless auth data by app name (used for register user and dapp)
 * @param username - The username of the user
 * @param app_name - The app name of the dapp
 * @returns The keyless auth data for the given app name
 */
const getKeylessAuthDataByAppName = async (
  username: string,
  app_name: string,
) => {
  const keyless_auth_data_array = await getKeylessAuthDataArray(username);
  if (!keyless_auth_data_array) return undefined;
  return keyless_auth_data_array.find(
    (data: KeylessAuthData) => data.app_name === app_name,
  );
};

/**
 * Get the keyless auth data by uuid (used for transactions and remove keyless auth data)
 * @param username - The username of the user
 * @param uuid - The uuid of the keyless auth data
 * @returns The keyless auth data for the given uuid
 */
const getKeylessAuthDataByUUID = async (username: string, uuid: string) => {
  const keyless_auth_data_array = await getKeylessAuthDataArray(username);
  if (!keyless_auth_data_array) return undefined;
  return keyless_auth_data_array.find(
    (data: KeylessAuthData) => data.uuid === uuid,
  );
};

const isKeylessAuthDataExpired = (keyless_auth_data: KeylessAuthData) => {
  if (!keyless_auth_data.expire) return true;
  return keyless_auth_data.expire < Date.now();
};

const storeKeylessAuthData = (keyless_auth_data: KeylessAuthData) => {
  //TODO: logic for store keyless auth data
};
const removeKeylessAuthData = (username: string, uuid?: string) => {
  //TODO: logic for remove keyless auth data
};

const KeylessKeychainUtils = {
  registerUserAndDapp,
};

export default KeylessKeychainUtils;
