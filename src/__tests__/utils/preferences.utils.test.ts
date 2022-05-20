import {
  KeychainKeyTypes,
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import { NoConfirm } from '@interfaces/no-confirm.interface';
import { Rpc } from '@interfaces/rpc.interface';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import {
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
