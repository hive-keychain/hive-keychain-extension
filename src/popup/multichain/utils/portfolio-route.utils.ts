import { Screen } from '@interfaces/screen.interface';
import { MultichainScreen } from '@popup/multichain/reference-data/multichain-screen.enum';
import { ExtensionPageUtils } from '@popup/multichain/utils/extension-page.utils';

const PORTFOLIO_HASH = '#portfolio';
const PORTFOLIO_PATH = 'portfolio.html';

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

export const PortfolioRouteUtils = {
  PORTFOLIO_HASH,
  PORTFOLIO_PATH,
  clearHash,
  open,
  parseHash,
};
