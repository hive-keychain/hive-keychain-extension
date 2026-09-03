import { render, screen } from '@testing-library/react';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import React from 'react';
import { ConfirmationPageFieldType } from 'src/common-ui/confirmation-page/confirmation-page.interface';
import {
  PortfolioQuote,
  PortfolioQuoteKyc,
} from 'src/portfolio/portfolio-api.interface';
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
  paymentMethod: null,
  kyc: 'never',
  ...overrides,
});

const expectProviderField = (
  field: ReturnType<
    typeof PortfolioQuoteDisplayUtils.buildPortfolioInAppConfirmationFields
  >[number],
  providerLabel: string,
  providerLogoUrl: string | null,
  kyc: PortfolioQuoteKyc = 'never',
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
  const chip = screen.getByTestId('portfolio-kyc-chip');
  expect(chip.getAttribute('data-kyc')).toBe(kyc);
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

  it('shows an undisclosed provider fee when the fee is unavailable', () => {
    const rows = PortfolioQuoteDisplayUtils.getPortfolioQuoteDetailRows(
      createQuote({
        providerFee: null,
        networkFeeEstimate: null,
      }),
    );

    expect(rows).toEqual([
      {
        key: 'provider-fee',
        labelKey: 'portfolio_quote_provider_fee',
        valueKey: 'portfolio_quote_provider_fee_undisclosed',
      },
    ]);
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

    expect(fields[0]).toEqual({
      label: 'portfolio_confirmation_account',
      value: 'alice',
      tag: ConfirmationPageFieldType.USERNAME,
    });
    expect(fields[1]).toEqual(
      expect.objectContaining({
        label: 'portfolio_confirmation_from',
        tokenSymbol: 'HIVE',
        tokenNetwork: 'Hive',
        tokenNetworkLogoUrl: '/assets/images/wallet/hive-logo.svg',
      }),
    );
    expect(fields[2]).toEqual(
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
        label: 'portfolio_confirmation_account',
        value: 'alice',
        tag: ConfirmationPageFieldType.USERNAME,
      },
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

  it('shows the signing Hive account and Keychain Swap provider account', () => {
    const fields = PortfolioQuoteDisplayUtils.buildPortfolioInAppConfirmationFields(
      {
        quote: createQuote({
          quoteId: 'keychain_swap:1',
          provider: 'keychain_swap',
          providerName: 'Keychain Swap',
          providerLogoUrl: 'https://example.com/keychain-swap.png',
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
            assetId: 'hive:token:hive:SWAP.HIVE',
            ecosystem: 'hive_engine',
            symbol: 'SWAP.HIVE',
            name: 'SWAP.HIVE',
            chainId: 'hive',
            address: null,
            decimals: 8,
            isNative: false,
            familyId: 'swap.hive',
            logoUrl: null,
            priceUsd: 0,
            rankScore: 0,
          },
          fromAmount: '1',
          estimatedToAmount: '0.5',
          comparableValue: '0.5',
          transaction: {
            method: 'active',
            operations: [
              [
                'transfer',
                {
                  from: 'alice',
                  to: 'keychain.swap',
                  amount: '1.000 HIVE',
                  memo: 'estimate-123',
                },
              ],
            ],
            expiration: '2026-06-24T12:10:00',
            ref_block_num: 123,
            ref_block_prefix: 456,
            extensions: [],
          },
        }),
        fromAddress: 'alice',
        toAddress: 'alice',
      },
    );

    expect(fields.slice(0, -1)).toEqual([
      {
        label: 'portfolio_confirmation_account',
        value: 'alice',
        tag: ConfirmationPageFieldType.USERNAME,
      },
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
        value: '0.5',
        tag: ConfirmationPageFieldType.AMOUNT,
        tokenSymbol: 'SWAP.HIVE',
        tokenLogoUrl: undefined,
        tokenNetwork: 'Hive Engine',
        tokenNetworkLogoUrl: '/assets/images/wallet/hive-engine.svg',
      },
      {
        label: 'portfolio_confirmation_provider_account',
        value: 'keychain.swap',
        tag: ConfirmationPageFieldType.USERNAME,
      },
    ]);
    expectProviderField(
      fields[fields.length - 1],
      'Keychain Swap',
      'https://example.com/keychain-swap.png',
    );
  });

  it('reads the Keychain Swap provider account from a Hive Engine custom_json', () => {
    const fields = PortfolioQuoteDisplayUtils.buildPortfolioInAppConfirmationFields(
      {
        quote: createQuote({
          quoteId: 'keychain_swap:2',
          provider: 'keychain_swap',
          providerName: 'Keychain Swap',
          providerLogoUrl: null,
          fromAsset: {
            assetId: 'hive:token:hive:DEC',
            ecosystem: 'hive_engine',
            symbol: 'DEC',
            name: 'Dark Energy Crystals',
            chainId: 'hive',
            address: null,
            decimals: 3,
            isNative: false,
            familyId: 'dec',
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
          fromAmount: '100',
          estimatedToAmount: '1',
          comparableValue: '1',
        }),
        fromAddress: 'alice',
        toAddress: 'alice',
        hiveTransaction: {
          method: 'active',
          operations: [
            [
              'custom_json',
              {
                id: 'ssc-mainnet-hive',
                json: JSON.stringify({
                  contractName: 'tokens',
                  contractAction: 'transfer',
                  contractPayload: {
                    symbol: 'DEC',
                    to: '@keychain.swap',
                    quantity: '100',
                    memo: 'estimate-123',
                  },
                }),
                required_auths: ['alice'],
                required_posting_auths: [],
              },
            ],
          ],
          expiration: '2026-06-24T12:10:00',
          ref_block_num: 123,
          ref_block_prefix: 456,
          extensions: [],
        },
      },
    );

    expect(fields).toEqual(
      expect.arrayContaining([
        {
          label: 'portfolio_confirmation_account',
          value: 'alice',
          tag: ConfirmationPageFieldType.USERNAME,
        },
        {
          label: 'portfolio_confirmation_provider_account',
          value: 'keychain.swap',
          tag: ConfirmationPageFieldType.USERNAME,
        },
      ]),
    );
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

  it('shows a KYC chip on the confirmation provider', () => {
    const fields = PortfolioQuoteDisplayUtils.buildPortfolioInAppConfirmationFields(
      {
        quote: createQuote({ kyc: 'typically_required' }),
        fromAddress: '0xfrom',
        toAddress: '0xfrom',
      },
    );

    expectProviderField(
      fields[fields.length - 1],
      'LI.FI',
      'https://example.com/lifi.png',
      'typically_required',
    );
  });
});
