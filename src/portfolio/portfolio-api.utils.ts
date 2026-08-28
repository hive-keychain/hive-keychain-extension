import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import {
  PortfolioApiErrorPayload,
  PortfolioAvailableAssetsResponse,
  PortfolioExecution,
  PortfolioFeatureFlags,
  PortfolioFiatRampCountry,
  PortfolioFiatRampLocale,
  PortfolioFiatRampOptions,
  PortfolioAssetsResponse,
  PortfolioHistoryItem,
  PortfolioMode,
  PortfolioQuote,
  PortfolioQuoteAmountHints,
  PortfolioQuoteRequestBody,
  PortfolioQuoteResponse,
  PortfolioSwapAmountRangeDetails,
} from 'src/portfolio/portfolio-api.interface';
import { PortfolioApiParser } from 'src/portfolio/portfolio-api.parser';

const CLIENT_TOKEN_HEADER = 'X-Keychain-Portfolio-Client-Token';
const DEV_GEO_COUNTRY_HEADER = 'cf-ipcountry';

export const DEFAULT_PORTFOLIO_FEATURE_FLAGS: PortfolioFeatureFlags = {
  swapBridge: true,
  buy: true,
  sell: true,
};

/** Builds sidebar sections from product feature flags (history hidden when all flows are off). */
export const resolveVisiblePortfolioSections = (
  features: PortfolioFeatureFlags,
): Array<'portfolio' | 'buy' | 'sell' | 'swap' | 'history'> => {
  const sections: Array<'portfolio' | 'buy' | 'sell' | 'swap' | 'history'> = [
    'portfolio',
  ];
  if (features.buy) {
    sections.push('buy');
  }
  if (features.sell) {
    sections.push('sell');
  }
  if (features.swapBridge) {
    sections.push('swap');
  }
  if (features.buy || features.sell || features.swapBridge) {
    sections.push('history');
  }
  return sections;
};

export const canExecutePortfolioQuote = (quote: PortfolioQuote): boolean => {
  if (quote.executionType === 'in_app') {
    return Boolean(quote.transaction);
  }

  return quote.executionType === 'redirect' || Boolean(quote.redirectUrl);
};

export const resolvePortfolioExecutionRedirectUrl = (
  execution: PortfolioExecution,
  quote?: PortfolioQuote,
): string | null => execution.redirectUrl ?? quote?.redirectUrl ?? null;

export const resolveExecutablePortfolioQuoteId = (
  quotes: PortfolioQuote[],
  preferredQuoteId?: string,
): string => {
  if (preferredQuoteId) {
    const preferredQuote = quotes.find(
      (quote) => quote.quoteId === preferredQuoteId,
    );
    if (preferredQuote && canExecutePortfolioQuote(preferredQuote)) {
      return preferredQuoteId;
    }
  }

  return (
    quotes.find((quote) => canExecutePortfolioQuote(quote))?.quoteId ??
    quotes[0]?.quoteId ??
    ''
  );
};

export class PortfolioApiError extends Error {
  readonly code?: string;
  readonly details?: PortfolioSwapAmountRangeDetails;
  readonly requestId?: string;

  constructor(options: {
    message: string;
    code?: string;
    details?: PortfolioSwapAmountRangeDetails;
    requestId?: string;
  }) {
    super(options.message);
    this.name = 'PortfolioApiError';
    this.code = options.code;
    this.details = options.details;
    this.requestId = options.requestId;
  }
}

export type PortfolioLocalizedMessage = {
  key: string;
  params?: string[];
  /** When set, the UI may offer clicking the message to fill this amount. */
  fillAmount?: string;
};

const parseComparableAmount = (value: string): number =>
  Number(value.replace(/,/g, '').trim());

/**
 * Whether the user can fill the form with a quote minimum amount.
 * When PORTFOLIO_SKIP_BALANCE_CHECK is enabled, balance is not required.
 * Otherwise, available balance must cover the minimum.
 */
export const canFillPortfolioMinimumAmount = ({
  fillAmount,
  availableBalance,
  skipBalanceCheck = process.env.PORTFOLIO_SKIP_BALANCE_CHECK === 'true',
}: {
  fillAmount: string | undefined;
  availableBalance: string | null | undefined;
  skipBalanceCheck?: boolean;
}): boolean => {
  if (!fillAmount?.trim()) {
    return false;
  }

  if (skipBalanceCheck) {
    return true;
  }

  if (availableBalance == null || availableBalance.trim() === '') {
    return false;
  }

  const minimum = parseComparableAmount(fillAmount);
  const balance = parseComparableAmount(availableBalance);

  return (
    Number.isFinite(minimum) &&
    Number.isFinite(balance) &&
    balance >= minimum
  );
};

