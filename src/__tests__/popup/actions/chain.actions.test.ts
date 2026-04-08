import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { setChain } from '@popup/multichain/actions/chain.actions';
import {
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';

jest.mock('@popup/evm/utils/evm-chain.utils', () => ({
  EvmChainUtils: {
    setActiveEvmChain: jest.fn(),
  },
}));

describe('chain.actions', () => {
  const polygonChain = {
    chainId: '0x89',
    name: 'Polygon',
    type: ChainType.EVM,
    logo: '',
    rpcs: [{ url: 'https://polygon-rpc.test' }],
  } as EvmChain;

  beforeEach(() => {
    jest.clearAllMocks();
    (EvmChainUtils.setActiveEvmChain as jest.Mock).mockResolvedValue(undefined);
  });

  it('routes popup EVM chain changes through the canonical active-chain setter', async () => {
    const fakeStore = getFakeStore(initialEmptyStateStore);

    await fakeStore.dispatch<any>(setChain(polygonChain));

    expect(EvmChainUtils.setActiveEvmChain).toHaveBeenCalledWith(polygonChain, {
      emitEvent: true,
    });
    expect(fakeStore.getState().chain).toEqual(polygonChain);
  });

  it('suppresses chainChanged emission for bootstrap hydration updates', async () => {
    const fakeStore = getFakeStore(initialEmptyStateStore);

    await fakeStore.dispatch<any>(
      setChain(polygonChain, { emitEvmChainChanged: false }),
    );

    expect(EvmChainUtils.setActiveEvmChain).toHaveBeenCalledWith(polygonChain, {
      emitEvent: false,
    });
  });
});
