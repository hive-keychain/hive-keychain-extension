import { Chain } from '@popup/multichain/interfaces/chains.interface';

let tabInferredChainId: string | null = null;

const normalizeChainId = (chainId: string | null | undefined): string | null =>
  chainId?.toLowerCase() ?? null;

const setTabInferredChainId = (chainId: string | null | undefined) => {
  tabInferredChainId = normalizeChainId(chainId);
};

const getTabInferredChainId = (): string | null => tabInferredChainId;

const clearTabInferredChain = () => {
  tabInferredChainId = null;
};

const isCurrentChainTabInferred = (chain: Chain | null | undefined): boolean => {
  if (!tabInferredChainId || !chain?.chainId) {
    return false;
  }

  return chain.chainId.toLowerCase() === tabInferredChainId;
};

export const PopupTabChainContextUtils = {
  setTabInferredChainId,
  getTabInferredChainId,
  clearTabInferredChain,
  isCurrentChainTabInferred,
};
