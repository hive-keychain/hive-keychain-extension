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

  it('opens portfolio swap with the incoming token in the query', () => {
    PortfolioRouteUtils.openSwap({
      symbol: 'USDC',
      ecosystem: 'evm',
      chainId: '0x1',
      contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    });

    expect(ExtensionPageUtils.openInTab).toHaveBeenCalledWith(
      'portfolio.html?toSymbol=USDC&toEcosystem=evm&toChainId=0x1&toContract=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48#swap',
    );
  });

  it('reads and clears the incoming swap token query', () => {
    const originalUrl = window.location.href;
    window.history.replaceState(
      null,
      document.title,
      '/portfolio.html?toSymbol=HIVE&toEcosystem=hive&kept=1#swap',
    );

    expect(
      PortfolioRouteUtils.readSwapIncomingToken(window.location.search),
    ).toEqual({
      symbol: 'HIVE',
      ecosystem: 'hive',
    });

    PortfolioRouteUtils.clearSwapIncomingTokenQuery();

    expect(window.location.search).toBe('?kept=1');
    expect(window.location.hash).toBe('#swap');
    expect(
      PortfolioRouteUtils.readSwapIncomingToken('?toEcosystem=hive'),
    ).toBeNull();
    window.history.replaceState(null, document.title, originalUrl);
  });
});
