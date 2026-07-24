import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import { setChain } from '@popup/multichain/actions/chain.actions';
import {
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';

jest.mock('@popup/multichain/utils/provider-chain-bootstrap.utils', () => ({
  syncProviderChainForActiveTab: jest.fn(),
}));

const evmChain: EvmChain = {
  type: ChainType.EVM,
  chainId: '0x2105',
  name: 'Base',
  logo: '',
  mainToken: 'ETH',
  defaultTransactionType: EvmTransactionType.EIP_1559,
  rpcs: [{ url: 'https://base-rpc.example', isDefault: true }],
};

describe('chain.actions tests:\n', () => {
  beforeEach(() => {
    jest.spyOn(EvmChainUtils, 'saveLastUsedChain').mockImplementation(() => {});
    jest.spyOn(EvmRpcUtils, 'getActiveRpc').mockResolvedValue({
      url: 'https://base-rpc.example',
      isDefault: true,
    });
    jest.spyOn(EvmRpcUtils, 'setActiveRpc').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('saves the last used EVM chain by default', async () => {
    const fakeStore = getFakeStore(initialEmptyStateStore);

    await fakeStore.dispatch<any>(setChain(evmChain));

    expect(EvmChainUtils.saveLastUsedChain).toHaveBeenCalledWith(evmChain);
    expect(fakeStore.getState().chain).toEqual(evmChain);
  });

  it('does not save the last used EVM chain when disabled', async () => {
    const fakeStore = getFakeStore(initialEmptyStateStore);

    await fakeStore.dispatch<any>(
      setChain(evmChain, { saveLastUsedChain: false }),
    );

    expect(EvmChainUtils.saveLastUsedChain).not.toHaveBeenCalled();
    expect(fakeStore.getState().chain).toEqual(evmChain);
  });

  it('syncs the provider chain when requested', async () => {
    const { syncProviderChainForActiveTab } = await import(
      '@popup/multichain/utils/provider-chain-bootstrap.utils'
    );
    const fakeStore = getFakeStore(initialEmptyStateStore);

    await fakeStore.dispatch<any>(
      setChain(evmChain, { syncProviderNetwork: true }),
    );

    expect(syncProviderChainForActiveTab).toHaveBeenCalledWith(evmChain);
  });
});
