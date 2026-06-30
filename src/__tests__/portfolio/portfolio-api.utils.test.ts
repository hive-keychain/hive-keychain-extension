import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { PortfolioQuote } from 'src/portfolio/portfolio-api.interface';
import {
  PortfolioApiError,
  PortfolioApiUtils,
} from 'src/portfolio/portfolio-api.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

jest.mock('src/utils/localStorage.utils', () => ({
  __esModule: true,
  default: {
    getValueFromLocalStorage: jest.fn(),
    saveValueInLocalStorage: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('PortfolioApiUtils', () => {
  const getValueMock =
    LocalStorageUtils.getValueFromLocalStorage as jest.MockedFunction<
      typeof LocalStorageUtils.getValueFromLocalStorage
    >;
  const saveValueMock =
    LocalStorageUtils.saveValueInLocalStorage as jest.MockedFunction<
      typeof LocalStorageUtils.saveValueInLocalStorage
    >;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PORTFOLIO_API_URL = 'https://portfolio.example';
  });

  it('reuses an existing installation token', async () => {
    getValueMock.mockResolvedValue('x'.repeat(64));

    await expect(PortfolioApiUtils.getClientToken()).resolves.toBe(
      'x'.repeat(64),
    );
    expect(saveValueMock).not.toHaveBeenCalled();
  });

  it('creates and persists an installation token when missing', async () => {
    getValueMock.mockResolvedValue(undefined);
    jest
      .spyOn(crypto, 'getRandomValues')
      .mockImplementation((array: Uint8Array) => {
        array.fill(1);
        return array;
      });

    const token = await PortfolioApiUtils.getClientToken();

    expect(token).toBe('01'.repeat(32));
    expect(saveValueMock).toHaveBeenCalledWith(
      LocalStorageKeyEnum.PORTFOLIO_CLIENT_TOKEN,
      token,
    );
  });

  it('sends the installation token on private history requests', async () => {
    getValueMock.mockResolvedValue('x'.repeat(64));
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ items: [] }),
    });

    await PortfolioApiUtils.listHistory();

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect((init.headers as Headers).get('X-Keychain-Portfolio-Client-Token')).toBe(
      'x'.repeat(64),
    );
  });

  it('throws structured portfolio api errors from quote requests', async () => {
    getValueMock.mockResolvedValue('x'.repeat(64));
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({
        code: 'SWAP_AMOUNT_OUT_OF_RANGE',
        message: 'No quote available for the requested amount.',
        requestId: '0db08dd7-368d-4eee-b34d-68385aa899d9',
        details: {
          requestedAmount: '1000',
          mergedRange: {
            min: '2200',
            max: '110000',
          },
        },
      }),
    });

    await expect(
      PortfolioApiUtils.getQuotes({
        mode: 'swap',
        fromAmount: '1000',
      }),
    ).rejects.toMatchObject({
      code: 'SWAP_AMOUNT_OUT_OF_RANGE',
      message: 'No quote available for the requested amount.',
      details: {
        mergedRange: {
          min: '2200',
          max: '110000',
        },
      },
    });
  });

  it('parses assets responses from the portfolio api', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
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
        chains: {
          ethereum: {
            id: 'ethereum',
            name: 'Ethereum',
            logoUrl: 'https://example.com/ethereum.svg',
            numericChainId: 1,
          },
        },
      }),
    });

    await expect(PortfolioApiUtils.listAssets()).resolves.toEqual({
      assets: [
        expect.objectContaining({
          assetId: 'evm:native:ethereum',
          symbol: 'ETH',
        }),
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

  it('parses full quote responses from the portfolio api', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        request: {
          mode: 'swap',
          routeType: 'swap',
          fromAssetId: 'evm:native:ethereum',
          toAssetId: 'evm:token:ethereum:0xabc',
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
            },
            category: 'swap',
            routeType: 'swap',
            fromAmount: '1',
            estimatedToAmount: '3200',
            comparableValue: '3200',
            warnings: [],
            requiresRedirect: false,
            executionType: 'in_app',
            routeMetadata: {},
            transaction: null,
          },
        ],
      }),
    });

    await expect(
      PortfolioApiUtils.getQuotes({
        fromAmount: '1',
        fromAssetId: 'evm:native:ethereum',
        toAssetId: 'evm:token:ethereum:0xabc',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        request: expect.objectContaining({
          sourceChainId: 'ethereum',
        }),
        quotes: [
          expect.objectContaining({
            providerName: 'LI.FI',
            comparableValue: '3200',
          }),
        ],
      }),
    );
  });

  it('sends transaction and route metadata when creating executions', async () => {
    getValueMock.mockResolvedValue('x'.repeat(64));
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        id: 'exec-1',
        status: 'created',
        mode: 'swap',
        provider: 'lifi',
        providerReferenceId: null,
        fromAssetId: 'evm:native:ethereum',
        toAssetId: 'evm:token:ethereum:0xabc',
        fromAmount: '1',
        toAmount: '2',
        fromAddress: '0xfrom',
        toAddress: '0xto',
        transaction: {
          to: '0xrouter',
          data: '0xabcd',
          value: '0',
          chainId: 1,
        },
        submittedAt: '2026-06-23T12:00:00.000Z',
        updatedAt: '2026-06-23T12:00:00.000Z',
      }),
    });

    await PortfolioApiUtils.createExecution(
      {
        quoteId: 'lifi:abc',
        provider: 'lifi',
        providerName: 'LI.FI',
        providerLogoUrl: null,
        category: 'swap',
        routeType: 'swap',
        fromAsset: null,
        toAsset: null,
        fromAmount: '1',
        estimatedToAmount: '2',
        comparableValue: '2',
        providerFee: null,
        networkFeeEstimate: null,
        priceImpact: null,
        warnings: [],
        expiresAt: null,
        redirectUrl: null,
        requiresRedirect: false,
        executionType: 'in_app',
        routeMetadata: { tool: '1inch' },
        transaction: {
          from: null,
          to: '0xrouter',
          data: '0xabcd',
          value: '0',
          chainId: 1,
          gasLimit: null,
          gasPrice: null,
          maxFeePerGas: null,
          maxPriorityFeePerGas: null,
        },
      },
      {
        mode: 'swap',
        routeType: 'swap',
        fromAssetId: 'evm:native:ethereum',
        toAssetId: 'evm:token:ethereum:0xabc',
        fiatCurrency: null,
        paymentMethod: null,
        countryCode: null,
        sourceChainId: 'ethereum',
        destinationChainId: null,
      },
      '0xfrom',
      '0xto',
    );

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(JSON.parse(init.body as string)).toEqual(
      expect.objectContaining({
        transaction: expect.objectContaining({
          to: '0xrouter',
          chainId: 1,
        }),
        routeMetadata: { tool: '1inch' },
      }),
    );
  });

  it('maps swap amount out of range errors to amount field messages', () => {
    const error = new PortfolioApiError({
      code: 'SWAP_AMOUNT_OUT_OF_RANGE',
      message: 'No quote available for the requested amount.',
      details: {
        mergedRange: {
          min: '2200',
          max: '110000',
        },
      },
    });

    expect(PortfolioApiUtils.resolvePortfolioAmountQuoteError(error)).toEqual({
      key: 'portfolio_swap_amount_out_of_range',
      params: ['2200', '110000'],
    });
    expect(
      PortfolioApiUtils.resolvePortfolioAmountQuoteError(
        new PortfolioApiError({
          code: 'SWAP_AMOUNT_OUT_OF_RANGE',
          message: 'No quote available for the requested amount.',
        }),
      ),
    ).toEqual({
      key: 'portfolio_swap_amount_out_of_range_generic',
    });
    expect(
      PortfolioApiUtils.resolvePortfolioAmountQuoteError(
        new Error('portfolio_load_error'),
      ),
    ).toBeNull();
  });

  it('maps no quote available errors to the quote status message', () => {
    expect(
      PortfolioApiUtils.resolvePortfolioQuoteStatusMessage(
        new PortfolioApiError({
          code: 'NO_QUOTE_AVAILABLE',
          message: 'No quote available.',
        }),
      ),
    ).toBe('portfolio_no_quote_available');
    expect(
      PortfolioApiUtils.resolvePortfolioQuoteStatusMessage(
        new Error('portfolio_api_not_configured'),
      ),
    ).toBe('portfolio_api_not_configured');
    expect(
      PortfolioApiUtils.resolvePortfolioQuoteStatusMessage(new Error('Network error')),
    ).toBe('portfolio_load_error');
  });

  describe('canExecutePortfolioQuote', () => {
    const createQuote = (
      overrides: Partial<PortfolioQuote> = {},
    ): PortfolioQuote => ({
      quoteId: 'quote-1',
      provider: 'lifi',
      providerName: 'LI.FI',
      providerLogoUrl: null,
      category: 'swap',
      routeType: 'swap',
      fromAsset: null,
      toAsset: null,
      fromAmount: '1',
      estimatedToAmount: '1',
      comparableValue: '1',
      providerFee: null,
      networkFeeEstimate: null,
      priceImpact: null,
      warnings: [],
      expiresAt: null,
      redirectUrl: null,
      requiresRedirect: false,
      executionType: 'in_app',
      routeMetadata: null,
      transaction: {
        to: '0xdef',
        value: '0',
        data: '0x',
        chainId: 1,
        from: null,
        gasLimit: null,
        gasPrice: null,
        maxFeePerGas: null,
        maxPriorityFeePerGas: null,
      },
      ...overrides,
    });

    it('allows any in-app quote that carries a signable transaction', () => {
      expect(
        PortfolioApiUtils.canExecutePortfolioQuote(createQuote()),
      ).toBe(true);
      expect(
        PortfolioApiUtils.canExecutePortfolioQuote(
          createQuote({ provider: 'changelly' }),
        ),
      ).toBe(true);
      expect(
        PortfolioApiUtils.canExecutePortfolioQuote(
          createQuote({ provider: 'stealthex' }),
        ),
      ).toBe(true);
    });

    it('blocks in-app quotes that do not include a transaction', () => {
      expect(
        PortfolioApiUtils.canExecutePortfolioQuote(
          createQuote({ transaction: null }),
        ),
      ).toBe(false);
    });

    it('allows redirect quotes without a transaction payload', () => {
      expect(
        PortfolioApiUtils.canExecutePortfolioQuote(
          createQuote({
            provider: 'stealthex',
            executionType: 'redirect',
            transaction: null,
          }),
        ),
      ).toBe(true);
    });
  });

  describe('resolveExecutablePortfolioQuoteId', () => {
    const nonExecutableQuote = {
      quoteId: 'changelly:1',
      provider: 'changelly',
      executionType: 'in_app' as const,
      transaction: null,
      redirectUrl: null,
    };
    const executableQuote = {
      quoteId: 'stealthex:1',
      provider: 'stealthex',
      executionType: 'in_app' as const,
      transaction: {
        to: '0xdef',
        value: '0',
        data: '0x',
        chainId: 1,
        from: null,
        gasLimit: null,
        gasPrice: null,
        maxFeePerGas: null,
        maxPriorityFeePerGas: null,
      },
    };

    const createQuote = (
      overrides: Record<string, unknown>,
    ): PortfolioQuote =>
      ({
        quoteId: 'quote-1',
        provider: 'lifi',
        providerName: 'LI.FI',
        providerLogoUrl: null,
        category: 'swap',
        routeType: 'swap',
        fromAsset: null,
        toAsset: null,
        fromAmount: '1',
        estimatedToAmount: '1',
        comparableValue: '1',
        providerFee: null,
        networkFeeEstimate: null,
        priceImpact: null,
        warnings: [],
        expiresAt: null,
        redirectUrl: null,
        requiresRedirect: false,
        executionType: 'in_app',
        routeMetadata: null,
        transaction: null,
        ...overrides,
      }) as PortfolioQuote;

    it('prefers the first executable quote when the best quote cannot execute', () => {
      expect(
        PortfolioApiUtils.resolveExecutablePortfolioQuoteId([
          createQuote(nonExecutableQuote),
          createQuote(executableQuote),
        ]),
      ).toBe('stealthex:1');
    });

    it('keeps a preferred quote when it is executable', () => {
      expect(
        PortfolioApiUtils.resolveExecutablePortfolioQuoteId(
          [createQuote(nonExecutableQuote), createQuote(executableQuote)],
          'stealthex:1',
        ),
      ).toBe('stealthex:1');
    });

    it('falls back to the first quote when none are executable', () => {
      expect(
        PortfolioApiUtils.resolveExecutablePortfolioQuoteId([
          createQuote(nonExecutableQuote),
        ]),
      ).toBe('changelly:1');
    });
  });
});
