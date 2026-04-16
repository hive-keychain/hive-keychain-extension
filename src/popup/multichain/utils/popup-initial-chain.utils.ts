import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { Chain } from '@popup/multichain/interfaces/chains.interface';

export interface PopupInitialChainCandidates {
  storedChain: Chain | null;
  ecosystemChain: Chain | null;
  providerChain: EvmChain | null;
  hasRequestedProviderChain: boolean;
}

export const resolvePopupInitialChain = ({
  storedChain,
  ecosystemChain,
  providerChain,
  hasRequestedProviderChain,
}: PopupInitialChainCandidates): Chain | null => {
  if (hasRequestedProviderChain && providerChain) {
    return providerChain;
  }

  return ecosystemChain ?? storedChain;
};