const parsePortfolioApiErrorPayload = (payload: unknown): PortfolioApiError => {
  const body =
    payload && typeof payload === 'object'
      ? (payload as PortfolioApiErrorPayload)
      : {};
  const nested = body.error ?? body;

  return new PortfolioApiError({
    message:
      nested.message ||
      body.message ||
      'Portfolio request failed',
    code: nested.code || body.code,
    details: nested.details ?? body.details,
    requestId: nested.requestId || body.requestId,
  });
};

const withFillAmount = (
  message: PortfolioLocalizedMessage,
  fillAmount: string | undefined,
): PortfolioLocalizedMessage =>
  fillAmount ? { ...message, fillAmount } : message;

export const resolvePortfolioQuoteAmountHint = (
  amountHints: PortfolioQuoteAmountHints | null | undefined,
): PortfolioLocalizedMessage | null => {
  const nextUnlock = amountHints?.nextUnlock;
  if (!nextUnlock?.amount.trim()) {
    return null;
  }

  const providerId = nextUnlock.providers[0];
  const namedProvider =
    nextUnlock.additionalProviderCount === 1 && providerId
      ? amountHints?.blocked.find((entry) => entry.provider.id === providerId)
          ?.provider
      : undefined;
  const providerLabel =
    namedProvider?.name?.trim() ||
    namedProvider?.id.replace(/_/g, ' ') ||
    '';

  if (providerLabel) {
    return {
      key:
        nextUnlock.direction === 'decrease'
          ? 'portfolio_amount_hint_decrease_provider'
          : 'portfolio_amount_hint_increase_provider',
      params: [nextUnlock.amount, providerLabel],
      fillAmount: nextUnlock.amount,
    };
  }

  return {
    key:
      nextUnlock.direction === 'decrease'
        ? 'portfolio_amount_hint_decrease'
        : 'portfolio_amount_hint_increase',
    params: [nextUnlock.amount, String(nextUnlock.additionalProviderCount)],
    fillAmount: nextUnlock.amount,
  };
};

export const resolvePortfolioAmountQuoteError = (
  error: unknown,
): PortfolioLocalizedMessage | null => {
  if (!(error instanceof PortfolioApiError)) {
    return null;
  }

  if (error.code !== 'SWAP_AMOUNT_OUT_OF_RANGE') {
    return null;
  }

  const min = error.details?.mergedRange?.min;
  const max = error.details?.mergedRange?.max;
  const fiatCurrency =
    typeof error.details?.fiatCurrency === 'string' && error.details.fiatCurrency.trim()
      ? error.details.fiatCurrency.trim().toUpperCase()
      : null;
  const fillAmount =
    resolvePortfolioQuoteAmountHint(
      PortfolioApiParser.parsePortfolioQuoteAmountHints(
        error.details?.amountHints,
      ),
    )?.fillAmount ||
    min ||
    undefined;

  if (min && max) {
    if (fiatCurrency) {
      return withFillAmount(
        {
          key: 'portfolio_amount_out_of_range_fiat',
          params: [min, max, fiatCurrency],
        },
        fillAmount,
      );
    }

    return withFillAmount(
      {
        key: 'portfolio_swap_amount_out_of_range',
        params: [min, max],
      },
      fillAmount,
    );
  }

  if (min) {
    if (fiatCurrency) {
      return withFillAmount(
        {
          key: 'portfolio_amount_below_minimum_fiat',
          params: [min, fiatCurrency],
        },
        fillAmount,
      );
    }

    return withFillAmount(
      {
        key: 'portfolio_amount_below_minimum',
        params: [min],
      },
      fillAmount,
    );
  }

  if (max) {
    if (fiatCurrency) {
      return withFillAmount(
        {
          key: 'portfolio_amount_above_maximum_fiat',
          params: [max, fiatCurrency],
        },
        fillAmount,
      );
    }

    return withFillAmount(
      {
        key: 'portfolio_amount_above_maximum',
        params: [max],
      },
      fillAmount,
    );
  }

  return withFillAmount(
    { key: 'portfolio_swap_amount_out_of_range_generic' },
    fillAmount,
  );
};

