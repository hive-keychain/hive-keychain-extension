import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { ConfirmationPageFieldType } from 'src/common-ui/confirmation-page/confirmation-page.interface';
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

  it('builds in-app confirmation fields with tagged token amounts and provider last', () => {
    const fields = PortfolioQuoteDisplayUtils.buildPortfolioInAppConfirmationFields(
      {
        quote: createQuote({
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
            logoUrl: 'https://example.com/eth.png',
          },
        }),
        fromAddress: '0xfrom',
        toAddress: '0xfrom',
      },
    );

    expect(fields).toEqual([
      {
        label: 'portfolio_confirmation_from',
        value: '1',
        tag: ConfirmationPageFieldType.AMOUNT,
        tokenSymbol: 'ETH',
        tokenLogoUrl: 'https://example.com/eth.png',
        tokenNetwork: 'ethereum',
        tokenNetworkLogoUrl: undefined,
      },
      {
        label: 'portfolio_confirmation_to',
        value: '3200',
        tag: ConfirmationPageFieldType.AMOUNT,
        tokenSymbol: 'USDC',
        tokenLogoUrl: undefined,
        tokenNetwork: 'ethereum',
        tokenNetworkLogoUrl: undefined,
      },
      {
        label: 'portfolio_provider',
        value: 'LI.FI',
      },
    ]);
  });

  it('includes resolved chain badge data on from/to amount fields', () => {
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
            logoUrl: 'https://example.com/eth.png',
          },
        }),
        fromAddress: 'alice',
        toAddress: '0xfrom',
        portfolioChains: {
          ethereum: {
            id: 'ethereum',
            name: 'Ethereum',
            logoUrl: 'https://example.com/ethereum.png',
            numericChainId: 1,
          },
        },
      },
    );

    expect(fields[0]).toEqual(
      expect.objectContaining({
        label: 'portfolio_confirmation_from',
        tokenSymbol: 'HIVE',
        tokenNetwork: 'Hive',
        tokenNetworkLogoUrl: '/assets/images/wallet/hive-logo.svg',
      }),
    );
    expect(fields[1]).toEqual(
      expect.objectContaining({
        label: 'portfolio_confirmation_to',
        tokenSymbol: 'ETH',
        tokenNetwork: 'Ethereum',
        tokenNetworkLogoUrl: 'https://example.com/ethereum.png',
      }),
    );
  });

  it('formats the recipient as a shortened address for an evm destination', () => {
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
        toAddress: '0x1234567890abcdef1234567890abcdef12345678',
      },
    );

    expect(fields).toEqual([
      {
        label: 'portfolio_confirmation_from',
        value: '1',
        tag: ConfirmationPageFieldType.AMOUNT,
        tokenSymbol: 'HIVE',
        tokenLogoUrl: undefined,
        tokenNetwork: 'Hive',
        tokenNetworkLogoUrl: '/assets/images/wallet/hive-logo.svg',
      },
      {
        label: 'portfolio_confirmation_to',
        value: '3200',
        tag: ConfirmationPageFieldType.AMOUNT,
        tokenSymbol: 'ETH',
        tokenLogoUrl: undefined,
        tokenNetwork: 'ethereum',
        tokenNetworkLogoUrl: undefined,
      },
      {
        label: 'portfolio_confirmation_to_account',
        value: EvmFormatUtils.formatAddress(
          '0x1234567890abcdef1234567890abcdef12345678',
        ),
      },
      {
        label: 'portfolio_provider',
        value: 'LI.FI',
      },
    ]);
  });

  it('tags the recipient as a username for a hive destination', () => {
    const fields = PortfolioQuoteDisplayUtils.buildPortfolioInAppConfirmationFields(
      {
        quote: createQuote({
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
        }),
        fromAddress: '0xfrom',
        toAddress: 'bob',
      },
    );

    expect(fields).toEqual([
      {
        label: 'portfolio_confirmation_from',
        value: '1',
        tag: ConfirmationPageFieldType.AMOUNT,
        tokenSymbol: 'ETH',
        tokenLogoUrl: undefined,
        tokenNetwork: 'ethereum',
        tokenNetworkLogoUrl: undefined,
      },
      {
        label: 'portfolio_confirmation_to',
        value: '3200',
        tag: ConfirmationPageFieldType.AMOUNT,
        tokenSymbol: 'HIVE',
        tokenLogoUrl: undefined,
        tokenNetwork: 'Hive',
        tokenNetworkLogoUrl: '/assets/images/wallet/hive-logo.svg',
      },
      {
        label: 'portfolio_confirmation_to_account',
        value: 'bob',
        tag: ConfirmationPageFieldType.USERNAME,
      },
      {
        label: 'portfolio_provider',
        value: 'LI.FI',
      },
    ]);
  });
});
