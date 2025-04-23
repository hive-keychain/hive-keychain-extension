import MkModule from '@background/mk.module';
import { AUTH_WAIT, SIGN_REQ_DATA } from '@interfaces/has.interface';
import { KeychainRequest } from '@interfaces/keychain.interface';
import {
  KeylessAuthData,
  KeylessAuthDataUserDictionary,
  KeylessRequest,
} from '@interfaces/keyless-keychain.interface';
import CryptoJS from 'crypto-js';
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
    //always generate new auth data
    return await generateKeylessAuthData(request.username, domain);

    // NOTE:
    // Basically, below code will always return the auth data when it exists and is not expired
    // but if the user logged out, there is no way to know it because the auth data will not be removed from the local storage
    // so we always generate new auth data

    // const keylessAuthData = await getKeylessAuthDataByAppName(
    //   request.username,
    //   domain,
    // );

    // // generate new auth data when it does not exist or is expired
    // if (!keylessAuthData || isKeylessAuthDataExpired(keylessAuthData)) {
    //   return await generateKeylessAuthData(request.username, domain);
    // }

    // // return existing auth data when it exists and is not expired
    // if (keylessAuthData && !isKeylessAuthDataExpired(keylessAuthData)) {
    //   return keylessAuthData;
    // }
    // //store the keylessAuthData in the local storage
    // await storeKeylessAuthData(request.username, keylessAuthData);

    // // return existing auth data when it exists and is not expired
    // return keylessAuthData;
  } catch (error: any) {
    throw new Error(`Error in registerUserAnd Dapp: ${error.message}`);
  }
};

const updateAuthenticatedKeylessAuthData = async (
  keylessRequest: KeylessRequest,
  authWait: AUTH_WAIT,
) => {
  try {
    if (!keylessRequest.request.username) {
      throw new Error('Username is missing in the keyless request.');
    }

    const username = keylessRequest.request.username;
    const keylessAuthData: KeylessAuthData = {
      appName: keylessRequest.appName,
      authKey: keylessRequest.authKey,
      uuid: authWait.uuid,
      expire: authWait.expire,
    };

    await storeKeylessAuthData(username, keylessAuthData);
  } catch (error: any) {
    throw new Error(
      `Error updating authenticated keyless auth data: ${error.message}`,
    );
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
  appName: string,
): Promise<KeylessAuthData | undefined> => {
  try {
    const authKey = generateSecureHexKey();
    const keylessAuthData: KeylessAuthData = {
      appName,
      authKey,
    };
    // Create new keyless auth data
    await storeKeylessAuthData(username, keylessAuthData);
    return keylessAuthData;
  } catch (e) {
    throw new Error(`Error generating keyless auth data: ${e}`);
  }
};

const generateSecureHexKey = (length = 32) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};
/**
 * Get the keyless auth data user dictionary
 * @returns The keyless auth data user dictionary
 */
const getKeylessAuthDataUserDictionary = async (): Promise<
  KeylessAuthDataUserDictionary | undefined
> => {
  try {
    const keylessAuthDataUserDictionary =
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.KEYLESS_KEYCHAIN_AUTH_DATA_USER_DICT,
      );
    if (!keylessAuthDataUserDictionary) {
      return undefined;
    }

    const mk = await MkModule.getMk();
    if (!mk) {
      throw new Error('MK not found');
    }

    // Decrypt the keyless_auth_data_user_dictionary with mk
    const decryptedKeylessAuthDataUserDictionary = EncryptUtils.decrypt(
      keylessAuthDataUserDictionary,
      mk,
    );
    return JSON.parse(
      decryptedKeylessAuthDataUserDictionary.toString(CryptoJS.enc.Utf8),
    );
  } catch (error: any) {
    throw new Error(
      `Failed to get keyless auth data user dictionary: ${error.message}`,
    );
  }
};

/**
 * Store the keyless auth data user dictionary in the local storage
 * @param keyless_auth_data_user_dictionary - The keyless auth data user dictionary
 */
const storeKeylessAuthDataUserDictionary = async (
  keylessAuthDataUserDictionary: KeylessAuthDataUserDictionary,
) => {
  try {
    const mk = await MkModule.getMk();
    if (!mk) throw new Error('MK not found');
    const encryptedKeylessAuthDataUserDictionary = EncryptUtils.encrypt(
      JSON.stringify(keylessAuthDataUserDictionary),
      mk,
    );
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.KEYLESS_KEYCHAIN_AUTH_DATA_USER_DICT,
      encryptedKeylessAuthDataUserDictionary,
    );
  } catch (error: any) {
    throw new Error(
      `Failed to store keyless auth data user dictionary: ${error.message}`,
    );
  }
};

/**
 * Get the keyless auth data for a given username
 * @param username - The username of the user
 * @returns The array of keyless auth data for the given username
 */
const getKeylessAuthDataArray = async (
  username: string,
): Promise<KeylessAuthData[] | undefined> => {
  const keylessAuthDataUserDictionary =
    await getKeylessAuthDataUserDictionary();
  if (!keylessAuthDataUserDictionary) return undefined;
  return keylessAuthDataUserDictionary[username];
};

