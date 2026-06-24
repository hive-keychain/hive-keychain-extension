import { PortfolioQuote } from 'src/portfolio/portfolio-api.interface';
import { PortfolioQuoteDisplayUtils } from 'src/portfolio/ui/portfolio-quote-display.utils';

const createQuote = (overrides: Partial<PortfolioQuote> = {}): PortfolioQuote => ({
  quoteId: 'lifi:abc',
  provider: 'lifi',
  providerName: 'LI.FI',
  providerLogoUrl: 'https://example.com/lifi.png',
  category: 'swap',
  routeType: 'swap',
  fromAsset: {
    assetId: 'evm:native:ethereum',
    ecosystem: 'evm',
    symbol: 'ETH',
    name: 'Ether',
    chainId: 'ethereum',
    address: null,
    decimals: 18,
    isNative: true,
    familyId: 'eth',
    logoUrl: null,
  },
  toAsset: {
    assetId: 'evm:token:ethereum:0xabc',
    ecosystem: 'evm',
    symbol: 'USDC',
    name: 'USD Coin',
    chainId: 'ethereum',
    address: '0xabc',
    decimals: 6,
    isNative: false,
    familyId: 'usdc',
    logoUrl: null,
  },
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

  it('builds in-app confirmation fields with token amounts and provider last', () => {
    const fields = PortfolioQuoteDisplayUtils.buildPortfolioInAppConfirmationFields(
      {
        quote: createQuote(),
        fromAddress: '0xfrom',
        toAddress: '0xfrom',
      },
    );

    expect(fields).toEqual([
      {
        label: 'portfolio_confirmation_from',
        value: '1 ETH',
      },
      {
        label: 'portfolio_confirmation_to',
        value: '3200 USDC',
      },
      {
        label: 'portfolio_provider',
        value: 'LI.FI',
      },
    ]);
  });

  it('adds to account when a cross-ecosystem recipient is required', () => {
    const fields = PortfolioQuoteDisplayUtils.buildPortfolioInAppConfirmationFields(
      {
        quote: createQuote({
          fromAsset: {
            assetId: 'hive:native:hive',
            ecosystem: 'hive',
            symbol: 'HIVE',
            name: 'Hive',
            chainId: 'hive',
            address: null,
            decimals: 3,
            isNative: true,
            familyId: 'hive',
            logoUrl: null,
          },
          toAsset: {
            assetId: 'evm:native:ethereum',
            ecosystem: 'evm',
            symbol: 'ETH',
            name: 'Ether',
            chainId: 'ethereum',
            address: null,
            decimals: 18,
            isNative: true,
            familyId: 'eth',
            logoUrl: null,
          },
        }),
        fromAddress: 'alice',
        toAddress: '0xrecipient',
      },
    );

    expect(fields).toEqual([
      {
        label: 'portfolio_confirmation_from',
        value: '1 HIVE',
      },
      {
        label: 'portfolio_confirmation_to',
        value: '3200 ETH',
      },
      {
        label: 'portfolio_confirmation_to_account',
        value: '0xrecipient',
      },
      {
        label: 'portfolio_provider',
        value: 'LI.FI',
      },
    ]);
  });
});
