import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import {
  PortfolioApiErrorPayload,
  PortfolioCanonicalAsset,
  PortfolioExecution,
  PortfolioHistoryItem,
  PortfolioInAppPayload,
  PortfolioMode,
  PortfolioQuote,
  PortfolioQuoteResponse,
  PortfolioRedirectOrder,
  PortfolioSwapAmountRangeDetails,
} from 'src/portfolio/portfolio-api.interface';

const CLIENT_TOKEN_HEADER = 'X-Keychain-Portfolio-Client-Token';

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

const fetchJson = async <T>(
  path: string,
  init: RequestInit = {},
  isPrivate = false,
): Promise<T> => {
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
  const payload = (await response.json()) as unknown;
  if (!response.ok) {
    throw parsePortfolioApiErrorPayload(payload);
  }
  return payload as T;
};

const listAssets = async (): Promise<PortfolioCanonicalAsset[]> =>
  (await fetchJson<{ assets: PortfolioCanonicalAsset[] }>('/assets')).assets;

const getQuotes = async (body: {
  mode: PortfolioMode;
  fromAssetId?: string;
  toAssetId?: string;
  fromAmount: string;
  fromAddress?: string;
  toAddress?: string;
  countryCode?: string;
  fiatCurrency?: string;
  paymentMethod?: string;
}): Promise<PortfolioQuoteResponse> =>
  fetchJson('/quotes', { method: 'POST', body: JSON.stringify(body) });

const createExecution = async (
  quote: PortfolioQuote,
  request: PortfolioQuoteResponse['request'],
  fromAddress: string,
  toAddress: string,
): Promise<PortfolioExecution> =>
  fetchJson(
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
        fiatCurrency: request.fiatCurrency,
        paymentMethod: request.paymentMethod,
        countryCode: request.countryCode,
      }),
    },
    true,
  );

const prepareInAppExecution = async (
  executionId: string,
  fromAddress: string,
  toAddress: string,
): Promise<PortfolioInAppPayload> =>
  fetchJson(
    `/executions/${encodeURIComponent(executionId)}/prepare-in-app`,
    {
      method: 'POST',
      body: JSON.stringify({ fromAddress, toAddress }),
    },
    true,
  );

const createRedirectOrder = async (
  executionId: string,
): Promise<PortfolioRedirectOrder> =>
  fetchJson(
    `/executions/${encodeURIComponent(executionId)}/create-redirect-order`,
    { method: 'POST', body: '{}' },
    true,
  );

const markSubmitted = async (
  executionId: string,
  txHash: string,
): Promise<PortfolioExecution> =>
  fetchJson(
    `/executions/${encodeURIComponent(executionId)}/submitted`,
    { method: 'POST', body: JSON.stringify({ txHash }) },
    true,
  );

const listHistory = async (): Promise<PortfolioHistoryItem[]> =>
  (await fetchJson<{ items: PortfolioHistoryItem[] }>('/history', {}, true))
    .items;

export const PortfolioApiUtils = {
  createExecution,
  createRedirectOrder,
  getClientToken,
  getQuotes,
  listAssets,
  listHistory,
  markSubmitted,
  prepareInAppExecution,
  resolvePortfolioAmountQuoteError,
};
