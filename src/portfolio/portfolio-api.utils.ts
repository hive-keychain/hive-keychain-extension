import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import {
  PortfolioApiErrorPayload,
  PortfolioAvailableAssetsResponse,
  PortfolioExecution,
  PortfolioFiatRampOptions,
  PortfolioAssetsResponse,
  PortfolioHistoryItem,
  PortfolioMode,
  PortfolioQuote,
  PortfolioQuoteRequestBody,
  PortfolioQuoteResponse,
  PortfolioSwapAmountRangeDetails,
} from 'src/portfolio/portfolio-api.interface';
import { PortfolioApiParser } from 'src/portfolio/portfolio-api.parser';

const CLIENT_TOKEN_HEADER = 'X-Keychain-Portfolio-Client-Token';

export const canExecutePortfolioQuote = (quote: PortfolioQuote): boolean => {
  if (quote.executionType === 'in_app') {
    return Boolean(quote.transaction);
  }

  return quote.executionType === 'redirect' || Boolean(quote.redirectUrl);
};

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
  if (min && max) {
    return {
      key: 'portfolio_swap_amount_out_of_range',
      params: [min, max],
    };
  }

  return { key: 'portfolio_swap_amount_out_of_range_generic' };
};

export const resolvePortfolioQuoteStatusMessage = (
  error: unknown,
  fallback = 'portfolio_load_error',
): string => {
  if (error instanceof PortfolioApiError && error.code === 'NO_QUOTE_AVAILABLE') {
    return 'portfolio_no_quote_available';
  }

  if (error instanceof Error && error.message.startsWith('portfolio_')) {
    return error.message;
  }

  return fallback;
};

export type PortfolioSwapQuoteFetchResult =
  | { status: 'skipped' }
  | { status: 'quoted' }
  | { status: 'no_quote' }
  | { status: 'amount_out_of_range' }
  | { status: 'invalid_recipient' }
  | { status: 'transient_error' };

export const resolvePortfolioSwapQuoteFetchErrorResult = (
  error: unknown,
): PortfolioSwapQuoteFetchResult => {
  if (resolvePortfolioAmountQuoteError(error)) {
    return { status: 'amount_out_of_range' };
  }

  if (error instanceof PortfolioApiError && error.code === 'NO_QUOTE_AVAILABLE') {
    return { status: 'no_quote' };
  }

  return { status: 'transient_error' };
};

export const shouldSchedulePortfolioSwapQuoteAutoRefresh = (
  result: PortfolioSwapQuoteFetchResult,
): boolean =>
  result.status === 'quoted' || result.status === 'transient_error';

const getBaseUrl = () => (process.env.PORTFOLIO_API_URL ?? '').replace(/\/+$/, '');

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

  const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
  const payload = await response.json();
  if (!response.ok) {
    throw parsePortfolioApiErrorPayload(payload);
  }
  return payload;
};

const listAssets = async (): Promise<PortfolioAssetsResponse> =>
  PortfolioApiParser.parsePortfolioAssetsResponse(await fetchJson('/assets'));

const listAvailableAssets = async (params: {
  mode: PortfolioMode;
  direction: 'from' | 'to';
  sourceAssetId?: string;
}): Promise<PortfolioAvailableAssetsResponse> => {
  const searchParams = new URLSearchParams({
    mode: params.mode,
    direction: params.direction,
  });
  if (params.sourceAssetId) {
    searchParams.set('sourceAssetId', params.sourceAssetId);
  }

  return PortfolioApiParser.parsePortfolioAvailableAssetsResponse(
    await fetchJson(`/assets/available?${searchParams.toString()}`),
  );
};

const getFiatRampOptions = async (params: {
  countryCode: string;
  mode: 'buy' | 'sell';
}): Promise<PortfolioFiatRampOptions> => {
  const searchParams = new URLSearchParams({
    countryCode: params.countryCode,
    mode: params.mode,
  });

  return PortfolioApiParser.parsePortfolioFiatRampOptions(
    await fetchJson(`/fiat-ramp/options?${searchParams.toString()}`),
  );
};

const getQuotes = async (
  body: PortfolioQuoteRequestBody,
): Promise<PortfolioQuoteResponse> =>
  PortfolioApiParser.parsePortfolioQuoteResponse(
    await fetchJson('/quotes', { method: 'POST', body: JSON.stringify(body) }),
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
          paymentMethod: request.paymentMethod,
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

const listHistory = async (): Promise<PortfolioHistoryItem[]> =>
  PortfolioApiParser.parsePortfolioHistoryResponse(
    await fetchJson('/history', {}, true),
  ).items;

export const PortfolioApiUtils = {
  canExecutePortfolioQuote,
  createExecution,
  getClientToken,
  getFiatRampOptions,
  getQuotes,
  listAssets,
  listAvailableAssets,
  listHistory,
  markSubmitted,
  resolveExecutablePortfolioQuoteId,
  resolvePortfolioAmountQuoteError,
  resolvePortfolioQuoteStatusMessage,
  resolvePortfolioSwapQuoteFetchErrorResult,
  shouldSchedulePortfolioSwapQuoteAutoRefresh,
};
