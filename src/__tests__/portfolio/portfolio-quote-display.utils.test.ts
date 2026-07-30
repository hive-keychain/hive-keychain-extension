import { render, screen } from '@testing-library/react';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import React from 'react';
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
    priceUsd: 0,
    rankScore: 0,
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
    priceUsd: 0,
    rankScore: 0,
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

const expectProviderField = (
  field: ReturnType<
    typeof PortfolioQuoteDisplayUtils.buildPortfolioInAppConfirmationFields
  >[number],
  providerLabel: string,
  providerLogoUrl: string | null,
) => {
  expect(field.label).toBe('portfolio_provider');
  expect(React.isValidElement(field.value)).toBe(true);
  render(field.value as React.ReactElement);
  expect(screen.getByText(providerLabel)).toBeTruthy();
  if (providerLogoUrl) {
    expect(screen.getByRole('img').getAttribute('src')).toBe(providerLogoUrl);
  } else {
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText(providerLabel.slice(0, 1))).toBeTruthy();
  }
};

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

  it('uppercases fee currency symbols in quote detail rows', () => {
    const rows = PortfolioQuoteDisplayUtils.getPortfolioQuoteDetailRows(
      createQuote({
        providerFee: { amount: '3.538', currency: 'hive' },
        networkFeeEstimate: { amount: '7.889', currency: 'hive' },
      }),
    );

    expect(rows).toEqual([
      {
        key: 'provider-fee',
        labelKey: 'portfolio_quote_provider_fee',
        value: '3.538 HIVE',
      },
      {
        key: 'network-fee',
        labelKey: 'portfolio_quote_network_fee',
        value: '7.889 HIVE',
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
            priceUsd: 0,
            rankScore: 0,
          },
        }),
        fromAddress: '0xfrom',
        toAddress: '0xfrom',
      },
    );

    expect(fields.slice(0, -1)).toEqual([
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
    ]);
    expectProviderField(fields[fields.length - 1], 'LI.FI', 'https://example.com/lifi.png');
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
            priceUsd: 0,
            rankScore: 0,
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
            priceUsd: 0,
            rankScore: 0,
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
            rankScore: 0,
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
            priceUsd: 0,
            rankScore: 0,
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
            priceUsd: 0,
            rankScore: 0,
          },
        }),
        fromAddress: 'alice',
        toAddress: '0x1234567890abcdef1234567890abcdef12345678',
      },
    );

    expect(fields.slice(0, -1)).toEqual([
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
    ]);
    expectProviderField(fields[fields.length - 1], 'LI.FI', 'https://example.com/lifi.png');
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
            priceUsd: 0,
            rankScore: 0,
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
            priceUsd: 0,
            rankScore: 0,
          },
        }),
        fromAddress: '0xfrom',
        toAddress: 'bob',
      },
    );

    expect(fields.slice(0, -1)).toEqual([
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
    ]);
    expectProviderField(fields[fields.length - 1], 'LI.FI', 'https://example.com/lifi.png');
  });

  it('falls back to a letter avatar when the provider logo is missing', () => {
    const fields = PortfolioQuoteDisplayUtils.buildPortfolioInAppConfirmationFields(
      {
        quote: createQuote({
          providerLogoUrl: null,
        }),
        fromAddress: '0xfrom',
        toAddress: '0xfrom',
      },
    );

    expectProviderField(fields[fields.length - 1], 'LI.FI', null);
  });
});
