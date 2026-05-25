import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import {
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const mockJsonRpcProviderSend = jest.fn();
const mockJsonRpcProviderDestroy = jest.fn();

jest.mock('ethers', () => {
  const actual = jest.requireActual('ethers');
  return {
    ...actual,
    ethers: {
      ...actual.ethers,
      JsonRpcProvider: jest.fn(() => ({
        send: mockJsonRpcProviderSend,
        destroy: mockJsonRpcProviderDestroy,
      })),
    },
  };
});

const chain = {
  chainId: '0x1',
  name: 'Ethereum',
  type: ChainType.EVM,
  mainToken: 'ETH',
  logo: '',
  rpcs: [{ url: 'https://default.rpc', isDefault: true }],
  defaultTransactionType: 'EIP_1559',
} as EvmChain;

describe('EvmRpcUtils HTTPS validation', () => {
  beforeEach(() => {
    mockJsonRpcProviderSend.mockReset();
    mockJsonRpcProviderDestroy.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('rejects invalid active RPCs before storage or provider updates', async () => {
    const getStorageSpy = jest.spyOn(
      LocalStorageUtils,
      'getValueFromLocalStorage',
    );
    const saveStorageSpy = jest.spyOn(
      LocalStorageUtils,
      'saveValueInLocalStorage',
    );
    const setProviderSpy = jest.spyOn(EthersUtils, 'setProvider');

    await expect(
      EvmRpcUtils.setActiveRpc(
        { url: 'file:///tmp/rpc', isDefault: false },
        chain,
      ),
    ).rejects.toThrow('RPC URL must use HTTP or HTTPS');

    expect(getStorageSpy).not.toHaveBeenCalled();
    expect(saveStorageSpy).not.toHaveBeenCalled();
    expect(setProviderSpy).not.toHaveBeenCalled();
  });

  it('rejects mixed custom RPC lists before saving', async () => {
    const getStorageSpy = jest.spyOn(
      LocalStorageUtils,
      'getValueFromLocalStorage',
    );
    const saveStorageSpy = jest.spyOn(
      LocalStorageUtils,
      'saveValueInLocalStorage',
    );

    await expect(
      EvmRpcUtils.addCustomRpcsFromList(
        ['https://rpc.example.com', 'http://rpc.example.com'],
        chain,
      ),
    ).rejects.toThrow('RPC URL must use HTTPS');

    expect(getStorageSpy).not.toHaveBeenCalled();
    expect(saveStorageSpy).not.toHaveBeenCalled();
  });

  it('rejects invalid custom RPCs before saving', async () => {
    const getStorageSpy = jest.spyOn(
      LocalStorageUtils,
      'getValueFromLocalStorage',
    );
    const saveStorageSpy = jest.spyOn(
      LocalStorageUtils,
      'saveValueInLocalStorage',
    );

    await expect(
      EvmRpcUtils.addCustomRpc(
        { url: 'file:///tmp/rpc', isDefault: false },
        chain,
      ),
    ).rejects.toThrow('RPC URL must use HTTP or HTTPS');

    expect(getStorageSpy).not.toHaveBeenCalled();
    expect(saveStorageSpy).not.toHaveBeenCalled();
  });

  it('saves HTTP custom RPCs', async () => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue({});
    const saveStorageSpy = jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockResolvedValue(undefined);

    await EvmRpcUtils.addCustomRpc(
      { url: 'http://rpc.example.com', isDefault: false },
      chain,
    );

    expect(saveStorageSpy).toHaveBeenCalledWith(
      LocalStorageKeyEnum.EVM_CUSTOM_RPC_LIST,
      {
        '0x1': [{ url: 'http://rpc.example.com', isDefault: false }],
      },
    );
  });

  it('saves HTTPS custom RPCs', async () => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue({});
    const saveStorageSpy = jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockResolvedValue(undefined);

    await EvmRpcUtils.addCustomRpcsFromList(['https://rpc.example.com'], chain);

    expect(saveStorageSpy).toHaveBeenCalledWith(
      LocalStorageKeyEnum.EVM_CUSTOM_RPC_LIST,
      {
        '0x1': [{ url: 'https://rpc.example.com', isDefault: false }],
      },
    );
  });

  it('does not save a custom RPC that already exists in the default chain RPCs', async () => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue({});
    const saveStorageSpy = jest.spyOn(
      LocalStorageUtils,
      'saveValueInLocalStorage',
    );

    await EvmRpcUtils.addCustomRpc(
      { url: 'https://default.rpc', isDefault: false },
      chain,
    );

    expect(saveStorageSpy).not.toHaveBeenCalled();
  });

  it('does not save a custom RPC that already exists in custom RPCs', async () => {
    jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue({
      '0x1': [{ url: 'https://custom.rpc', isDefault: false }],
    });
    const saveStorageSpy = jest.spyOn(
      LocalStorageUtils,
      'saveValueInLocalStorage',
    );

    await EvmRpcUtils.addCustomRpc(
      { url: 'https://custom.rpc', isDefault: false },
      chain,
    );

    expect(saveStorageSpy).not.toHaveBeenCalled();
  });

  it('only saves new RPCs from a list when some entries are duplicates', async () => {
    jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue({
      '0x1': [{ url: 'https://custom.rpc', isDefault: false }],
    });
    const saveStorageSpy = jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockResolvedValue(undefined);

    await EvmRpcUtils.addCustomRpcsFromList(
      [
        'https://default.rpc',
        'https://custom.rpc',
        'https://new.rpc',
        'https://new.rpc',
      ],
      chain,
    );

    expect(saveStorageSpy).toHaveBeenCalledWith(
      LocalStorageKeyEnum.EVM_CUSTOM_RPC_LIST,
      {
        '0x1': [
          { url: 'https://custom.rpc', isDefault: false },
          { url: 'https://new.rpc', isDefault: false },
        ],
      },
    );
  });

  it('accepts HTTPS RPCs returning the expected eth_chainId', async () => {
    mockJsonRpcProviderSend.mockResolvedValue('0x1');

    await expect(
      EvmRpcUtils.isValidRpcForChainId('https://rpc.example.com', '0x1'),
    ).resolves.toBe(true);

    expect(mockJsonRpcProviderSend).toHaveBeenCalledWith('eth_chainId', []);
  });

  it('accepts HTTPS RPCs returning the expected eth_chainId before timeout', async () => {
    jest.useFakeTimers();
    mockJsonRpcProviderSend.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve('0x1'), 500);
        }),
    );

    const result = EvmRpcUtils.isValidRpcForChainId(
      'https://rpc.example.com',
      '0x1',
    );

    jest.advanceTimersByTime(500);
    await expect(result).resolves.toBe(true);
  });

  it('rejects HTTPS RPCs when eth_chainId times out', async () => {
    jest.useFakeTimers();
    mockJsonRpcProviderSend.mockReturnValue(new Promise(() => undefined));

    const result = EvmRpcUtils.isValidRpcForChainId(
      'https://rpc.example.com',
      '0x1',
    );

    jest.advanceTimersByTime(1000);
    await expect(result).resolves.toBe(false);
  });

  it('rejects HTTPS RPCs returning a different eth_chainId', async () => {
    mockJsonRpcProviderSend.mockResolvedValue('0x2');

    await expect(
      EvmRpcUtils.isValidRpcForChainId('https://rpc.example.com', '0x1'),
    ).resolves.toBe(false);
  });

  it('rejects HTTPS RPCs that throw while reading eth_chainId', async () => {
    mockJsonRpcProviderSend.mockRejectedValue(new Error('network error'));

    await expect(
      EvmRpcUtils.isValidRpcForChainId('https://rpc.example.com', '0x1'),
    ).resolves.toBe(false);
  });

  it('rejects HTTP RPCs without calling eth_chainId', async () => {
    await expect(
      EvmRpcUtils.isValidRpcForChainId('http://rpc.example.com', '0x1'),
    ).resolves.toBe(false);

    expect(mockJsonRpcProviderSend).not.toHaveBeenCalled();
  });

  it('accepts HTTP RPCs returning the expected eth_chainId when HTTP is allowed', async () => {
    mockJsonRpcProviderSend.mockResolvedValue('0x1');

    await expect(
      EvmRpcUtils.isValidRpcForChainId(
        'http://rpc.example.com',
        '0x1',
        true,
      ),
    ).resolves.toBe(true);

    expect(mockJsonRpcProviderSend).toHaveBeenCalledWith('eth_chainId', []);
  });

  it('filters mixed RPC lists to matching HTTPS RPCs', async () => {
    mockJsonRpcProviderSend
      .mockResolvedValueOnce('0x1')
      .mockResolvedValueOnce('0x2')
      .mockRejectedValueOnce(new Error('network error'));

    await expect(
      EvmRpcUtils.filterValidRpcsForChainId(
        [
          'https://valid.rpc',
          'https://wrong-chain.rpc',
          'https://throwing.rpc',
          'http://invalid.rpc',
          'https://valid.rpc',
        ],
        '0x1',
      ),
    ).resolves.toEqual(['https://valid.rpc']);
  });
});
