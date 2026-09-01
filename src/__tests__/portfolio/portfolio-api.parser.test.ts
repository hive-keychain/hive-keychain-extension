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
            priceUsd: 3245.67,
            rankScore: 2850,
          },
        ],
        chains: {
          ethereum: {
            id: 'ethereum',
            name: 'Ethereum',
            logoUrl: 'https://example.com/ethereum.svg',
            numericChainId: 1,
            rankScore: 0,
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
          priceUsd: 3245.67,
          rankScore: 2850,
        },
      ],
      chains: {
        ethereum: {
          id: 'ethereum',
          name: 'Ethereum',
          logoUrl: 'https://example.com/ethereum.svg',
          numericChainId: 1,
          rankScore: 0,
        },
      },
    });
  });

  it('parses chain rankScore and defaults missing values to 0', () => {
    expect(
      PortfolioApiParser.parsePortfolioAssetsResponse({
        assets: [],
        chains: {
          ethereum: {
            id: 'ethereum',
            name: 'Ethereum',
            logoUrl: null,
            numericChainId: 1,
            rankScore: 9200,
          },
          polygon: {
            id: 'polygon',
            name: 'Polygon',
            logoUrl: null,
            numericChainId: 137,
          },
        },
      }).chains,
    ).toEqual({
      ethereum: {
        id: 'ethereum',
        name: 'Ethereum',
        logoUrl: null,
        numericChainId: 1,
        rankScore: 9200,
      },
      polygon: {
        id: 'polygon',
        name: 'Polygon',
        logoUrl: null,
        numericChainId: 137,
        rankScore: 0,
      },
    });
  });

  it('defaults missing canonical asset priceUsd and rankScore to 0', () => {
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
            logoUrl: null,
          },
        ],
        chains: {},
      }).assets[0],
    ).toEqual(
      expect.objectContaining({
        assetId: 'evm:native:ethereum',
        priceUsd: 0,
        rankScore: 0,
      }),
    );
  });

  it('normalizes canonical asset symbols to uppercase', () => {
    expect(
      PortfolioApiParser.parsePortfolioAssetsResponse({
        assets: [
          {
            assetId: 'utxo:native:bitcoin',
            ecosystem: 'utxo',
            symbol: 'btc',
            name: 'Bitcoin',
            chainId: 'bitcoin',
            address: null,
            decimals: 8,
            isNative: true,
            familyId: 'utxo:native:btc',
            logoUrl: null,
          },
          {
            assetId: 'svm:native:solana',
            ecosystem: 'svm',
            symbol: 'sol',
            name: 'Solana',
            chainId: 'solana',
            address: null,
            decimals: 9,
            isNative: true,
            familyId: 'svm:native:sol',
            logoUrl: null,
          },
        ],
        chains: {},
      }).assets.map((asset) => asset.symbol),
    ).toEqual(['BTC', 'SOL']);
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
            priceUsd: 0,
            rankScore: 0,
          },
        ],
        chains: {
          ripple: {
            id: 'ripple',
            name: 'Ripple',
            logoUrl: 'https://example.com/ripple.svg',
            numericChainId: null,
            rankScore: 0,
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
          rankScore: 0,
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
            priceUsd: 0,
            rankScore: 0,
          },
        ],
        chains: {
          bitcoin: {
            id: 'bitcoin',
            name: 'Bitcoin',
            logoUrl: 'https://example.com/bitcoin.svg',
            numericChainId: null,
            rankScore: 0,
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
          rankScore: 0,
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
              priceUsd: 0,
              rankScore: 0,
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
          kyc: 'never',
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
      amountHints: null,
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

  it('parses kyc status from the provider object and defaults to never', () => {
    const never = PortfolioApiParser.parsePortfolioQuoteResponse({
      request: { mode: 'swap' },
      quotes: [
        {
          quoteId: 'lifi:1',
          provider: { id: 'lifi', name: 'LI.FI', kyc: 'never' },
          fromAmount: '1',
          estimatedToAmount: '0.99',
        },
      ],
    });
    const possible = PortfolioApiParser.parsePortfolioQuoteResponse({
      request: { mode: 'buy' },
      quotes: [
        {
          quoteId: 'simpleswap:1',
          provider: { id: 'simpleswap', name: 'SimpleSwap', kyc: 'possible' },
          fromAmount: '100',
          estimatedToAmount: '0.05',
        },
      ],
    });
    const requiredFromProvider = PortfolioApiParser.parsePortfolioQuoteResponse({
      request: { mode: 'buy' },
      quotes: [
        {
          quoteId: 'moonpay:1',
          provider: { id: 'moonpay', name: 'MoonPay', kyc: 'typically_required' },
          fromAmount: '100',
          estimatedToAmount: '0.05',
        },
      ],
    });
    const requiredFromQuoteRoot = PortfolioApiParser.parsePortfolioQuoteResponse({
      request: { mode: 'buy' },
      quotes: [
        {
          quoteId: 'ramp:1',
          provider: { id: 'ramp', name: 'Ramp' },
          fromAmount: '100',
          estimatedToAmount: '0.05',
          kyc: 'typically_required',
        },
      ],
    });
    const omitted = PortfolioApiParser.parsePortfolioQuoteResponse({
      request: { mode: 'swap' },
      quotes: [
        {
          quoteId: 'lifi:2',
          provider: { id: 'lifi', name: 'LI.FI' },
          fromAmount: '1',
          estimatedToAmount: '0.99',
        },
      ],
    });

    expect(never.quotes[0]?.kyc).toBe('never');
    expect(possible.quotes[0]?.kyc).toBe('possible');
    expect(requiredFromProvider.quotes[0]?.kyc).toBe('typically_required');
    expect(requiredFromQuoteRoot.quotes[0]?.kyc).toBe('typically_required');
    expect(omitted.quotes[0]?.kyc).toBe('never');
  });

  it('parses quote amountHints and defaults missing sidecar to null', () => {
    const response = PortfolioApiParser.parsePortfolioQuoteResponse({
      request: { mode: 'swap' },
      quotes: [
        {
          quoteId: 'lifi:1',
          provider: { id: 'lifi', name: 'LI.FI' },
          fromAmount: '0.09',
          estimatedToAmount: '220',
        },
      ],
      amountHints: {
        requestedAmount: '0.09',
        blocked: [
          {
            provider: {
              id: 'simpleswap',
              name: 'SimpleSwap',
              logo: 'https://example.com/simpleswap.png',
            },
            reason: 'below_min',
            min: '0.1',
            max: '10',
            suggestedAmount: '0.1',
            paymentMethod: null,
          },
        ],
        nextUnlock: {
          amount: '0.1',
          direction: 'increase',
          additionalProviderCount: 1,
          providers: ['simpleswap'],
        },
      },
    });

    expect(response.amountHints).toEqual({
      requestedAmount: '0.09',
      blocked: [
        {
          provider: {
            id: 'simpleswap',
            name: 'SimpleSwap',
            logo: 'https://example.com/simpleswap.png',
          },
          reason: 'below_min',
          min: '0.1',
          max: '10',
          suggestedAmount: '0.1',
          paymentMethod: null,
        },
      ],
      nextUnlock: {
        amount: '0.1',
        direction: 'increase',
        additionalProviderCount: 1,
        providers: ['simpleswap'],
      },
    });
    expect(
      PortfolioApiParser.parsePortfolioQuoteResponse({
        request: { mode: 'swap' },
        quotes: [],
      }).amountHints,
    ).toBeNull();
    expect(
      PortfolioApiParser.parsePortfolioQuoteAmountHints({
        requestedAmount: '1',
        blocked: [{ provider: { id: 'lifi' }, reason: 'below_min' }],
      }),
    ).toBeNull();
  });

  it('parses payment methods on buy/sell quotes from string or object ids', () => {
    const stringResponse = PortfolioApiParser.parsePortfolioQuoteResponse({
      request: { mode: 'buy', paymentMethod: null },
      quotes: [
        {
          quoteId: 'moonpay:card',
          provider: { id: 'moonpay', name: 'MoonPay' },
          category: 'buy',
          fromAmount: '100',
          estimatedToAmount: '0.05',
          paymentMethod: 'credit_debit_card',
        },
        {
          quoteId: 'moonpay:apple',
          provider: { id: 'moonpay', name: 'MoonPay' },
          category: 'buy',
          fromAmount: '100',
          estimatedToAmount: '0.049',
          paymentMethod: { id: 'apple_pay', label: 'Apple Pay' },
        },
        {
          quoteId: 'moonpay:none',
          provider: { id: 'moonpay', name: 'MoonPay' },
          category: 'buy',
          fromAmount: '100',
          estimatedToAmount: '0.048',
        },
      ],
    });

    expect(stringResponse.quotes.map((quote) => quote.paymentMethod)).toEqual([
      'credit_debit_card',
      'apple_pay',
      null,
    ]);
  });

  it('parses available assets and fiat ramp option payloads', () => {
    expect(
      PortfolioApiParser.parsePortfolioAvailableAssetsResponse({
        mode: 'swap',
        assets: [{ assetId: 'evm:native:ethereum', ecosystem: 'evm', symbol: 'ETH', name: 'Ethereum' }],
      }),
    ).toEqual({
      mode: 'swap',
      direction: null,
      sourceAssetId: null,
      assets: [
        expect.objectContaining({
          assetId: 'evm:native:ethereum',
          familyId: '',
        }),
      ],
      chains: {},
    });

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
        paymentMethods: [
          { id: 'card', label: 'Credit / Debit Card' },
          {
            id: 'SEPA_BANK_TRANSFER',
            label: 'SEPA bank transfer',
            group: { id: 'bank_transfer', label: 'Bank transfer' },
          },
        ],
      }),
    ).toEqual({
      fiatCurrencies: ['USD', 'EUR'],
      paymentMethods: [
        { id: 'card', label: 'Credit / Debit Card' },
        {
          id: 'SEPA_BANK_TRANSFER',
          label: 'SEPA bank transfer',
          group: { id: 'bank_transfer', label: 'Bank transfer' },
        },
      ],
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
        receivedAmount: null,
        fromAddress: '0xfrom',
        toAddress: '0xto',
        redirectUrl: 'https://global.transak.com?sessionId=abc',
        fiatCurrency: null,
        paymentMethod: null,
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
        receivedAmount: null,
        fiatCurrency: null,
        paymentMethod: null,
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
            fromAmount: '1',
            toAmount: '0.99',
            receivedAmount: '0.985',
            txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            fiatCurrency: null,
            paymentMethod: null,
            providerStatus: 'confirming',
            lastProviderStatusRefreshAt: '2026-06-23T12:04:00.000Z',
            failureCode: null,
            failureAction: null,
            providerStatusDetail: null,
            providerStatusUrl: null,
            supportUrl: null,
          },
          {
            id: 'exec-2',
            status: 'failed',
            displayStatus: 'failed',
            mode: 'swap',
            provider: {
              id: 'stealthex',
              name: 'StealthEX',
              logo: null,
            },
            providerReferenceId: 'f8c0c770-b5fd-4e56-9a9e-3ac841f6d9a5',
            executionType: 'in_app',
            txHash: null,
            fiatCurrency: null,
            paymentMethod: null,
            providerStatus: 'failed',
            lastProviderStatusRefreshAt: '2026-06-23T12:05:00.000Z',
            failureCode: 'exchange_failed',
            failureAction: 'contact_support',
            providerStatusDetail: null,
            providerStatusUrl:
              'https://stealthex.io/exchange/?id=f8c0c770-b5fd-4e56-9a9e-3ac841f6d9a5',
            supportUrl: 'https://stealthex.io/contacts/',
          },
          {
            id: 'exec-3',
            status: 'completed',
            displayStatus: 'completed',
            mode: 'buy',
            provider: {
              id: 'moonpay',
              name: 'MoonPay',
              logo: null,
            },
            providerReferenceId: 'moonpay-order-1',
            executionType: 'redirect',
            fromAssetId: null,
            toAssetId: 'evm:native:ethereum',
            fromAmount: '100',
            toAmount: '0.05',
            receivedAmount: null,
            fromAddress: null,
            toAddress: '0xabc',
            txHash: null,
            fiatCurrency: 'USD',
            paymentMethod: 'credit_debit_card',
            providerStatus: 'completed',
            lastProviderStatusRefreshAt: '2026-06-23T12:06:00.000Z',
            failureCode: null,
            failureAction: null,
            providerStatusDetail: null,
            providerStatusUrl: null,
            supportUrl: null,
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
            receivedAmount: '0.985',
            fiatCurrency: null,
            paymentMethod: null,
            providerStatus: 'confirming',
            lastProviderStatusRefreshAt: '2026-06-23T12:04:00.000Z',
            failureCode: null,
            failureAction: null,
            providerStatusDetail: null,
            providerStatusUrl: null,
            supportUrl: null,
          }),
          expect.objectContaining({
            displayStatus: 'failed',
            provider: 'stealthex',
            providerReferenceId: 'f8c0c770-b5fd-4e56-9a9e-3ac841f6d9a5',
            failureCode: 'exchange_failed',
            failureAction: 'contact_support',
            providerStatusDetail: null,
            providerStatusUrl:
              'https://stealthex.io/exchange/?id=f8c0c770-b5fd-4e56-9a9e-3ac841f6d9a5',
            supportUrl: 'https://stealthex.io/contacts/',
          }),
          expect.objectContaining({
            displayStatus: 'completed',
            mode: 'buy',
            executionType: 'redirect',
            provider: 'moonpay',
            fiatCurrency: 'USD',
            paymentMethod: 'credit_debit_card',
            receivedAmount: null,
            txHash: null,
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

  it('parses compliance hold history items with verification_required displayStatus', () => {
    expect(
      PortfolioApiParser.parsePortfolioHistoryResponse({
        page: 1,
        pageSize: 20,
        hasMore: false,
        items: [
          {
            id: 'exec-compliance',
            status: 'awaiting_compliance_action',
            displayStatus: 'verification_required',
            mode: 'swap',
            provider: {
              id: 'changelly',
              name: 'Changelly',
              logo: 'https://example.com/changelly.png',
            },
            providerReferenceId: '4f2u8h9j6qdnys',
            executionType: 'redirect',
            fromAmount: '2.15',
            toAmount: '6764.9',
            receivedAmount: null,
            txHash: null,
            providerStatus: 'hold',
            lastProviderStatusRefreshAt: '2026-01-01T12:00:00.000Z',
            failureCode: 'aml_review',
            failureAction: 'contact_support',
            providerStatusDetail: 'canRefund=true',
            providerStatusUrl: null,
            supportUrl: 'mailto:security@changelly.com',
            submittedAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
      }),
    ).toEqual(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            status: 'awaiting_compliance_action',
            displayStatus: 'verification_required',
            provider: 'changelly',
            providerReferenceId: '4f2u8h9j6qdnys',
            failureCode: 'aml_review',
            failureAction: 'contact_support',
            supportUrl: 'mailto:security@changelly.com',
            providerStatus: 'hold',
          }),
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

  it('parses GET /features statuses and coerces legacy booleans', () => {
    expect(
      PortfolioApiParser.parsePortfolioFeaturesResponse({
        version: 1,
        features: {
          swapBridge: 'activated',
          buy: 'comingSoon',
          sell: 'deactivated',
        },
      }),
    ).toEqual({
      version: 1,
      features: {
        swapBridge: 'activated',
        buy: 'comingSoon',
        sell: 'deactivated',
      },
    });

    expect(
      PortfolioApiParser.parsePortfolioFeaturesResponse({
        version: 1,
        features: {
          swapBridge: true,
          buy: false,
          sell: 'comingSoon',
        },
      }),
    ).toEqual({
      version: 1,
      features: {
        swapBridge: 'activated',
        buy: 'deactivated',
        sell: 'comingSoon',
      },
    });
  });

  it('defaults missing feature payloads to swap live and buy/sell coming soon', () => {
    expect(PortfolioApiParser.parsePortfolioFeaturesResponse(null)).toEqual({
      version: 1,
      features: {
        swapBridge: 'activated',
        buy: 'comingSoon',
        sell: 'comingSoon',
      },
    });

    expect(
      PortfolioApiParser.parsePortfolioFeaturesResponse({
        version: 1,
        features: {
          swapBridge: 'on',
        },
      }),
    ).toEqual({
      version: 1,
      features: {
        swapBridge: 'deactivated',
        buy: 'comingSoon',
        sell: 'comingSoon',
      },
    });
  });
});
