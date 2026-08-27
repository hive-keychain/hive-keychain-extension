import { MultichainScreen } from '@popup/multichain/reference-data/multichain-screen.enum';
import { ExtensionPageUtils } from '@popup/multichain/utils/extension-page.utils';
import { PortfolioRouteUtils } from '@popup/multichain/utils/portfolio-route.utils';

jest.mock('@popup/multichain/utils/extension-page.utils', () => ({
  ExtensionPageUtils: {
    openInTab: jest.fn(),
  },
}));

describe('PortfolioRouteUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps parsing the legacy portfolio startup hash', () => {
    expect(PortfolioRouteUtils.parseHash('#portfolio')).toBe(
      MultichainScreen.PORTFOLIO_PAGE,
    );
    expect(PortfolioRouteUtils.parseHash('#other')).toBeUndefined();
  });

  it('opens the dedicated portfolio page', () => {
    PortfolioRouteUtils.open();

    expect(ExtensionPageUtils.openInTab).toHaveBeenCalledWith('portfolio.html');
  });

  it('opens the portfolio buy page', () => {
    PortfolioRouteUtils.openBuy();

    expect(ExtensionPageUtils.openInTab).toHaveBeenCalledWith(
      'portfolio.html#buy',
    );
  });

  it('opens the portfolio swap page', () => {
    PortfolioRouteUtils.openSwap();

    expect(ExtensionPageUtils.openInTab).toHaveBeenCalledWith(
      'portfolio.html#swap',
    );
  });
});
