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

  const originalNodeEnv = process.env.NODE_ENV;
  const originalDevGeoCountry = process.env.PORTFOLIO_DEV_GEO_COUNTRY;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PORTFOLIO_API_URL = 'https://portfolio.example';
    delete process.env.PORTFOLIO_DEV_GEO_COUNTRY;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    if (originalDevGeoCountry === undefined) {
      delete process.env.PORTFOLIO_DEV_GEO_COUNTRY;
    } else {
      process.env.PORTFOLIO_DEV_GEO_COUNTRY = originalDevGeoCountry;
    }
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

  it('posts the first history page with the installation token', async () => {
    getValueMock.mockResolvedValue('x'.repeat(64));
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ items: [] }),
    });

    await PortfolioApiUtils.listHistory();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://portfolio.example/history',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ page: 1 }),
      }),
    );
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect((init.headers as Headers).get('X-Keychain-Portfolio-Client-Token')).toBe(
      'x'.repeat(64),
    );
    expect((init.headers as Headers).get('Content-Type')).toBe(
      'application/json',
    );
  });

  it('posts paginated history requests', async () => {
    getValueMock.mockResolvedValue('x'.repeat(64));
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        page: 2,
        pageSize: 20,
        hasMore: false,
        items: [],
      }),
    });

    await PortfolioApiUtils.listHistory(2);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://portfolio.example/history',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ page: 2 }),
      }),
    );
  });

  it('sends history address filters when provided', async () => {
    getValueMock.mockResolvedValue('x'.repeat(64));
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        page: 1,
        pageSize: 20,
        hasMore: false,
        items: [],
      }),
    });

    await PortfolioApiUtils.listHistory(1, {
      addresses: ['0xabc', 'alice', ' 0xdef '],
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://portfolio.example/history',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          page: 1,
          addresses: ['0xabc', 'alice', '0xdef'],
        }),
      }),
    );
  });

  it('posts compliance review history requests with optional address filters', async () => {
    getValueMock.mockResolvedValue('x'.repeat(64));
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        page: 1,
        pageSize: 20,
        hasMore: false,
        items: [],
      }),
    });

    await PortfolioApiUtils.listComplianceReviewHistory({
      addresses: ['0xabc', 'alice'],
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://portfolio.example/history/compliance-review',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ addresses: ['0xabc', 'alice'] }),
      }),
    );
  });

  it('requests supported fiat ramp countries for the selected mode', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        countries: [
          { countryCode: 'DE', name: 'Germany' },
          { countryCode: 'us', name: null },
          { countryCode: 'INVALID', name: 'Nope' },
        ],
      }),
    });

    await expect(
      PortfolioApiUtils.listFiatRampCountries('sell'),
    ).resolves.toEqual([
      { countryCode: 'DE', name: 'Germany' },
      { countryCode: 'US', name: null },
    ]);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://portfolio.example/fiat-ramp/countries?mode=sell',
      expect.any(Object),
    );
  });

  it('requests full fiat ramp options without requiring a country', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        fiatCurrencies: ['EUR', 'USD'],
        paymentMethods: [
          {
            id: 'SEPA_BANK_TRANSFER',
            label: 'SEPA bank transfer',
            group: { id: 'bank_transfer', label: 'Bank transfer' },
          },
        ],
      }),
    });

    await expect(
      PortfolioApiUtils.getFiatRampOptions({ mode: 'buy' }),
    ).resolves.toEqual({
      fiatCurrencies: ['EUR', 'USD'],
      paymentMethods: [
        {
          id: 'SEPA_BANK_TRANSFER',
          label: 'SEPA bank transfer',
          group: { id: 'bank_transfer', label: 'Bank transfer' },
        },
      ],
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://portfolio.example/fiat-ramp/options?mode=buy',
      expect.any(Object),
    );
  });

  it('includes countryCode on fiat ramp options when provided', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        fiatCurrencies: ['EUR'],
        paymentMethods: [],
      }),
    });

    await PortfolioApiUtils.getFiatRampOptions({
      mode: 'sell',
      countryCode: 'de',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://portfolio.example/fiat-ramp/options?mode=sell&countryCode=DE',
      expect.any(Object),
    );
  });

  it('requests fiat ramp locale from the caller IP', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        countryCode: 'TW',
        source: 'ip_lookup',
      }),
    });

    await expect(PortfolioApiUtils.getFiatRampLocale()).resolves.toEqual({
      countryCode: 'TW',
      source: 'ip_lookup',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://portfolio.example/fiat-ramp/locale',
      expect.any(Object),
    );
  });

  it('attaches cf-ipcountry in development when PORTFOLIO_DEV_GEO_COUNTRY is set', async () => {
    process.env.NODE_ENV = 'development';
    process.env.PORTFOLIO_DEV_GEO_COUNTRY = 'ru';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        countryCode: 'RU',
        source: 'cdn_header',
      }),
    });

    await PortfolioApiUtils.getFiatRampLocale();

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect((init.headers as Headers).get('cf-ipcountry')).toBe('RU');
  });

  it('does not attach cf-ipcountry when PORTFOLIO_DEV_GEO_COUNTRY is unset', async () => {
    process.env.NODE_ENV = 'development';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        countryCode: null,
        source: 'unavailable',
      }),
    });

    await PortfolioApiUtils.getFiatRampLocale();

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect((init.headers as Headers).has('cf-ipcountry')).toBe(false);
  });

  it('does not attach cf-ipcountry outside development builds', async () => {
    process.env.NODE_ENV = 'production';
    process.env.PORTFOLIO_DEV_GEO_COUNTRY = 'RU';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        countryCode: null,
        source: 'unavailable',
      }),
    });

    await PortfolioApiUtils.getFiatRampLocale();

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect((init.headers as Headers).has('cf-ipcountry')).toBe(false);
  });

  it('ignores invalid PORTFOLIO_DEV_GEO_COUNTRY values', async () => {
    process.env.NODE_ENV = 'development';
    process.env.PORTFOLIO_DEV_GEO_COUNTRY = 'RUSSIA';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        countryCode: null,
        source: 'unavailable',
      }),
    });

    await PortfolioApiUtils.getFiatRampLocale();

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect((init.headers as Headers).has('cf-ipcountry')).toBe(false);
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
            priceUsd: 0,
            rankScore: 0,
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
          rankScore: 0,
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

  it('forwards an abort signal on quote requests', async () => {
    const controller = new AbortController();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        request: { mode: 'swap' },
        quotes: [],
      }),
    });

    await PortfolioApiUtils.getQuotes(
      {
        mode: 'swap',
        fromAmount: '1',
      },
      controller.signal,
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'https://portfolio.example/quotes',
      expect.objectContaining({
        method: 'POST',
        signal: controller.signal,
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
        redirectUrl: null,
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
        paymentMethod: null,
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
        paymentMethod: null,
      }),
    );
  });

  it('sends the quote payment method when creating a buy execution', async () => {
    getValueMock.mockResolvedValue('x'.repeat(64));
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        id: 'exec-1',
        status: 'created',
        mode: 'buy',
        provider: 'moonpay',
        providerReferenceId: null,
        fromAssetId: null,
        toAssetId: 'evm:native:ethereum',
        fromAmount: '100',
        toAmount: '0.05',
        fromAddress: '0xfrom',
        toAddress: '0xto',
        redirectUrl: 'https://example.com/buy',
        transaction: null,
        submittedAt: '2026-06-23T12:00:00.000Z',
        updatedAt: '2026-06-23T12:00:00.000Z',
      }),
    });

    await PortfolioApiUtils.createExecution(
      {
        quoteId: 'moonpay:card',
        provider: 'moonpay',
        providerName: 'MoonPay',
        providerLogoUrl: null,
        category: 'buy',
        routeType: null,
        fromAsset: null,
        toAsset: null,
        fromAmount: '100',
        estimatedToAmount: '0.05',
        comparableValue: '0.05',
        providerFee: null,
        networkFeeEstimate: null,
        priceImpact: null,
        warnings: [],
        expiresAt: null,
        redirectUrl: 'https://example.com/buy',
        requiresRedirect: true,
        executionType: 'redirect',
        routeMetadata: null,
        approval: null,
        transaction: null,
        paymentMethod: 'credit_debit_card',
      },
      {
        mode: 'buy',
        routeType: null,
        fromAssetId: null,
        toAssetId: 'evm:native:ethereum',
        fiatCurrency: 'USD',
        paymentMethod: null,
        countryCode: 'US',
        sourceChainId: null,
        destinationChainId: null,
      },
      '0xfrom',
      '0xto',
    );

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(JSON.parse(init.body as string)).toEqual(
      expect.objectContaining({
        paymentMethod: 'credit_debit_card',
        fiatCurrency: 'USD',
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
      fillAmount: '2200',
    });
    expect(
      PortfolioApiUtils.resolvePortfolioAmountQuoteError(
        new PortfolioApiError({
          code: 'SWAP_AMOUNT_OUT_OF_RANGE',
          message: 'No quote available for the requested amount.',
          details: {
            fiatCurrency: 'TWD',
            mergedRange: {
              min: '908',
              max: '334910',
            },
          },
        }),
      ),
    ).toEqual({
      key: 'portfolio_amount_out_of_range_fiat',
      params: ['908', '334910', 'TWD'],
      fillAmount: '908',
    });
    expect(
      PortfolioApiUtils.resolvePortfolioAmountQuoteError(
        new PortfolioApiError({
          code: 'SWAP_AMOUNT_OUT_OF_RANGE',
          message: 'No quote available for the requested amount.',
          details: {
            fiatCurrency: 'TWD',
            mergedRange: {
              min: '908',
              max: null,
            },
          },
        }),
      ),
    ).toEqual({
      key: 'portfolio_amount_below_minimum_fiat',
      params: ['908', 'TWD'],
      fillAmount: '908',
    });
    expect(
      PortfolioApiUtils.resolvePortfolioAmountQuoteError(
        new PortfolioApiError({
          code: 'SWAP_AMOUNT_OUT_OF_RANGE',
          message: 'No quote available for the requested amount.',
          details: {
            mergedRange: {
              min: '0.05',
              max: null,
            },
          },
        }),
      ),
    ).toEqual({
      key: 'portfolio_amount_below_minimum',
      params: ['0.05'],
      fillAmount: '0.05',
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

  it('prefers amountHints nextUnlock when filling an out-of-range amount', () => {
    expect(
      PortfolioApiUtils.resolvePortfolioAmountQuoteError(
        new PortfolioApiError({
          code: 'SWAP_AMOUNT_OUT_OF_RANGE',
          message: 'No quote available for the requested amount.',
          details: {
            mergedRange: {
              min: '0.01',
              max: '10',
            },
            amountHints: {
              requestedAmount: '12',
              blocked: [
                {
                  provider: { id: 'simpleswap', name: 'SimpleSwap', logo: null },
                  reason: 'above_max',
                  min: '0.01',
                  max: '10',
                  suggestedAmount: '10',
                  paymentMethod: null,
                },
              ],
              nextUnlock: {
                amount: '10',
                direction: 'decrease',
                additionalProviderCount: 1,
                providers: ['simpleswap'],
              },
            },
          },
        }),
      ),
    ).toEqual({
      key: 'portfolio_swap_amount_out_of_range',
      params: ['0.01', '10'],
      fillAmount: '10',
    });
  });

  it('maps quote amountHints nextUnlock to a fillable retry message', () => {
    expect(
      PortfolioApiUtils.resolvePortfolioQuoteAmountHint({
        requestedAmount: '0.09',
        blocked: [
          {
            provider: { id: 'simpleswap', name: 'SimpleSwap', logo: null },
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
      }),
    ).toEqual({
      key: 'portfolio_amount_hint_increase_provider',
      params: ['0.1', 'SimpleSwap'],
      fillAmount: '0.1',
    });
    expect(
      PortfolioApiUtils.resolvePortfolioQuoteAmountHint({
        requestedAmount: '12',
        blocked: [
          {
            provider: { id: 'simpleswap', name: null, logo: null },
            reason: 'above_max',
            min: '1',
            max: '10',
            suggestedAmount: '10',
            paymentMethod: null,
          },
          {
            provider: { id: 'changelly', name: null, logo: null },
            reason: 'above_max',
            min: '1',
            max: '10',
            suggestedAmount: '10',
            paymentMethod: null,
          },
        ],
        nextUnlock: {
          amount: '10',
          direction: 'decrease',
          additionalProviderCount: 2,
          providers: ['changelly', 'simpleswap'],
        },
      }),
    ).toEqual({
      key: 'portfolio_amount_hint_decrease',
      params: ['10', '2'],
      fillAmount: '10',
    });
    expect(
      PortfolioApiUtils.resolvePortfolioQuoteAmountHint({
        requestedAmount: '0.09',
        blocked: [
          {
            provider: { id: 'simpleswap', name: 'SimpleSwap', logo: null },
            reason: 'below_min',
            min: '5',
            max: '10',
            suggestedAmount: '5',
            paymentMethod: null,
          },
        ],
        nextUnlock: null,
      }),
    ).toBeNull();
  });

  it('allows filling the minimum amount only when balance covers it or balance check is skipped', () => {
    expect(
      PortfolioApiUtils.canFillPortfolioMinimumAmount({
        fillAmount: '0.5',
        availableBalance: '1',
        skipBalanceCheck: false,
      }),
    ).toBe(true);
    expect(
      PortfolioApiUtils.canFillPortfolioMinimumAmount({
        fillAmount: '2',
        availableBalance: '1',
        skipBalanceCheck: false,
      }),
    ).toBe(false);
    expect(
      PortfolioApiUtils.canFillPortfolioMinimumAmount({
        fillAmount: '2',
        availableBalance: '1',
        skipBalanceCheck: true,
      }),
    ).toBe(true);
    expect(
      PortfolioApiUtils.canFillPortfolioMinimumAmount({
        fillAmount: undefined,
        availableBalance: '1',
        skipBalanceCheck: false,
      }),
    ).toBe(false);
    expect(
      PortfolioApiUtils.canFillPortfolioMinimumAmount({
        fillAmount: '0.1',
        availableBalance: undefined,
        skipBalanceCheck: false,
      }),
    ).toBe(false);
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
        new PortfolioApiError({
          code: 'NO_SERVICES_IN_COUNTRY',
          message: 'No services are available in your country',
        }),
      ),
    ).toBe('portfolio_no_services_in_country');
    expect(
      PortfolioApiUtils.resolvePortfolioQuoteStatusMessage(
        new Error('portfolio_api_not_configured'),
      ),
    ).toBe('portfolio_api_not_configured');
    expect(
      PortfolioApiUtils.resolvePortfolioQuoteStatusMessage(new Error('Network error')),
    ).toBe('portfolio_load_error');
  });

  describe('shouldSchedulePortfolioSwapQuoteAutoRefresh', () => {
    it('keeps auto-refresh for quoted and transient errors', () => {
      expect(
        PortfolioApiUtils.shouldSchedulePortfolioSwapQuoteAutoRefresh({
          status: 'quoted',
        }),
      ).toBe(true);
      expect(
        PortfolioApiUtils.shouldSchedulePortfolioSwapQuoteAutoRefresh({
          status: 'transient_error',
        }),
      ).toBe(true);
    });

    it('stops auto-refresh when no quote or amount is invalid', () => {
      expect(
        PortfolioApiUtils.shouldSchedulePortfolioSwapQuoteAutoRefresh({
          status: 'no_quote',
        }),
      ).toBe(false);
      expect(
        PortfolioApiUtils.shouldSchedulePortfolioSwapQuoteAutoRefresh({
          status: 'amount_out_of_range',
        }),
      ).toBe(false);
      expect(
        PortfolioApiUtils.shouldSchedulePortfolioSwapQuoteAutoRefresh({
          status: 'invalid_recipient',
        }),
      ).toBe(false);
      expect(
        PortfolioApiUtils.shouldSchedulePortfolioSwapQuoteAutoRefresh({
          status: 'skipped',
        }),
      ).toBe(false);
      expect(
        PortfolioApiUtils.shouldSchedulePortfolioSwapQuoteAutoRefresh({
          status: 'aborted',
        }),
      ).toBe(false);
    });
  });

  describe('resolvePortfolioSwapQuoteFetchErrorResult', () => {
    it('maps quote fetch errors to refresh outcomes', () => {
      expect(
        PortfolioApiUtils.resolvePortfolioSwapQuoteFetchErrorResult(
          new PortfolioApiError({
            code: 'NO_QUOTE_AVAILABLE',
            message: 'No quote available.',
          }),
        ),
      ).toEqual({ status: 'no_quote' });
      expect(
        PortfolioApiUtils.resolvePortfolioSwapQuoteFetchErrorResult(
          new PortfolioApiError({
            code: 'NO_SERVICES_IN_COUNTRY',
            message: 'No services are available in your country',
          }),
        ),
      ).toEqual({ status: 'no_quote' });
      expect(
        PortfolioApiUtils.resolvePortfolioSwapQuoteFetchErrorResult(
          new PortfolioApiError({
            code: 'SWAP_AMOUNT_OUT_OF_RANGE',
            message: 'Amount out of range.',
          }),
        ),
      ).toEqual({ status: 'amount_out_of_range' });
      expect(
        PortfolioApiUtils.resolvePortfolioSwapQuoteFetchErrorResult(
          new Error('Network error'),
        ),
      ).toEqual({ status: 'transient_error' });
      expect(
        PortfolioApiUtils.resolvePortfolioSwapQuoteFetchErrorResult(
          new DOMException('The operation was aborted.', 'AbortError'),
        ),
      ).toEqual({ status: 'aborted' });
    });
  });

  describe('resolvePortfolioExecutionRedirectUrl', () => {
    it('prefers the execution redirect url over the quote preview url', () => {
      expect(
        PortfolioApiUtils.resolvePortfolioExecutionRedirectUrl(
          {
            id: 'exec-1',
            status: 'created',
            mode: 'buy',
            provider: 'transak',
            providerReferenceId: 'session-1',
            fromAssetId: null,
            toAssetId: 'evm:native:ethereum',
            fromAmount: '100',
            toAmount: '0.05',
            receivedAmount: null,
            fromAddress: null,
            toAddress: '0xabc',
            redirectUrl: 'https://global.transak.com?sessionId=fresh',
            transaction: null,
            fiatCurrency: 'USD',
            paymentMethod: 'credit_debit_card',
            submittedAt: '2026-06-23T12:00:00.000Z',
            updatedAt: '2026-06-23T12:00:00.000Z',
          },
          {
            quoteId: 'transak:1',
            provider: 'transak',
            providerName: 'Transak',
            providerLogoUrl: null,
            category: 'buy',
            routeType: null,
            fromAsset: null,
            toAsset: null,
            fromAmount: '100',
            estimatedToAmount: '0.05',
            comparableValue: '0.05',
            providerFee: null,
            networkFeeEstimate: null,
            priceImpact: null,
            warnings: [],
            expiresAt: null,
            redirectUrl: 'https://global.transak.com?sessionId=preview',
            requiresRedirect: true,
            executionType: 'redirect',
            routeMetadata: null,
            approval: null,
            transaction: null,
            paymentMethod: 'credit_debit_card',
          },
        ),
      ).toBe('https://global.transak.com?sessionId=fresh');
    });

    it('falls back to the quote preview url when execution has no redirect url', () => {
      expect(
        PortfolioApiUtils.resolvePortfolioExecutionRedirectUrl(
          {
            id: 'exec-1',
            status: 'created',
            mode: 'buy',
            provider: 'ramp',
            providerReferenceId: null,
            fromAssetId: null,
            toAssetId: 'evm:native:ethereum',
            fromAmount: '100',
            toAmount: '0.05',
            receivedAmount: null,
            fromAddress: null,
            toAddress: '0xabc',
            redirectUrl: null,
            transaction: null,
            fiatCurrency: 'USD',
            paymentMethod: null,
            submittedAt: '2026-06-23T12:00:00.000Z',
            updatedAt: '2026-06-23T12:00:00.000Z',
          },
          {
            quoteId: 'ramp:1',
            provider: 'ramp',
            providerName: 'Ramp',
            providerLogoUrl: null,
            category: 'buy',
            routeType: null,
            fromAsset: null,
            toAsset: null,
            fromAmount: '100',
            estimatedToAmount: '0.05',
            comparableValue: '0.05',
            providerFee: null,
            networkFeeEstimate: null,
            priceImpact: null,
            warnings: [],
            expiresAt: null,
            redirectUrl: 'https://app.rampnetwork.com/preview',
            requiresRedirect: true,
            executionType: 'redirect',
            routeMetadata: null,
            approval: null,
            transaction: null,
            paymentMethod: null,
          },
        ),
      ).toBe('https://app.rampnetwork.com/preview');
    });
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
      paymentMethod: null,
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

  describe('resolveVisiblePortfolioSections', () => {
    it('hides buy, sell, and swap when their flags are off', () => {
      expect(
        PortfolioApiUtils.resolveVisiblePortfolioSections({
          swapBridge: false,
          buy: false,
          sell: true,
        }),
      ).toEqual(['portfolio', 'sell', 'history']);
    });

    it('hides history when all trade features are off', () => {
      expect(
        PortfolioApiUtils.resolveVisiblePortfolioSections({
          swapBridge: false,
          buy: false,
          sell: false,
        }),
      ).toEqual(['portfolio']);
    });
  });
});
