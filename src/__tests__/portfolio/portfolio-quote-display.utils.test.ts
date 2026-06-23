import { PortfolioQuote } from 'src/portfolio/portfolio-api.interface';
import { PortfolioQuoteDisplayUtils } from 'src/portfolio/ui/portfolio-quote-display.utils';

const createQuote = (overrides: Partial<PortfolioQuote> = {}): PortfolioQuote => ({
  quoteId: 'lifi:abc',
  provider: 'lifi',
  providerName: 'LI.FI',
  providerLogoUrl: 'https://example.com/lifi.png',
  category: 'swap',
  routeType: 'swap',
  fromAsset: null,
  toAsset: null,
  fromAmount: '1',
  estimatedToAmount: '3200',
  comparableValue: '3200',
  providerFee: { amount: '0.001', currency: 'ETH' },
  networkFeeEstimate: { amount: '0.0005', currency: 'ETH' },
  priceImpact: null,
  warnings: [],
  expiresAt: null,
  redirectUrl: null,
  requiresRedirect: false,
  executionType: 'in_app',
  routeMetadata: null,
  transaction: null,
  ...overrides,
});

describe('PortfolioQuoteDisplayUtils', () => {
  it('builds detail rows for provider and network fees only', () => {
    const rows = PortfolioQuoteDisplayUtils.getPortfolioQuoteDetailRows(
      createQuote(),
    );

    expect(rows).toEqual([
      {
        key: 'provider-fee',
        labelKey: 'portfolio_quote_provider_fee',
        value: '0.001 ETH',
      },
      {
        key: 'network-fee',
        labelKey: 'portfolio_quote_network_fee',
        value: '0.0005 ETH',
      },
    ]);
  });

  it('omits fee rows when values are unavailable', () => {
    const rows = PortfolioQuoteDisplayUtils.getPortfolioQuoteDetailRows(
      createQuote({
        providerFee: null,
        networkFeeEstimate: null,
      }),
    );

    expect(rows).toEqual([]);
  });
});
