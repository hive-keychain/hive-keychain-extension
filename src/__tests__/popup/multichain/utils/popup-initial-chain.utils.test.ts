import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import { resolvePopupInitialChain } from '@popup/multichain/utils/popup-initial-chain.utils';

describe('resolvePopupInitialChain', () => {
  const hiveChain = {
    name: 'HIVE',
    type: ChainType.HIVE,
    logo: '',
    chainId:
      'beeab0de00000000000000000000000000000000000000000000000000000000',
    rpcs: [],
  };
  const ecosystemChain = {
    name: 'Base',
    type: ChainType.EVM,
    logo: '',
    chainId: '0x2105',
    rpcs: [],
  };
  const providerChain = {
    name: 'Arbitrum',
    type: ChainType.EVM,
    logo: '',
    chainId: '0xa4b1',
    rpcs: [],
  };

  it('prefers the provider chain when the active site requested a chain change', () => {
    const result = resolvePopupInitialChain({
      providerChain,
      hasRequestedProviderChain: true,
      ecosystemChain,
      storedChain: hiveChain,
    });

    expect(result).toEqual(providerChain);
  });

  it('falls back to the ecosystem dapp chain when there is no requested provider chain', () => {
    const result = resolvePopupInitialChain({
      providerChain,
      hasRequestedProviderChain: false,
      ecosystemChain,
      storedChain: hiveChain,
    });

    expect(result).toEqual(ecosystemChain);
  });

  it('falls back to ACTIVE_CHAIN when neither provider nor ecosystem chain should be used', () => {
    const result = resolvePopupInitialChain({
      providerChain: null,
      hasRequestedProviderChain: false,
      ecosystemChain: null,
      storedChain: hiveChain,
    });

    expect(result).toEqual(hiveChain);
  });
});
