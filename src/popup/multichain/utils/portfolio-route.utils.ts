import { Screen } from '@interfaces/screen.interface';
import { MultichainScreen } from '@popup/multichain/reference-data/multichain-screen.enum';
import { ExtensionPageUtils } from '@popup/multichain/utils/extension-page.utils';

const PORTFOLIO_HASH = '#portfolio';
const PORTFOLIO_BUY_HASH = '#buy';
const PORTFOLIO_SWAP_HASH = '#swap';
const PORTFOLIO_PATH = 'portfolio.html';
const SWAP_OUTGOING_SYMBOL_PARAM = 'fromSymbol';
const SWAP_OUTGOING_ECOSYSTEM_PARAM = 'fromEcosystem';
const SWAP_OUTGOING_CHAIN_PARAM = 'fromChainId';
const SWAP_OUTGOING_CONTRACT_PARAM = 'fromContract';

/** Token the popup swap shortcut should preselect as the asset being sent. */
export type PortfolioSwapOutgoingToken = {
  symbol: string;
  ecosystem: 'hive' | 'evm';
  chainId?: string;
  contractAddress?: string;
};

const parseHash = (hash: string): Screen | undefined =>
  hash === PORTFOLIO_HASH ? MultichainScreen.PORTFOLIO_PAGE : undefined;

const clearHash = () => {
  window.history.replaceState(
    null,
    document.title,
    window.location.pathname + window.location.search,
  );
};

const open = (): void => {
  ExtensionPageUtils.openInTab(PORTFOLIO_PATH);
};

const openBuy = (): void => {
  ExtensionPageUtils.openInTab(`${PORTFOLIO_PATH}${PORTFOLIO_BUY_HASH}`);
};

const openSwap = (outgoingToken?: PortfolioSwapOutgoingToken): void => {
  const params = new URLSearchParams();
  const symbol = outgoingToken?.symbol.trim();
  if (symbol && outgoingToken) {
    params.set(SWAP_OUTGOING_SYMBOL_PARAM, symbol);
    params.set(SWAP_OUTGOING_ECOSYSTEM_PARAM, outgoingToken.ecosystem);
    const chainId = outgoingToken.chainId?.trim();
    const contractAddress = outgoingToken.contractAddress?.trim();
    if (chainId) {
      params.set(SWAP_OUTGOING_CHAIN_PARAM, chainId);
    }
    if (contractAddress) {
      params.set(SWAP_OUTGOING_CONTRACT_PARAM, contractAddress);
    }
  }

  const query = params.toString();
  ExtensionPageUtils.openInTab(
    `${PORTFOLIO_PATH}${query ? `?${query}` : ''}${PORTFOLIO_SWAP_HASH}`,
  );
};

const readSwapOutgoingToken = (
  search: string,
): PortfolioSwapOutgoingToken | null => {
  const params = new URLSearchParams(
    search.startsWith('?') ? search.slice(1) : search,
  );
  const symbol = params.get(SWAP_OUTGOING_SYMBOL_PARAM)?.trim();
  const ecosystem = params.get(SWAP_OUTGOING_ECOSYSTEM_PARAM);
  if (!symbol || (ecosystem !== 'hive' && ecosystem !== 'evm')) {
    return null;
  }

  const chainId = params.get(SWAP_OUTGOING_CHAIN_PARAM)?.trim();
  const contractAddress = params.get(SWAP_OUTGOING_CONTRACT_PARAM)?.trim();

  return {
    symbol,
    ecosystem,
    ...(chainId ? { chainId } : {}),
    ...(contractAddress ? { contractAddress } : {}),
  };
};

const clearSwapOutgoingTokenQuery = (): void => {
  const params = new URLSearchParams(window.location.search);
  params.delete(SWAP_OUTGOING_SYMBOL_PARAM);
  params.delete(SWAP_OUTGOING_ECOSYSTEM_PARAM);
  params.delete(SWAP_OUTGOING_CHAIN_PARAM);
  params.delete(SWAP_OUTGOING_CONTRACT_PARAM);
  const query = params.toString();
  window.history.replaceState(
    null,
    document.title,
    `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`,
  );
};

export const PortfolioRouteUtils = {
  PORTFOLIO_HASH,
  PORTFOLIO_BUY_HASH,
  PORTFOLIO_SWAP_HASH,
  PORTFOLIO_PATH,
  clearHash,
  open,
  openBuy,
  openSwap,
  parseHash,
  readSwapOutgoingToken,
  clearSwapOutgoingTokenQuery,
};
