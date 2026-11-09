import { Screen } from '@interfaces/screen.interface';
import { MultichainScreen } from '@popup/multichain/reference-data/multichain-screen.enum';
import { ExtensionPageUtils } from '@popup/multichain/utils/extension-page.utils';

const PORTFOLIO_HASH = '#portfolio';
const PORTFOLIO_BUY_HASH = '#buy';
const PORTFOLIO_SWAP_HASH = '#swap';
const PORTFOLIO_PATH = 'portfolio.html';
const SWAP_INCOMING_SYMBOL_PARAM = 'toSymbol';
const SWAP_INCOMING_ECOSYSTEM_PARAM = 'toEcosystem';
const SWAP_INCOMING_CHAIN_PARAM = 'toChainId';
const SWAP_INCOMING_CONTRACT_PARAM = 'toContract';

/** Token the popup swap shortcut should preselect as the asset being received. */
export type PortfolioSwapIncomingToken = {
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

const openSwap = (incomingToken?: PortfolioSwapIncomingToken): void => {
  const params = new URLSearchParams();
  const symbol = incomingToken?.symbol.trim();
  if (symbol && incomingToken) {
    params.set(SWAP_INCOMING_SYMBOL_PARAM, symbol);
    params.set(SWAP_INCOMING_ECOSYSTEM_PARAM, incomingToken.ecosystem);
    const chainId = incomingToken.chainId?.trim();
    const contractAddress = incomingToken.contractAddress?.trim();
    if (chainId) {
      params.set(SWAP_INCOMING_CHAIN_PARAM, chainId);
    }
    if (contractAddress) {
      params.set(SWAP_INCOMING_CONTRACT_PARAM, contractAddress);
    }
  }

  const query = params.toString();
  ExtensionPageUtils.openInTab(
    `${PORTFOLIO_PATH}${query ? `?${query}` : ''}${PORTFOLIO_SWAP_HASH}`,
  );
};

const readSwapIncomingToken = (
  search: string,
): PortfolioSwapIncomingToken | null => {
  const params = new URLSearchParams(
    search.startsWith('?') ? search.slice(1) : search,
  );
  const symbol = params.get(SWAP_INCOMING_SYMBOL_PARAM)?.trim();
  const ecosystem = params.get(SWAP_INCOMING_ECOSYSTEM_PARAM);
  if (!symbol || (ecosystem !== 'hive' && ecosystem !== 'evm')) {
    return null;
  }

  const chainId = params.get(SWAP_INCOMING_CHAIN_PARAM)?.trim();
  const contractAddress = params.get(SWAP_INCOMING_CONTRACT_PARAM)?.trim();

  return {
    symbol,
    ecosystem,
    ...(chainId ? { chainId } : {}),
    ...(contractAddress ? { contractAddress } : {}),
  };
};

const clearSwapIncomingTokenQuery = (): void => {
  const params = new URLSearchParams(window.location.search);
  params.delete(SWAP_INCOMING_SYMBOL_PARAM);
  params.delete(SWAP_INCOMING_ECOSYSTEM_PARAM);
  params.delete(SWAP_INCOMING_CHAIN_PARAM);
  params.delete(SWAP_INCOMING_CONTRACT_PARAM);
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
  readSwapIncomingToken,
  clearSwapIncomingTokenQuery,
};