export const resolvePortfolioQuoteStatusMessage = (
  error: unknown,
  fallback = 'portfolio_load_error',
): string => {
  if (error instanceof PortfolioApiError && error.code === 'NO_QUOTE_AVAILABLE') {
    return 'portfolio_no_quote_available';
  }

  if (
    error instanceof PortfolioApiError &&
    error.code === 'NO_SERVICES_IN_COUNTRY'
  ) {
    return 'portfolio_no_services_in_country';
  }

  if (error instanceof Error && error.message.startsWith('portfolio_')) {
    return error.message;
  }

  return fallback;
};

export type PortfolioSwapQuoteFetchResult =
  | { status: 'skipped' }
  | { status: 'aborted' }
  | { status: 'quoted' }
  | { status: 'no_quote' }
  | { status: 'amount_out_of_range' }
  | { status: 'invalid_recipient' }
  | { status: 'transient_error' };

export const isPortfolioQuoteRequestAborted = (error: unknown): boolean =>
  (typeof DOMException !== 'undefined' &&
    error instanceof DOMException &&
    error.name === 'AbortError') ||
  (error instanceof Error && error.name === 'AbortError');

export const resolvePortfolioSwapQuoteFetchErrorResult = (
  error: unknown,
): PortfolioSwapQuoteFetchResult => {
  if (isPortfolioQuoteRequestAborted(error)) {
    return { status: 'aborted' };
  }

  if (resolvePortfolioAmountQuoteError(error)) {
    return { status: 'amount_out_of_range' };
  }

  if (
    error instanceof PortfolioApiError &&
    (error.code === 'NO_QUOTE_AVAILABLE' ||
      error.code === 'NO_SERVICES_IN_COUNTRY')
  ) {
    return { status: 'no_quote' };
  }

  return { status: 'transient_error' };
};

export const shouldSchedulePortfolioSwapQuoteAutoRefresh = (
  result: PortfolioSwapQuoteFetchResult,
): boolean =>
  result.status === 'quoted' || result.status === 'transient_error';

const getBaseUrl = () => (process.env.PORTFOLIO_API_URL ?? '').replace(/\/+$/, '');

/** Dev-only geo spoof for portfolio API bans. Never sent outside development builds. */
const getDevGeoCountryHeaderValue = (): string | undefined => {
  if (process.env.NODE_ENV !== 'development') {
    return undefined;
  }

  const country = process.env.PORTFOLIO_DEV_GEO_COUNTRY?.trim();
  if (!country || !/^[A-Za-z]{2}$/.test(country)) {
    return undefined;
  }

  return country.toUpperCase();
};

const createClientToken = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const getClientToken = async (): Promise<string> => {
  const stored = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.PORTFOLIO_CLIENT_TOKEN,
  );
  if (typeof stored === 'string' && stored.length >= 32) {
    return stored;
  }

  const token = createClientToken();
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.PORTFOLIO_CLIENT_TOKEN,
    token,
  );
  return token;
};

const fetchJson = async (
  path: string,
  init: RequestInit = {},
  isPrivate = false,
): Promise<unknown> => {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error('portfolio_api_not_configured');
  }

  const headers = new Headers(init.headers);
  if (init.method && init.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }
  if (isPrivate) {
    headers.set(CLIENT_TOKEN_HEADER, await getClientToken());
  }
  const devGeoCountry = getDevGeoCountryHeaderValue();
  if (devGeoCountry) {
    headers.set(DEV_GEO_COUNTRY_HEADER, devGeoCountry);
  }

  const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
  const payload = await response.json();
  if (!response.ok) {
    throw parsePortfolioApiErrorPayload(payload);
  }
  return payload;
};

const listAssets = async (): Promise<PortfolioAssetsResponse> =>
  PortfolioApiParser.parsePortfolioAssetsResponse(await fetchJson('/assets'));

const getFeatures = async (): Promise<PortfolioFeatureFlags> =>
  PortfolioApiParser.parsePortfolioFeaturesResponse(await fetchJson('/features'))
    .features;

const listAvailableAssets = async (params: {
  mode: PortfolioMode;
  direction?: 'from' | 'to';
  sourceAssetId?: string;
}): Promise<PortfolioAvailableAssetsResponse> => {
  const searchParams = new URLSearchParams({
    mode: params.mode,
  });
  if (params.direction) {
    searchParams.set('direction', params.direction);
  }
  if (params.sourceAssetId) {
    searchParams.set('sourceAssetId', params.sourceAssetId);
  }

  return PortfolioApiParser.parsePortfolioAvailableAssetsResponse(
    await fetchJson(`/assets/available?${searchParams.toString()}`),
  );
};

