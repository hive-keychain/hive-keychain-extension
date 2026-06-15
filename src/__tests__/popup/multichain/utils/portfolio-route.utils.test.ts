import { MultichainScreen } from '@popup/multichain/reference-data/multichain-screen.enum';
import { DetachedExtensionTabUtils } from '@popup/multichain/utils/detached-extension-tab.utils';
import { ExtensionSurfaceUtils } from '@popup/multichain/utils/extension-surface.utils';
import { PortfolioRouteUtils } from '@popup/multichain/utils/portfolio-route.utils';

jest.mock('@popup/multichain/utils/detached-extension-tab.utils', () => ({
  DetachedExtensionTabUtils: {
    openDetachedExtensionTab: jest.fn(),
  },
}));

jest.mock('@popup/multichain/utils/extension-surface.utils', () => ({
  ExtensionSurfaceUtils: {
    isSidePanelPage: jest.fn(),
    isDetachedTab: jest.fn(),
  },
}));

describe('PortfolioRouteUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ExtensionSurfaceUtils.isSidePanelPage as jest.Mock).mockReturnValue(false);
    (ExtensionSurfaceUtils.isDetachedTab as jest.Mock).mockReturnValue(false);
  });

  it('parses only the portfolio startup hash', () => {
    expect(PortfolioRouteUtils.parseHash('#portfolio')).toBe(
      MultichainScreen.PORTFOLIO_PAGE,
    );
    expect(PortfolioRouteUtils.parseHash('#other')).toBeUndefined();
  });

  it('navigates directly when already in the detached extension tab', async () => {
    const navigate = jest.fn();
    (ExtensionSurfaceUtils.isDetachedTab as jest.Mock).mockReturnValue(true);

    await PortfolioRouteUtils.open(navigate);

    expect(navigate).toHaveBeenCalled();
    expect(
      DetachedExtensionTabUtils.openDetachedExtensionTab,
    ).not.toHaveBeenCalled();
  });

  it('opens the portfolio hash in a detached tab from the side panel', async () => {
    const navigate = jest.fn();
    (ExtensionSurfaceUtils.isSidePanelPage as jest.Mock).mockReturnValue(true);

    await PortfolioRouteUtils.open(navigate);

    expect(navigate).not.toHaveBeenCalled();
    expect(
      DetachedExtensionTabUtils.openDetachedExtensionTab,
    ).toHaveBeenCalledWith('#portfolio');
  });

  it('opens the portfolio hash in a detached tab from other surfaces', async () => {
    const navigate = jest.fn();

    await PortfolioRouteUtils.open(navigate);

    expect(navigate).not.toHaveBeenCalled();
    expect(
      DetachedExtensionTabUtils.openDetachedExtensionTab,
    ).toHaveBeenCalledWith('#portfolio');
  });
});
