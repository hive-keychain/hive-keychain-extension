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

  it('opens portfolio swap with the outgoing token in the query', () => {
    PortfolioRouteUtils.openSwap({
      symbol: 'USDC',
      ecosystem: 'evm',
      chainId: '0x1',
      contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    });

    expect(ExtensionPageUtils.openInTab).toHaveBeenCalledWith(
      'portfolio.html?fromSymbol=USDC&fromEcosystem=evm&fromChainId=0x1&fromContract=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48#swap',
    );
  });

  it('reads and clears the outgoing swap token query', () => {
    const originalUrl = window.location.href;
    window.history.replaceState(
      null,
      document.title,
      '/portfolio.html?fromSymbol=HIVE&fromEcosystem=hive&kept=1#swap',
    );

    expect(
      PortfolioRouteUtils.readSwapOutgoingToken(window.location.search),
    ).toEqual({
      symbol: 'HIVE',
      ecosystem: 'hive',
    });

    PortfolioRouteUtils.clearSwapOutgoingTokenQuery();

    expect(window.location.search).toBe('?kept=1');
    expect(window.location.hash).toBe('#swap');
    expect(
      PortfolioRouteUtils.readSwapOutgoingToken('?fromEcosystem=hive'),
    ).toBeNull();
    window.history.replaceState(null, document.title, originalUrl);
  });
});