/**
 * Get the keyless auth data by app name (used for register user and dapp)
 * @param username - The username of the user
 * @param app_name - The app name of the dapp
 * @returns The keyless auth data for the given app name
 */
const getKeylessAuthDataByAppName = async (
  username: string,
  appName: string,
) => {
  const keylessAuthDataArray = await getKeylessAuthDataArray(username);

  if (!keylessAuthDataArray) return undefined;
  return keylessAuthDataArray.find(
    (data: KeylessAuthData) => data.appName === appName,
  );
};

/**
 * Get the keyless auth data by uuid (used for transactions and remove keyless auth data)
 * @param username - The username of the user
 * @param uuid - The uuid of the keyless auth data
 * @returns The keyless auth data for the given uuid
 */
const getKeylessAuthDataByUUID = async (username: string, uuid: string) => {
  const keylessAuthDataArray = await getKeylessAuthDataArray(username);
  if (!keylessAuthDataArray) return undefined;
  return keylessAuthDataArray.find(
    (data: KeylessAuthData) => data.uuid === uuid,
  );
};

/**
 * Check if the keyless auth data is expired
 * @param keyless_auth_data - The keyless auth data
 * @returns True if the keyless auth data is expired, false otherwise
 */
const isKeylessAuthDataRegistered = (keylessAuthData: KeylessAuthData) => {
  if (!keylessAuthData.expire) return false;
  if (!keylessAuthData.uuid) return false;
  if (keylessAuthData.expire < Date.now()) return false;
  return true;
};

/**
 * Save the keyless authentication data to local storage for future use.
 * Overwrites the existing data if it exists based on either uuid or appName.
 * @param username - The username of the user
 * @param keylessAuthData - The keyless auth data
 */
const storeKeylessAuthData = async (
  username: string,
  keylessAuthData: KeylessAuthData,
) => {
  try {
    let keylessAuthDataUserDictionary =
      await getKeylessAuthDataUserDictionary();
    //initialize the keylessAuthDataUserDictionary if it does not exist
    if (!keylessAuthDataUserDictionary) {
      keylessAuthDataUserDictionary = {} as KeylessAuthDataUserDictionary;
    }
    //initialize the keylessAuthDataUserDictionary[username] if it does not exist
    if (!keylessAuthDataUserDictionary[username]) {
      keylessAuthDataUserDictionary[username] = [];
    }
    const userAuthDataArray = keylessAuthDataUserDictionary[username];
    //if the userAuthDataArray already contains the keylessAuthData by uuid, remove it
    if (
      userAuthDataArray.find(
        (data: KeylessAuthData) => data.uuid === keylessAuthData.uuid,
      )
    ) {
      userAuthDataArray.splice(userAuthDataArray.indexOf(keylessAuthData), 1);
    }
    //if the userAuthDataArray already contains the keylessAuthData by appName, remove it
    if (
      userAuthDataArray.find(
        (data: KeylessAuthData) => data.appName === keylessAuthData.appName,
      )
    ) {
      userAuthDataArray.splice(userAuthDataArray.indexOf(keylessAuthData), 1);
    }
    //add the keylessAuthData to the userAuthDataArray
    userAuthDataArray.push(keylessAuthData);
    keylessAuthDataUserDictionary[username] = userAuthDataArray;
    await storeKeylessAuthDataUserDictionary(keylessAuthDataUserDictionary);
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
    let keylessAuthDataUserDictionary =
      await getKeylessAuthDataUserDictionary();
    if (
      !keylessAuthDataUserDictionary ||
      !keylessAuthDataUserDictionary[username]
    ) {
      return;
    }
    keylessAuthDataUserDictionary[username] = keylessAuthDataUserDictionary[
      username
    ].filter((data: KeylessAuthData) => data.uuid !== uuid);
    await storeKeylessAuthDataUserDictionary(keylessAuthDataUserDictionary);
  } catch (e) {
    throw new Error(`Error removing keyless auth data: ${e}`);
  }
};

const encryptSignRequestData = async (
  username: string,
  domain: string,
  signRequestData: SIGN_REQ_DATA,
) => {
  const keylessAuthData = await getKeylessAuthDataByAppName(username, domain);
  if (!keylessAuthData) throw new Error('Keyless auth data not found');
  if (!keylessAuthData.authKey) throw new Error('Auth key not found');
  const encryptedSignRequestData = EncryptUtils.encryptNoIV(
    JSON.stringify(signRequestData),
    keylessAuthData.authKey,
  );
  return { encryptedSignRequestData, token: keylessAuthData.token };
};

const KeylessKeychainUtils = {
  registerUserAndDapp,
  getKeylessAuthDataByUUID,
  getKeylessAuthDataByAppName,
  storeKeylessAuthData,
  removeKeylessAuthData,
  updateAuthenticatedKeylessAuthData,
  getKeylessAuthDataUserDictionary,
  isKeylessAuthDataRegistered,
  encryptSignRequestData,
};

export default KeylessKeychainUtils;
