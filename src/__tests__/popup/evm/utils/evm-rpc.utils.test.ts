import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import {
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

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
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rejects non-HTTPS active RPCs before storage or provider updates', async () => {
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
        { url: 'http://rpc.example.com', isDefault: false },
        chain,
      ),
    ).rejects.toThrow('RPC URL must use HTTPS');

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

  it('rejects non-HTTPS custom RPCs before saving', async () => {
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
    ).rejects.toThrow('RPC URL must use HTTPS');

    expect(getStorageSpy).not.toHaveBeenCalled();
    expect(saveStorageSpy).not.toHaveBeenCalled();
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
});
