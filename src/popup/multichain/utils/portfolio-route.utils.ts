import { Screen } from '@interfaces/screen.interface';
import { MultichainScreen } from '@popup/multichain/reference-data/multichain-screen.enum';
import { DetachedExtensionTabUtils } from '@popup/multichain/utils/detached-extension-tab.utils';
import { ExtensionSurfaceUtils } from '@popup/multichain/utils/extension-surface.utils';

const PORTFOLIO_HASH = '#portfolio';

const parseHash = (hash: string): Screen | undefined =>
  hash === PORTFOLIO_HASH ? MultichainScreen.PORTFOLIO_PAGE : undefined;

const clearHash = () => {
  window.history.replaceState(
    null,
    document.title,
    window.location.pathname + window.location.search,
  );
};

const open = async (navigateToPortfolio: () => void): Promise<void> => {
  if (ExtensionSurfaceUtils.isDetachedTab()) {
    navigateToPortfolio();
    return;
  }

  DetachedExtensionTabUtils.openDetachedExtensionTab(PORTFOLIO_HASH);
};

export const PortfolioRouteUtils = {
  PORTFOLIO_HASH,
  clearHash,
  open,
  parseHash,
};