const getFiatRampOptions = async (params: {
  mode: 'buy' | 'sell';
  countryCode?: string;
}): Promise<PortfolioFiatRampOptions> => {
  const searchParams = new URLSearchParams({
    mode: params.mode,
  });
  if (params.countryCode && /^[A-Za-z]{2}$/.test(params.countryCode.trim())) {
    searchParams.set('countryCode', params.countryCode.trim().toUpperCase());
  }

  return PortfolioApiParser.parsePortfolioFiatRampOptions(
    await fetchJson(`/fiat-ramp/options?${searchParams.toString()}`),
  );
};

const getFiatRampLocale = async (): Promise<PortfolioFiatRampLocale> =>
  PortfolioApiParser.parsePortfolioFiatRampLocale(
    await fetchJson('/fiat-ramp/locale'),
  );

const listFiatRampCountries = async (
  mode: 'buy' | 'sell',
): Promise<PortfolioFiatRampCountry[]> => {
  const searchParams = new URLSearchParams({ mode });

  return PortfolioApiParser.parsePortfolioFiatRampCountriesResponse(
    await fetchJson(`/fiat-ramp/countries?${searchParams.toString()}`),
  ).countries;
};

const getQuotes = async (
  body: PortfolioQuoteRequestBody,
  signal?: AbortSignal,
): Promise<PortfolioQuoteResponse> =>
  PortfolioApiParser.parsePortfolioQuoteResponse(
    await fetchJson('/quotes', {
      method: 'POST',
      body: JSON.stringify(body),
      signal,
    }),
  );

const createExecution = async (
  quote: PortfolioQuote,
  request: PortfolioQuoteResponse['request'],
  fromAddress: string,
  toAddress: string,
): Promise<PortfolioExecution> => {
  const execution = PortfolioApiParser.parsePortfolioExecution(
    await fetchJson(
      '/executions',
      {
        method: 'POST',
        body: JSON.stringify({
          provider: quote.provider,
          quoteId: quote.quoteId,
          mode: quote.category,
          routeType: quote.routeType,
          fromAssetId: quote.fromAsset?.assetId ?? request.fromAssetId,
          toAssetId: quote.toAsset?.assetId ?? request.toAssetId,
          fromAmount: quote.fromAmount,
          estimatedToAmount: quote.estimatedToAmount,
          fromAddress,
          toAddress,
          executionType: quote.executionType,
          transaction: quote.transaction,
          routeMetadata: quote.routeMetadata,
          fiatCurrency: request.fiatCurrency,
          paymentMethod: quote.paymentMethod ?? request.paymentMethod,
          countryCode: request.countryCode,
        }),
      },
      true,
    ),
  );

  if (!execution) {
    throw new Error('portfolio_execution_create_failed');
  }

  return execution;
};

const markSubmitted = async (
  executionId: string,
  txHash: string,
): Promise<PortfolioExecution> => {
  const execution = PortfolioApiParser.parsePortfolioExecution(
    await fetchJson(
      `/executions/${encodeURIComponent(executionId)}/submitted`,
      { method: 'POST', body: JSON.stringify({ txHash }) },
      true,
    ),
  );

  if (!execution) {
    throw new Error('portfolio_execution_submit_failed');
  }

  return execution;
};

const listHistory = async (
  page = 1,
  filters?: {
    addresses?: string[];
  },
): Promise<PortfolioHistoryItem[]> => {
  const addresses = (filters?.addresses ?? [])
    .map((address) => address.trim())
    .filter((address) => address.length > 0);
  const body = {
    page,
    ...(addresses.length > 0 ? { addresses } : {}),
  };

  return PortfolioApiParser.parsePortfolioHistoryResponse(
    await fetchJson(
      '/history',
      { method: 'POST', body: JSON.stringify(body) },
      true,
    ),
  ).items;
};

export const PortfolioApiUtils = {
  canExecutePortfolioQuote,
  canFillPortfolioMinimumAmount,
  createExecution,
  getClientToken,
  getFeatures,
  getFiatRampLocale,
  getFiatRampOptions,
  getQuotes,
  isPortfolioQuoteRequestAborted,
  listAssets,
  listAvailableAssets,
  listFiatRampCountries,
  listHistory,
  markSubmitted,
  resolveExecutablePortfolioQuoteId,
  resolvePortfolioAmountQuoteError,
  resolvePortfolioExecutionRedirectUrl,
  resolvePortfolioQuoteAmountHint,
  resolvePortfolioQuoteStatusMessage,
  resolvePortfolioSwapQuoteFetchErrorResult,
  resolveVisiblePortfolioSections,
  shouldSchedulePortfolioSwapQuoteAutoRefresh,
};
