import RpcUtils from '@hiveapp/utils/rpc.utils';
import { Rpc } from '@interfaces/rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import axios from 'axios';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

describe('rpc.utils tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('getFullList tests:\n', () => {
    test('Must return a valid object', () => {
      const result = RpcUtils.getFullList();
      expect(typeof result).toBe('object');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeDefined();
      expect(result[0].uri).toBeDefined();
      expect(result[0].testnet).toBeDefined();
      expect(result[0].uri).not.toBe('');
    });
  });

  describe('isDefault tests:\n', () => {
    test('Passing not the default Rpc must return false', () => {
      const notDefaultRpc: Rpc = {
        uri: '',
        testnet: false,
      };
      expect(RpcUtils.isDefault(notDefaultRpc)).toBe(false);
    });
    test('Passing the default Rpc must return true', () => {
      const defaultRpc: Rpc = {
        uri: 'https://api.hive.blog/',
        testnet: false,
      };
      expect(RpcUtils.isDefault(defaultRpc)).toBe(true);
    });
  });

  describe('getCustomRpcs tests:\n', () => {
    test('If stored customRpc list, must return the array', async () => {
      const customRpcs: Rpc[] = [
        { uri: 'https://apiHive/', testnet: true },
        { uri: 'https://apiHive2/', testnet: false },
      ];
      LocalStorageUtils.getValueFromLocalStorage = jest
        .fn()
        .mockResolvedValueOnce(customRpcs);
      expect(await RpcUtils.getCustomRpcs()).toEqual([
        { uri: 'https://apiHive/', testnet: true, custom: true },
        { uri: 'https://apiHive2/', testnet: false, custom: true },
      ]);
    });
    test('If no stored customRpc list, must return empty array', async () => {
      LocalStorageUtils.getValueFromLocalStorage = jest
        .fn()
        .mockResolvedValueOnce(undefined);
      expect(await RpcUtils.getCustomRpcs()).toEqual([] as Rpc[]);
    });
  });

  describe('addCustomRpc tests:\n', () => {
    test('Adding a customRpc into and empty rpc onject in localStorage, must call saveValueInLocalStorage with the new rpc', async () => {
      const mockedGetValueFromLocalStorage =
        (LocalStorageUtils.getValueFromLocalStorage = jest
          .fn()
          .mockResolvedValueOnce([]));
      const mockSaveValueInLocalStorage =
        (LocalStorageUtils.saveValueInLocalStorage = jest.fn());
      const customRpc: Rpc = { uri: 'https://newRPC.api/', testnet: false };
      expect(await RpcUtils.addCustomRpc(customRpc)).toBe(undefined);
      expect(mockedGetValueFromLocalStorage).toHaveBeenCalledTimes(1);
      expect(mockedGetValueFromLocalStorage).toHaveBeenCalledWith('rpc');
      expect(mockSaveValueInLocalStorage).toHaveBeenCalledTimes(1);
      expect(mockSaveValueInLocalStorage).toHaveBeenCalledWith('rpc', [customRpc]);
    });
    test('Adding a customRpc into and non empty rpc object in localStorage, must call saveValueInLocalStorage adding the new rpc into that object', async () => {
      const customRpcs: Rpc[] = [
        { uri: 'https://apiHive/', testnet: true },
        { uri: 'https://apiHive2/', testnet: false },
      ];
      const customRpc: Rpc = { uri: 'https://newRPC.api/', testnet: false };
      const expectedRpcArray = [...customRpcs, customRpc];
      const mockedGetValueFromLocalStorage =
        (LocalStorageUtils.getValueFromLocalStorage = jest
          .fn()
          .mockResolvedValueOnce(customRpcs));
      const mockSaveValueInLocalStorage =
        (LocalStorageUtils.saveValueInLocalStorage = jest.fn());
      expect(await RpcUtils.addCustomRpc(customRpc)).toBe(undefined);
      expect(mockedGetValueFromLocalStorage).toHaveBeenCalledTimes(1);
      expect(mockedGetValueFromLocalStorage).toHaveBeenCalledWith('rpc');
      expect(mockSaveValueInLocalStorage).toHaveBeenCalledTimes(1);
      expect(mockSaveValueInLocalStorage).toHaveBeenCalledWith(
        'rpc',
        expectedRpcArray,
      );
    });
  });

  describe('deleteCustomRpc tests:\n', () => {
    const customRpcList = [
      { uri: 'https://apiHive/', testnet: true },
      { uri: 'https://apiHive2/', testnet: false },
    ];
    test('Delete a customRpc which exists on the passed array, must return the new array and save it into localStorage', () => {
      const expectedArray = [{ uri: 'https://apiHive2/', testnet: false }];
      const rpcToDelete = { uri: 'https://apiHive/', testnet: true };
      const mockSaveValueInLocalStorage =
        (LocalStorageUtils.saveValueInLocalStorage = jest.fn());
      const result = RpcUtils.deleteCustomRpc(customRpcList, rpcToDelete);
      expect(mockSaveValueInLocalStorage).toHaveBeenCalledTimes(1);
      expect(mockSaveValueInLocalStorage).toHaveBeenCalledWith('rpc', expectedArray);
      expect(result.length).toBe(expectedArray.length);
      expect(result).toEqual(expectedArray);
    });
    test('Delete a customRpc which does not exists on the passed array, must return the same array and save it into localStorage', () => {
      const expectedArray = [...customRpcList];
      const rpcToDelete = { uri: 'https://blog.apiHive/', testnet: false };
      const mockSaveValueInLocalStorage =
        (LocalStorageUtils.saveValueInLocalStorage = jest.fn());
      const result = RpcUtils.deleteCustomRpc(customRpcList, rpcToDelete);
      expect(mockSaveValueInLocalStorage).toHaveBeenCalledTimes(1);
      expect(mockSaveValueInLocalStorage).toHaveBeenCalledWith('rpc', expectedArray);
      expect(result.length).toBe(expectedArray.length);
      expect(result).toEqual(expectedArray);
    });
  });

  describe('getCurrentRpc tests:\n', () => {
    test('If no currentRpc found on localStorage, will return default values', async () => {
      const defaultValuesRpc = { uri: 'DEFAULT', testnet: false };
      const mockGetValueFromLocalStorage =
        (LocalStorageUtils.getValueFromLocalStorage = jest
          .fn()
          .mockResolvedValueOnce(undefined));
      expect(await RpcUtils.getCurrentRpc()).toEqual(defaultValuesRpc);
      expect(mockGetValueFromLocalStorage).toHaveBeenCalledTimes(1);
      expect(mockGetValueFromLocalStorage).toHaveBeenCalledWith(
        LocalStorageKeyEnum.CURRENT_RPC,
      );
    });
    test('If currentRpc found on localStorage, will return that object', async () => {
      const currentRpcFound = { uri: 'CURRENT', testnet: true };
      const mockGetValueFromLocalStorage =
        (LocalStorageUtils.getValueFromLocalStorage = jest
          .fn()
          .mockResolvedValueOnce(currentRpcFound));
      expect(await RpcUtils.getCurrentRpc()).toEqual(currentRpcFound);
      expect(mockGetValueFromLocalStorage).toHaveBeenCalledTimes(1);
      expect(mockGetValueFromLocalStorage).toHaveBeenCalledWith(
        LocalStorageKeyEnum.CURRENT_RPC,
      );
    });
  });

  describe('findRpc tests:\n', () => {
    const customRpcList = [
      { uri: 'https://apiHive/', testnet: true },
      { uri: 'https://apiHive2/', testnet: false },
    ];
    test('Find an rpc which exists, must return the rpc object', async () => {
      const mockGetCustomRpcs = (RpcUtils.getCustomRpcs = jest
        .fn()
        .mockResolvedValueOnce(customRpcList));
      expect(await RpcUtils.findRpc('https://apiHive/')).toEqual(
        customRpcList[0],
      );
      expect(mockGetCustomRpcs).toHaveBeenCalledTimes(1);
    });
    test('Find an rpc which not exists, must return undefined', async () => {
      const mockGetCustomRpcs = (RpcUtils.getCustomRpcs = jest
        .fn()
        .mockResolvedValueOnce(customRpcList));
      expect(await RpcUtils.findRpc('https://apiHive2.blog/')).toBe(undefined);
      expect(mockGetCustomRpcs).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkRpcStatus tests:\n', () => {
    const fakeResponse = {
      status: 'OK',
      datetime: '2022-05-19T18:14:33.440167',
      source_commit: '',
      docker_tag: '',
      jussi_num: 64517562,
    };
    const hardCodedUri = 'https://hived.emre.sh';
    test('Checking on uri "DEFAULT" will hit the default Hive API base URL and return status', async () => {
      const spyAxiosGet = jest
        .spyOn(axios, 'get')
        .mockResolvedValueOnce(fakeResponse);
      expect(await RpcUtils.checkRpcStatus('DEFAULT')).toBe(true);
      expect(spyAxiosGet).toHaveBeenCalledTimes(1);
      expect(spyAxiosGet).toHaveBeenCalledWith('https://api.hive.blog', {
        timeout: 10000,
      });
    });
    test('Checking on a hardcoded uri, will check on "uri/health" and return status', async () => {
      const spyAxiosGet = jest
        .spyOn(axios, 'get')
        .mockResolvedValueOnce(fakeResponse);
      expect(await RpcUtils.checkRpcStatus(hardCodedUri)).toBe(true);
      expect(spyAxiosGet).toHaveBeenCalledTimes(1);
      expect(spyAxiosGet).toHaveBeenCalledWith(`${hardCodedUri}/health`, {
        timeout: 10000,
      });
    });
    test('If the checked uri returns an error, an error will be thrown by the interceptor as "RPC NOK" and will return false', async () => {
      const error = new Error('RPC NOK');
      const spyLoggerError = jest.spyOn(Logger, 'error');
      const spyAxiosGet = jest
        .spyOn(axios, 'get')
        .mockImplementationOnce((...args) => Promise.reject(error));
      expect(await RpcUtils.checkRpcStatus(hardCodedUri)).toBe(false);
      expect(spyAxiosGet).toHaveBeenCalledTimes(1);
      expect(spyAxiosGet).toHaveBeenCalledWith(`${hardCodedUri}/health`, {
        timeout: 10000,
      });
      expect(spyLoggerError).toHaveBeenCalledTimes(1);
      expect(spyLoggerError).toHaveBeenCalledWith('error', error);
    });
  });
});
