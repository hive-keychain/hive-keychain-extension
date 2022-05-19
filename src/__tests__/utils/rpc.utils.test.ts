import { Rpc } from '@interfaces/rpc.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import RpcUtils from 'src/utils/rpc.utils';

afterEach(() => {
  jest.clearAllMocks();
});
describe('rpc.utils tests:\n', () => {
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
      expect(await RpcUtils.getCustomRpcs()).toEqual(customRpcs);
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
      expect(mockedGetValueFromLocalStorage).toBeCalledTimes(1);
      expect(mockedGetValueFromLocalStorage).toBeCalledWith('rpc');
      expect(mockSaveValueInLocalStorage).toBeCalledTimes(1);
      expect(mockSaveValueInLocalStorage).toBeCalledWith('rpc', [customRpc]);
    });
    test('Adding a customRpc into and non empty rpc onject in localStorage, must call saveValueInLocalStorage adding the new rpc into that object', async () => {
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
      expect(mockedGetValueFromLocalStorage).toBeCalledTimes(1);
      expect(mockedGetValueFromLocalStorage).toBeCalledWith('rpc');
      expect(mockSaveValueInLocalStorage).toBeCalledTimes(1);
      expect(mockSaveValueInLocalStorage).toBeCalledWith(
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
      expect(mockSaveValueInLocalStorage).toBeCalledTimes(1);
      expect(mockSaveValueInLocalStorage).toBeCalledWith('rpc', expectedArray);
      expect(result.length).toBe(expectedArray.length);
      expect(result).toEqual(expectedArray);
    });
    test('Delete a customRpc which does not exists on the passed array, must return the same array and save it into localStorage', () => {
      const expectedArray = [...customRpcList];
      const rpcToDelete = { uri: 'https://blog.apiHive/', testnet: false };
      const mockSaveValueInLocalStorage =
        (LocalStorageUtils.saveValueInLocalStorage = jest.fn());
      const result = RpcUtils.deleteCustomRpc(customRpcList, rpcToDelete);
      expect(mockSaveValueInLocalStorage).toBeCalledTimes(1);
      expect(mockSaveValueInLocalStorage).toBeCalledWith('rpc', expectedArray);
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
      expect(mockGetValueFromLocalStorage).toBeCalledTimes(1);
      expect(mockGetValueFromLocalStorage).toBeCalledWith(
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
      expect(mockGetValueFromLocalStorage).toBeCalledTimes(1);
      expect(mockGetValueFromLocalStorage).toBeCalledWith(
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
      expect(mockGetCustomRpcs).toBeCalledTimes(1);
    });
    test('Find an rpc which not exists, must return undefined', async () => {
      const mockGetCustomRpcs = (RpcUtils.getCustomRpcs = jest
        .fn()
        .mockResolvedValueOnce(customRpcList));
      expect(await RpcUtils.findRpc('https://apiHive2.blog/')).toBe(undefined);
      expect(mockGetCustomRpcs).toBeCalledTimes(1);
    });
  });
});
