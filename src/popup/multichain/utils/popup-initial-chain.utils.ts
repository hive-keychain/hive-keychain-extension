import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { Chain } from '@popup/multichain/interfaces/chains.interface';

export interface PopupInitialChainCandidates {
  storedChain: Chain | null;
  ecosystemChain: Chain | null;
  providerChain: EvmChain | null;
  hasRequestedProviderChain: boolean;
}

export type PopupInitialChainSource = 'provider' | 'ecosystem' | 'stored';

export interface PopupInitialChainResult {
  chain: Chain | null;
  source: PopupInitialChainSource | null;
}

const isResolvedStartupChain = (chain: Chain | null): chain is Chain =>
  !!chain?.chainId && !!chain?.name?.length;

export const resolvePopupInitialChain = ({
  storedChain,
  ecosystemChain,
  providerChain,
  hasRequestedProviderChain,
}: PopupInitialChainCandidates): PopupInitialChainResult => {
  if (
    hasRequestedProviderChain &&
    isResolvedStartupChain(providerChain)
  ) {
    return { chain: providerChain, source: 'provider' };
  }

  if (isResolvedStartupChain(ecosystemChain)) {
    return { chain: ecosystemChain, source: 'ecosystem' };
  }

  if (isResolvedStartupChain(providerChain)) {
    return { chain: providerChain, source: 'provider' };
  }

  if (isResolvedStartupChain(storedChain)) {
    return { chain: storedChain, source: 'stored' };
  }

  return { chain: null, source: null };
};
