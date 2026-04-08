import { EvmEventName } from '@interfaces/evm-provider.interface';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import * as responseLogic from 'src/content-scripts/hive/web-interface/response.logic';
import LocalStorageUtils from 'src/utils/localStorage.utils';

jest.mock('@popup/evm/utils/evm-rpc.utils', () => ({
  EvmRpcUtils: {
    getActiveRpc: jest.fn(),
    setActiveRpc: jest.fn(),
  },
}));

jest.mock('src/content-scripts/hive/web-interface/response.logic', () => ({
  sendEvmEventGlobal: jest.fn(),
}));

describe('evm-chain utils', () => {
  const ethereumChain = {
    chainId: '0x1',
    name: 'Ethereum',
    rpcs: [{ url: 'https://ethereum-rpc.test' }],
  } as EvmChain;
  const polygonChain = {
    chainId: '0x89',
    name: 'Polygon',
    rpcs: [{ url: 'https://polygon-rpc.test' }],
  } as EvmChain;

  let localStorageState: Partial<Record<LocalStorageKeyEnum, any>>;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageState = {
      [LocalStorageKeyEnum.EVM_LAST_CHAIN_USED]: ethereumChain.chainId,
    };

    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key) => localStorageState[key as LocalStorageKeyEnum]);

    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockImplementation(async (key, value) => {
        localStorageState[key as LocalStorageKeyEnum] = value;
      });

    (EvmRpcUtils.getActiveRpc as jest.Mock).mockImplementation(
      async (chain: EvmChain) => chain.rpcs[0],
    );
    (EvmRpcUtils.setActiveRpc as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('emits chainChanged once when the active EVM chain changes', async () => {
    await EvmChainUtils.setActiveEvmChain(polygonChain);

    expect(localStorageState[LocalStorageKeyEnum.EVM_LAST_CHAIN_USED]).toBe(
      polygonChain.chainId,
    );
    expect(EvmRpcUtils.getActiveRpc).toHaveBeenCalledWith(polygonChain);
    expect(EvmRpcUtils.setActiveRpc).toHaveBeenCalledWith(
      polygonChain.rpcs[0],
      polygonChain,
    );
    expect(responseLogic.sendEvmEventGlobal).toHaveBeenCalledTimes(1);
    expect(responseLogic.sendEvmEventGlobal).toHaveBeenCalledWith(
      EvmEventName.CHAIN_CHANGED,
      polygonChain.chainId,
    );
  });

  it('does not emit duplicate chainChanged events when setting the same chain twice', async () => {
    await EvmChainUtils.setActiveEvmChain(polygonChain);
    await EvmChainUtils.setActiveEvmChain(polygonChain);

    expect(responseLogic.sendEvmEventGlobal).toHaveBeenCalledTimes(1);
  });

  it('can suppress chainChanged emission during hydration-style updates', async () => {
    await EvmChainUtils.setActiveEvmChain(polygonChain, {
      emitEvent: false,
    });

    expect(responseLogic.sendEvmEventGlobal).not.toHaveBeenCalled();
  });
});
