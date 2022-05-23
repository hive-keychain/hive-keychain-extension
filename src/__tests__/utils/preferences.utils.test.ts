import {
  KeychainKeyTypes,
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import {
  addToWhitelist,
  isWhitelisted,
  removeFromWhitelist,
} from 'src/utils/preferences.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';

const chrome = require('chrome-mock');
global.chrome = chrome;

afterEach(() => {
  jest.clearAllMocks();
});
describe('preferences.utils tests:\n', () => {
  describe('addToWhitelist tests:\n', () => {
    const username = utilsT.userData.username;
    const domain = 'domain';
    const type = 'type';
    let mockGetValueFromLocalStorage: jest.Mock;
    let mockSaveValueInLocalStorage: jest.Mock;
    afterEach(() => {
      mockGetValueFromLocalStorage.mockReset();
      mockGetValueFromLocalStorage.mockRestore();
    });
    test('Checking on an account without a stored value, must set [username][domain][type] to true and return undefined', async () => {
      mockGetValueFromLocalStorage =
        LocalStorageUtils.getValueFromLocalStorage = jest
          .fn()
          .mockResolvedValueOnce({});
      mockSaveValueInLocalStorage = LocalStorageUtils.saveValueInLocalStorage =
        jest.fn();
      const result = await addToWhitelist(username, domain, type);
      expect(result).toBe(undefined);
      expect(mockGetValueFromLocalStorage).toBeCalledTimes(1);
      expect(mockGetValueFromLocalStorage).toBeCalledWith(
        LocalStorageKeyEnum.NO_CONFIRM,
      );
      expect(mockSaveValueInLocalStorage).toBeCalledTimes(1);
      expect(mockSaveValueInLocalStorage).toBeCalledWith('no_confirm', {
        'keychain.tests': { domain: { type: true } },
      });
    });
    test('Checking on an account with a stored value(different username key), must set a new [username][domain][type] to true and return undefined', async () => {
      mockGetValueFromLocalStorage =
        LocalStorageUtils.getValueFromLocalStorage = jest
          .fn()
          .mockResolvedValueOnce({ quentin: { domain: {} } });
      mockSaveValueInLocalStorage = LocalStorageUtils.saveValueInLocalStorage =
        jest.fn();
      const result = await addToWhitelist(username, domain, type);
      expect(result).toBe(undefined);
      expect(mockGetValueFromLocalStorage).toBeCalledTimes(1);
      expect(mockGetValueFromLocalStorage).toBeCalledWith(
        LocalStorageKeyEnum.NO_CONFIRM,
      );
      expect(mockSaveValueInLocalStorage).toBeCalledTimes(1);
      expect(mockSaveValueInLocalStorage).toBeCalledWith('no_confirm', {
        'keychain.tests': {
          domain: {
            type: true,
          },
        },
        quentin: {
          domain: {},
        },
      });
    });
    test('Checking on an account with a stored value(different domain key), must set a new [username][domain][type] to true and return undefined', async () => {
      mockGetValueFromLocalStorage =
        LocalStorageUtils.getValueFromLocalStorage = jest
          .fn()
          .mockResolvedValueOnce({ 'keychain.tests': { domain2: {} } });
      mockSaveValueInLocalStorage = LocalStorageUtils.saveValueInLocalStorage =
        jest.fn();
      const result = await addToWhitelist(username, domain, type);
      expect(result).toBe(undefined);
      expect(mockGetValueFromLocalStorage).toBeCalledTimes(1);
      expect(mockGetValueFromLocalStorage).toBeCalledWith(
        LocalStorageKeyEnum.NO_CONFIRM,
      );
      expect(mockSaveValueInLocalStorage).toBeCalledTimes(1);
      expect(mockSaveValueInLocalStorage).toBeCalledWith('no_confirm', {
        'keychain.tests': {
          domain: {
            type: true,
          },
          domain2: {},
        },
      });
    });
  });
  describe('isWhitelisted tests:\n', () => {
    test('Passing empty values must return false', () => {
      const arr = {} as NoConfirm;
      const data = {} as KeychainRequest;
      const domain = '';
      const current_rpc = {} as Rpc;
      const result = isWhitelisted(arr, data, domain, current_rpc);
      expect(result).toBe(false);
    });
    test('Passing valid values and no testnet property, must return value within the arr(true)', () => {
      const data = {
        type: KeychainRequestTypes.decode,
        username: utilsT.userData.username,
        method: KeychainKeyTypes.posting,
      } as KeychainRequest;
      const domain = 'domain';
      const current_rpc = {} as Rpc;
      const arr = {
        'keychain.tests': { domain: { decode: true } },
      } as NoConfirm;
      const result = isWhitelisted(arr, data, domain, current_rpc);
      expect(result).toBe(true);
    });
    test('Passing valid values and no testnet property, must return value within the arr(false)', () => {
      const data = {
        type: KeychainRequestTypes.decode,
        username: utilsT.userData.username,
        method: KeychainKeyTypes.posting,
      } as KeychainRequest;
      const domain = 'domain';
      const current_rpc = {} as Rpc;
      const arr = {
        'keychain.tests': { domain: { decode: false } },
      } as NoConfirm;
      const result = isWhitelisted(arr, data, domain, current_rpc);
      expect(result).toBe(false);
    });
    test('Passing bad written data in arr, must cause an error and return false', () => {
      const data = {
        type: KeychainRequestTypes.decode,
        username: utilsT.userData.username,
        method: KeychainKeyTypes.posting,
      } as KeychainRequest;
      const domain = 'domain';
      const current_rpc = {} as Rpc;
      const arr = {
        'keychain.badTYPED': { domain: { decode: false } },
      } as NoConfirm;
      const result = isWhitelisted(arr, data, domain, current_rpc);
      expect(result).toBe(false);
    });
  });

  describe('removeFromWhitelist tests:\n', () => {
    test('Passing valid data must delete key within arr, save data into localStorage and return the new object', () => {
      const spySaveValue = jest.spyOn(
        LocalStorageUtils,
        'saveValueInLocalStorage',
      );
      const domain = 'domain';
      const arr = {
        'keychain.tests': { domain: { decode: false } },
      } as NoConfirm;
      const result = removeFromWhitelist(
        arr,
        utilsT.userData.username,
        domain,
        'decode',
      );
      expect(result).toEqual({ 'keychain.tests': {} });
      expect(spySaveValue).toBeCalledTimes(1);
      expect(spySaveValue).toBeCalledWith('no_confirm', {
        'keychain.tests': {},
      });
    });
    test('Passing invalid data will return same object arr and will save that value into localStorage', () => {
      const spySaveValue = jest.spyOn(
        LocalStorageUtils,
        'saveValueInLocalStorage',
      );
      const domain = 'domain';
      const arr = {
        'keychain.tests': { domain: { decode_bad_key: false } },
      } as NoConfirm;
      const result = removeFromWhitelist(
        arr,
        utilsT.userData.username,
        domain,
        'decode',
      );
      expect(result).toEqual(arr);
      expect(spySaveValue).toBeCalledTimes(1);
      expect(spySaveValue).toBeCalledWith('no_confirm', arr);
    });
  });
});
