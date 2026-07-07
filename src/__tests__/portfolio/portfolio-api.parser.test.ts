import { PortfolioApiParser } from 'src/portfolio/portfolio-api.parser';

describe('PortfolioApiParser', () => {
  it('parses canonical assets and chains from the assets payload', () => {
    expect(
      PortfolioApiParser.parsePortfolioAssetsResponse({
        assets: [
          {
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
        ],
        chains: {
          ethereum: {
            id: 'ethereum',
            name: 'Ethereum',
            logoUrl: 'https://example.com/ethereum.svg',
            numericChainId: 1,
          },
        },
      }),
    ).toEqual({
      assets: [
        {
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
      ],
      chains: {
        ethereum: {
          id: 'ethereum',
          name: 'Ethereum',
          logoUrl: 'https://example.com/ethereum.svg',
          numericChainId: 1,
        },
      },
    });
  });

  it('parses external destination assets from the assets payload', () => {
    expect(
      PortfolioApiParser.parsePortfolioAssetsResponse({
        assets: [
          {
            assetId: 'external:native:ripple',
            ecosystem: 'external',
            symbol: 'XRP',
            name: 'XRP',
            chainId: 'ripple',
            address: null,
            decimals: 6,
            isNative: true,
            familyId: 'external:native:xrp',
            logoUrl: null,
          },
        ],
        chains: {
          ripple: {
            id: 'ripple',
            name: 'Ripple',
            logoUrl: 'https://example.com/ripple.svg',
            numericChainId: null,
          },
        },
      }),
    ).toEqual({
      assets: [
        expect.objectContaining({
          assetId: 'external:native:ripple',
          ecosystem: 'external',
          symbol: 'XRP',
        }),
      ],
      chains: {
        ripple: {
          id: 'ripple',
          name: 'Ripple',
          logoUrl: 'https://example.com/ripple.svg',
          numericChainId: null,
        },
      },
    });
  });

  it('parses utxo destination assets from the assets payload', () => {
    expect(
      PortfolioApiParser.parsePortfolioAssetsResponse({
        assets: [
          {
            assetId: 'utxo:native:bitcoin',
            ecosystem: 'utxo',
            symbol: 'BTC',
            name: 'Bitcoin',
            chainId: 'bitcoin',
            address: null,
            decimals: 8,
            isNative: true,
            familyId: 'utxo:native:btc',
            logoUrl: 'https://example.com/btc.png',
          },
        ],
        chains: {
          bitcoin: {
            id: 'bitcoin',
            name: 'Bitcoin',
            logoUrl: 'https://example.com/bitcoin.svg',
            numericChainId: null,
          },
        },
      }),
    ).toEqual({
      assets: [
        expect.objectContaining({
          assetId: 'utxo:native:bitcoin',
          ecosystem: 'utxo',
          symbol: 'BTC',
        }),
      ],
      chains: {
        bitcoin: {
          id: 'bitcoin',
          name: 'Bitcoin',
          logoUrl: 'https://example.com/bitcoin.svg',
          numericChainId: null,
        },
      },
    });
  });

  it('parses quote responses with provider display and fee metadata', () => {
    expect(
      PortfolioApiParser.parsePortfolioQuoteResponse({
        request: {
          mode: 'swap',
          routeType: 'swap',
          fromAssetId: 'evm:native:ethereum',
          toAssetId: 'evm:token:ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          fiatCurrency: null,
          paymentMethod: null,
          countryCode: null,
          sourceChainId: 'ethereum',
          destinationChainId: null,
        },
        quotes: [
          {
            quoteId: 'lifi:abc',
            provider: {
              id: 'lifi',
              name: 'LI.FI',
              logo: 'https://example.com/lifi.png',
              fee: { amount: '0.001', currency: 'ETH' },
            },
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
            toAsset: null,
            fromAmount: '1',
            estimatedToAmount: '3200',
            comparableValue: '3200',
            networkFeeEstimate: { amount: '0.0005', currency: 'ETH' },
            priceImpact: '0.12',
            warnings: ['High slippage'],
            expiresAt: '2026-06-23T12:05:00.000Z',
            redirectUrl: null,
            requiresRedirect: false,
            executionType: 'in_app',
            routeMetadata: { tool: '1inch' },
            approval: {
              spender: '0x1111111254eeb25477b68fb85ed929f73a960582',
              amount: '1000000000000000000',
            },
            transaction: {
              from: '0xabc',
              to: '0xdef',
              value: '0',
              data: '0x1234',
              chainId: 1,
              gasLimit: null,
              gasPrice: null,
              maxFeePerGas: null,
              maxPriorityFeePerGas: null,
            },
          },
        ],
      }),
    ).toEqual({
      request: {
        mode: 'swap',
        routeType: 'swap',
        fromAssetId: 'evm:native:ethereum',
        toAssetId: 'evm:token:ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        fiatCurrency: null,
        paymentMethod: null,
        countryCode: null,
        sourceChainId: 'ethereum',
        destinationChainId: null,
      },
      quotes: [
        expect.objectContaining({
          quoteId: 'lifi:abc',
          provider: 'lifi',
          providerName: 'LI.FI',
          providerLogoUrl: 'https://example.com/lifi.png',
          comparableValue: '3200',
          providerFee: { amount: '0.001', currency: 'ETH' },
          networkFeeEstimate: { amount: '0.0005', currency: 'ETH' },
          routeMetadata: { tool: '1inch' },
          approval: {
            spender: '0x1111111254eeb25477b68fb85ed929f73a960582',
            amount: '1000000000000000000',
          },
          transaction: expect.objectContaining({
            chainId: 1,
            to: '0xdef',
          }),
        }),
      ],
    });
  });

  it('defaults approval to null when absent or incomplete', () => {
    const response = PortfolioApiParser.parsePortfolioQuoteResponse({
      request: { mode: 'swap' },
      quotes: [
        {
          quoteId: 'lifi:no-approval',
          provider: { id: 'lifi', name: 'LI.FI' },
          fromAmount: '1',
          estimatedToAmount: '0.99',
          approval: { spender: '0xabc' },
        },
      ],
    });

    expect(response.quotes[0]?.approval).toBeNull();
  });

  it('falls back comparableValue to estimatedToAmount when omitted', () => {
    const response = PortfolioApiParser.parsePortfolioQuoteResponse({
      request: { mode: 'swap' },
      quotes: [
        {
          quoteId: 'simpleswap:1',
          provider: { id: 'simpleswap', name: 'SimpleSwap' },
          fromAmount: '1',
          estimatedToAmount: '99.5',
        },
      ],
    });

    expect(response.quotes[0]?.comparableValue).toBe('99.5');
  });

  it('parses available assets and fiat ramp option payloads', () => {
    expect(
      PortfolioApiParser.parsePortfolioAvailableAssetsResponse({
        mode: 'bridge',
        direction: 'to',
        sourceAssetId: 'evm:native:ethereum',
        assets: [{ assetId: 'evm:native:polygon', ecosystem: 'evm', symbol: 'MATIC', name: 'Polygon' }],
      }),
    ).toEqual({
      mode: 'bridge',
      direction: 'to',
      sourceAssetId: 'evm:native:ethereum',
      assets: [
        expect.objectContaining({
          assetId: 'evm:native:polygon',
          familyId: '',
        }),
      ],
      chains: {},
    });

    expect(
      PortfolioApiParser.parsePortfolioFiatRampOptions({
        fiatCurrencies: ['USD', 'EUR'],
        paymentMethods: [{ id: 'card', label: 'Credit / Debit Card' }],
      }),
    ).toEqual({
      fiatCurrencies: ['USD', 'EUR'],
      paymentMethods: [{ id: 'card', label: 'Credit / Debit Card' }],
    });
  });

  it('parses execution, history, hive transactions, and redirect payloads', () => {
    expect(
      PortfolioApiParser.parsePortfolioExecution({
        id: 'exec-1',
        status: 'created',
        mode: 'swap',
        provider: 'lifi',
        providerReferenceId: null,
        fromAssetId: 'evm:native:ethereum',
        toAssetId: 'evm:token:ethereum:0xabc',
        fromAmount: '1',
        toAmount: '3200',
        fromAddress: '0xfrom',
        toAddress: '0xto',
        redirectUrl: 'https://global.transak.com?sessionId=abc',
        transaction: {
          to: '0xdef',
          data: '0x1234',
          value: '0',
          chainId: 1,
        },
        submittedAt: '2026-06-23T12:00:00.000Z',
        updatedAt: '2026-06-23T12:00:00.000Z',
      }),
    ).toEqual(
      expect.objectContaining({
        id: 'exec-1',
        provider: 'lifi',
        providerReferenceId: null,
        fromAddress: '0xfrom',
        redirectUrl: 'https://global.transak.com?sessionId=abc',
        transaction: expect.objectContaining({
          chainId: 1,
          to: '0xdef',
        }),
      }),
    );

    expect(
      PortfolioApiParser.parsePortfolioHistoryResponse({
        page: 2,
        pageSize: 20,
        hasMore: true,
        items: [
          {
            id: 'exec-1',
            status: 'submitted',
            displayStatus: 'submitted',
            mode: 'swap',
            provider: {
              id: 'lifi',
              name: 'LI.FI',
              logo: 'https://example.com/lifi.png',
            },
            executionType: 'in_app',
            txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            providerStatus: 'confirming',
            lastProviderStatusRefreshAt: '2026-06-23T12:04:00.000Z',
          },
        ],
      }),
    ).toEqual(
      expect.objectContaining({
        page: 2,
        hasMore: true,
        items: [
          expect.objectContaining({
            displayStatus: 'submitted',
            executionType: 'in_app',
            provider: 'lifi',
            providerName: 'LI.FI',
            providerLogoUrl: 'https://example.com/lifi.png',
            providerStatus: 'confirming',
            lastProviderStatusRefreshAt: '2026-06-23T12:04:00.000Z',
          }),
        ],
      }),
    );

    const hiveQuote = PortfolioApiParser.parsePortfolioQuoteResponse({
      request: { mode: 'swap' },
      quotes: [
        {
          quoteId: 'keychain_swap:1',
          provider: { id: 'keychain_swap', name: 'Keychain Swap' },
          fromAmount: '1',
          estimatedToAmount: '0.5',
          executionType: 'in_app',
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
        },
      ],
    });

    expect(hiveQuote.quotes[0]?.transaction).toEqual(
      expect.objectContaining({
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
      }),
    );
  });

  it('parses supported fiat ramp countries and normalizes country codes', () => {
    expect(
      PortfolioApiParser.parsePortfolioFiatRampCountriesResponse({
        countries: [
          { countryCode: 'de', name: 'Germany' },
          { countryCode: 'US', name: null },
          { countryCode: 'USA', name: 'Invalid' },
          { name: 'Missing code' },
          'not-an-object',
        ],
      }),
    ).toEqual({
      countries: [
        { countryCode: 'DE', name: 'Germany' },
        { countryCode: 'US', name: null },
      ],
    });
  });

  it('returns an empty country list for malformed payloads', () => {
    expect(
      PortfolioApiParser.parsePortfolioFiatRampCountriesResponse(null),
    ).toEqual({ countries: [] });
    expect(
      PortfolioApiParser.parsePortfolioFiatRampCountriesResponse({}),
    ).toEqual({ countries: [] });
  });
});
