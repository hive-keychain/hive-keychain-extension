import { KeylessAuthDataUserDictionary } from '@interfaces/keyless-keychain.interface';

import MkModule from '@background/mk.module';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { KeylessAuthData } from '@interfaces/keyless-keychain.interface';

import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

/**
 * Register user and dapp.
 * If the auth data already exists, and expired, it will be removed and a new one will be created.
 * Otherwise, the existing auth data will be returned.
 * @param request - The request object
 * @param domain - The domain of the dapp
 * @returns The keyless auth data
 */
const registerUserAndDapp = async (
  request: KeychainRequest,
  domain: string,
): Promise<KeylessAuthData | undefined> => {
  try {
    if (!request?.username) {
      throw new Error('Username is missing in the request.');
    }

    const keylessAuthData = await getKeylessAuthDataByAppName(request.username, domain);
    
    // generate new auth data when it does not exist or is expired
    if (!keylessAuthData || isKeylessAuthDataExpired(keylessAuthData)) {
      return await generateKeylessAuthData(request.username, domain);
    }

    // return existing auth data when it exists and is not expired
    return keylessAuthData;
  } catch (error:any) {
    throw new Error(`Error in registerUserAndDapp: ${error.message}`);
  } 
};

/**
 * Generate keyless auth data for a given username and app name and store it in the local storage.
 * If the auth data already exists, it will be removed and a new one will be created.
 * @param username - The username of the user
 * @param app_name - The app name of the dapp
 * @returns The keyless auth data
 */
const generateKeylessAuthData = async (
  username: string,
  app_name: string,
): Promise<KeylessAuthData | undefined> => {
  try {
    const keyless_auth_data_user_dictionary = await getKeylessAuthDataUserDictionary() || {} as KeylessAuthDataUserDictionary;

    const auth_key = crypto.randomUUID();

    // Remove existing auth data if it exists
    await removeKeylessAuthData(username, app_name);

    // Create new keyless auth data
    keyless_auth_data_user_dictionary[username] = keyless_auth_data_user_dictionary[username] || [];
    keyless_auth_data_user_dictionary[username].push({
      app_name,
      auth_key,
    });

    await storeKeylessAuthDataUserDictionary(keyless_auth_data_user_dictionary);
    return keyless_auth_data_user_dictionary[username].find(
      (data: KeylessAuthData) => data.app_name === app_name,
    );
  } catch (e) {
    throw new Error(`Error generating keyless auth data: ${e}`);
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

/**
 * Store the keyless auth data user dictionary in the local storage
 * @param keyless_auth_data_user_dictionary - The keyless auth data user dictionary
 */
const storeKeylessAuthDataUserDictionary = async (
  keyless_auth_data_user_dictionary: KeylessAuthDataUserDictionary,
) => {
  const mk = await MkModule.getMk();
  if (!mk) throw new Error('MK not found');
  const encrypted_keyless_auth_data_user_dictionary = EncryptUtils.encrypt(
    JSON.stringify(keyless_auth_data_user_dictionary),
    mk,
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

/**
 * Check if the keyless auth data is expired
 * @param keyless_auth_data - The keyless auth data
 * @returns True if the keyless auth data is expired, false otherwise
 */
const isKeylessAuthDataExpired = (keyless_auth_data: KeylessAuthData) => {
  if (!keyless_auth_data.expire) return true;
  return keyless_auth_data.expire < Date.now();
};

/**
 * Store the keyless auth data in the local storage
 * @param username - The username of the user
 * @param keylessAuthData - The keyless auth data
 */
const storeKeylessAuthData = async (
  username: string,
  keylessAuthData: KeylessAuthData
) => {
  try {
    let keyless_auth_data_user_dictionary =
      await getKeylessAuthDataUserDictionary();
    if (!keyless_auth_data_user_dictionary) {
      keyless_auth_data_user_dictionary = {} as KeylessAuthDataUserDictionary;
    }
    if (!keyless_auth_data_user_dictionary[username]) {
      keyless_auth_data_user_dictionary[username] = [];
    }
    keyless_auth_data_user_dictionary[username].push(keylessAuthData);
    await storeKeylessAuthDataUserDictionary(keyless_auth_data_user_dictionary);
  } catch (e) {
    throw new Error(`Error storing keyless auth data: ${e}`);
  }
};

/**
 * Remove the keyless auth data from the local storage
 * @param username - The username of the user
 * @param uuid - The uuid of the keyless auth data
 */
const removeKeylessAuthData = async (username: string, uuid: string) => {
  try {
    let keyless_auth_data_user_dictionary =
      await getKeylessAuthDataUserDictionary();
    if (!keyless_auth_data_user_dictionary || !keyless_auth_data_user_dictionary[username]) {
      return;
    }
    keyless_auth_data_user_dictionary[username] = keyless_auth_data_user_dictionary[username].filter(
      (data: KeylessAuthData) => data.uuid !== uuid
    );
    await storeKeylessAuthDataUserDictionary(keyless_auth_data_user_dictionary);
  } catch (e) {
    throw new Error(`Error removing keyless auth data: ${e}`);
  }
};

const KeylessKeychainUtils = {
  registerUserAndDapp, 
  getKeylessAuthDataByUUID, 
  getKeylessAuthDataByAppName,
  storeKeylessAuthData,
  removeKeylessAuthData
};

export default KeylessKeychainUtils;
