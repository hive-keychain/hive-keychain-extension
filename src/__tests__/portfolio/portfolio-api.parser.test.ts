import { PortfolioApiParser } from 'src/portfolio/portfolio-api.parser';

describe('PortfolioApiParser', () => {
  it('parses canonical assets from the assets payload', () => {
    expect(
      PortfolioApiParser.parsePortfolioAssets({
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
      }),
    ).toEqual([
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
    ]);
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
            toAsset: null,
            fromAmount: '1',
            estimatedToAmount: '3200',
            comparableValue: '3200',
            providerFee: { amount: '0.001', currency: 'ETH' },
            networkFeeEstimate: { amount: '0.0005', currency: 'ETH' },
            priceImpact: '0.12',
            warnings: ['High slippage'],
            expiresAt: '2026-06-23T12:05:00.000Z',
            redirectUrl: null,
            requiresRedirect: false,
            executionType: 'in_app',
            routeMetadata: { tool: '1inch' },
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
          providerName: 'LI.FI',
          comparableValue: '3200',
          providerFee: { amount: '0.001', currency: 'ETH' },
          networkFeeEstimate: { amount: '0.0005', currency: 'ETH' },
          routeMetadata: { tool: '1inch' },
          transaction: expect.objectContaining({
            chainId: 1,
            to: '0xdef',
          }),
        }),
      ],
    });
  });

  it('falls back comparableValue to estimatedToAmount when omitted', () => {
    const response = PortfolioApiParser.parsePortfolioQuoteResponse({
      request: { mode: 'swap' },
      quotes: [
        {
          quoteId: 'simpleswap:1',
          provider: 'simpleswap',
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
        providerReferenceId: null,
        fromAddress: '0xfrom',
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
            provider: 'lifi',
            executionType: 'in_app',
            txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
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
          }),
        ],
      }),
    );

    const hiveQuote = PortfolioApiParser.parsePortfolioQuoteResponse({
      request: { mode: 'swap' },
      quotes: [
        {
          quoteId: 'keychain_swap:1',
          provider: 'keychain_swap',
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

    expect(
      PortfolioApiParser.parsePortfolioRedirectOrder({
        executionId: 'exec-1',
        provider: 'stealthex',
        providerReferenceId: 'ref-1',
        redirectUrl: 'https://provider.example/order',
        deposit: {
          address: 'deposit-address',
          expectedAmount: '1',
          symbol: 'ETH',
          network: 'ethereum',
        },
      }),
    ).toEqual({
      executionId: 'exec-1',
      provider: 'stealthex',
      providerReferenceId: 'ref-1',
      redirectUrl: 'https://provider.example/order',
      deposit: {
        address: 'deposit-address',
        expectedAmount: '1',
        symbol: 'ETH',
        network: 'ethereum',
      },
    });
  });
});
