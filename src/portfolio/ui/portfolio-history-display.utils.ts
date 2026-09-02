import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';
import {
  PortfolioCanonicalAsset,
  PortfolioFailureAction,
  PortfolioFailureCode,
  PortfolioHistoryItem,
} from 'src/portfolio/portfolio-api.interface';
import { resolveEvmChainForChainReference } from 'src/portfolio/portfolio-flow.utils';
import FormatUtils from 'src/utils/format.utils';

export type PortfolioHistoryStatusKind =
  | 'completed'
  | 'failed'
  | 'pending'
  | 'verification_required';
export type PortfolioHistoryStatusLinkKind = 'provider' | 'explorer';

export type PortfolioHistoryStatusLink = {
  url: string;
  kind: PortfolioHistoryStatusLinkKind;
};

export type PortfolioHistorySupportMailtoContext = {
  item: PortfolioHistoryItem;
  fromSymbol: string;
  toSymbol: string;
};

type PortfolioHistoryStatusInput =
  | string
  | {
      status: string;
      displayStatus?: string | null;
    };

const COMPLETED_STATUSES = new Set([
  'completed',
  'complete',
  'finished',
  'success',
  'succeeded',
  'done',
  'settled',
  'filled',
]);

const FAILED_STATUSES = new Set([
  'failed',
  'failure',
  'error',
  'errored',
  'cancelled',
  'canceled',
  'refunded',
  'expired',
  'rejected',
  'declined',
  'unknown',
]);

const VERIFICATION_REQUIRED_STATUS = 'verification_required';

const STATUS_ICONS: Record<PortfolioHistoryStatusKind, SVGIcons> = {
  completed: SVGIcons.SWAPS_STATUS_FINISHED,
  failed: SVGIcons.SWAPS_STATUS_CANCELED,
  pending: SVGIcons.SWAPS_STATUS_PROCESSING,
  verification_required: SVGIcons.SWAPS_STATUS_WARNING,
};

const STATUS_MESSAGE_KEYS: Record<PortfolioHistoryStatusKind, string> = {
  completed: 'portfolio_history_status_completed',
  failed: 'portfolio_history_status_failed',
  pending: 'portfolio_history_status_pending',
  verification_required: 'portfolio_history_status_verification_required',
};

const CREATED_OR_EXPIRED_STATUSES = new Set(['created', 'expired']);

const EVM_CONTRACT_ADDRESS_PATTERN = /^0x[0-9a-f]{40}$/i;
const EVM_TX_HASH_PATTERN = /^0x[a-fA-F0-9]{64}$/;
const HIVE_TX_HASH_PATTERN = /^[a-fA-F0-9]{40}$/;
const HIVE_TX_EXPLORER_BASE_URL = 'https://hivehub.dev/tx';
const HIVE_ENGINE_TX_EXPLORER_BASE_URL = 'https://he.dtools.dev/tx';
const HIVE_CORE_SYMBOLS = new Set(['HIVE', 'HBD', 'HP']);
const HIVE_ENGINE_ASSET_ID_PREFIXES = ['hive_engine:', 'hive-engine:'];

const normalizeExplorerBaseUrl = (url: string): string =>
  url.replace(/\/+$/, '');

const isEvmTxHash = (txHash: string): boolean => EVM_TX_HASH_PATTERN.test(txHash);

const isHiveTxHash = (txHash: string): boolean => HIVE_TX_HASH_PATTERN.test(txHash);

const resolvePortfolioHistoryExplorerUrl = (
  item: Pick<PortfolioHistoryItem, 'txHash'>,
  fromAsset: PortfolioCanonicalAsset | undefined,
  toAsset: PortfolioCanonicalAsset | undefined,
  chains: EvmChain[],
): string | null => {
  const txHash = item.txHash?.trim();
  if (!txHash) {
    return null;
  }

  if (isHiveTxHash(txHash)) {
    const hiveAsset =
      fromAsset?.ecosystem === 'hive' || fromAsset?.ecosystem === 'hive_engine'
        ? fromAsset
        : toAsset?.ecosystem === 'hive' || toAsset?.ecosystem === 'hive_engine'
          ? toAsset
          : undefined;
    const baseUrl =
      hiveAsset?.ecosystem === 'hive_engine'
        ? HIVE_ENGINE_TX_EXPLORER_BASE_URL
        : HIVE_TX_EXPLORER_BASE_URL;
    return `${baseUrl}/${encodeURIComponent(txHash)}`;
  }

  if (!isEvmTxHash(txHash)) {
    return null;
  }

  const chainReferences = [fromAsset?.chainId, toAsset?.chainId].filter(
    (chainId): chainId is string => Boolean(chainId),
  );

  for (const chainReference of chainReferences) {
    const chain = resolveEvmChainForChainReference(chainReference, chains);
    const explorerUrl = chain?.blockExplorer?.url?.trim();
    if (explorerUrl) {
      return `${normalizeExplorerBaseUrl(explorerUrl)}/tx/${txHash}`;
    }
  }

  return null;
};

/**
 * Prefers a provider status/deep-link URL when the API supplies one.
 * Falls back to the chain's default block explorer for EVM hashes, or Hive
 * explorers for Hive / Hive Engine transaction ids.
 */
const resolvePortfolioHistoryStatusLink = (
  item: Pick<PortfolioHistoryItem, 'providerStatusUrl' | 'txHash'>,
  fromAsset: PortfolioCanonicalAsset | undefined,
  toAsset: PortfolioCanonicalAsset | undefined,
  chains: EvmChain[],
): PortfolioHistoryStatusLink | null => {
  const providerStatusUrl = item.providerStatusUrl?.trim();
  if (providerStatusUrl) {
    return { url: providerStatusUrl, kind: 'provider' };
  }

  const explorerUrl = resolvePortfolioHistoryExplorerUrl(
    item,
    fromAsset,
    toAsset,
    chains,
  );
  if (!explorerUrl) {
    return null;
  }

  return { url: explorerUrl, kind: 'explorer' };
};

const resolvePortfolioHistoryDisplayStatus = (
  input: PortfolioHistoryStatusInput,
): string =>
  typeof input === 'string' ? input : input.displayStatus || input.status;

const isPortfolioHistoryVerificationRequired = (
  input: PortfolioHistoryStatusInput,
): boolean =>
  resolvePortfolioHistoryDisplayStatus(input).trim().toLowerCase() ===
  VERIFICATION_REQUIRED_STATUS;

const getPortfolioHistoryStatusKind = (
  status: PortfolioHistoryStatusInput,
): PortfolioHistoryStatusKind => {
  const normalized = resolvePortfolioHistoryDisplayStatus(status)
    .trim()
    .toLowerCase();
  if (normalized === VERIFICATION_REQUIRED_STATUS) {
    return 'verification_required';
  }
  if (COMPLETED_STATUSES.has(normalized)) {
    return 'completed';
  }
  if (FAILED_STATUSES.has(normalized)) {
    return 'failed';
  }
  return 'pending';
};

const getPortfolioHistoryStatusIcon = (
  status: PortfolioHistoryStatusInput,
): SVGIcons =>
  STATUS_ICONS[getPortfolioHistoryStatusKind(status)];

const getPortfolioHistoryStatusMessageKey = (
  status: PortfolioHistoryStatusInput,
): string =>
  STATUS_MESSAGE_KEYS[getPortfolioHistoryStatusKind(status)];

const resolvePortfolioHistoryFailureCodeMessageKey = (
  failureCode: PortfolioFailureCode | null,
): string | null =>
  failureCode ? `portfolio_history_failure_${failureCode}` : null;

const resolvePortfolioHistoryFailureActionMessageKey = (
  failureAction: PortfolioFailureAction | null,
): string | null =>
  failureAction ? `portfolio_history_failure_action_${failureAction}` : null;

/**
 * Returns a support URL only when the suggested action is `contact_support`
 * and the API provided one. Distinct from `providerStatusUrl`.
 */
const resolvePortfolioHistorySupportActionUrl = (
  item: Pick<PortfolioHistoryItem, 'failureAction' | 'supportUrl'>,
): string | null => {
  if (item.failureAction !== 'contact_support') {
    return null;
  }

  return item.supportUrl?.trim() || null;
};

const MAILTO_SCHEME = 'mailto:';

const appendPortfolioHistorySupportMailtoLine = (
  lines: string[],
  label: string,
  value: string | null | undefined,
): void => {
  const trimmed = value?.trim();
  if (trimmed) {
    lines.push(`${label}: ${trimmed}`);
  }
};

const formatPortfolioHistorySupportAmountLine = (
  amount: string | null | undefined,
  symbol: string,
  label: string,
): string | null => {
  const trimmedAmount = amount?.trim();
  const trimmedSymbol = symbol.trim();
  if (!trimmedAmount) {
    return null;
  }

  return `${label}: ${trimmedAmount}${trimmedSymbol ? ` ${trimmedSymbol}` : ''}`;
};

const buildPortfolioHistorySupportMailtoSubject = (
  context: PortfolioHistorySupportMailtoContext,
): string => {
  const { item } = context;
  const exchangeId = item.providerReferenceId?.trim();
  const providerLabel = item.providerName?.trim() || item.provider.trim();

  if (exchangeId) {
    return `Compliance review - Exchange ${exchangeId}`;
  }

  if (providerLabel) {
    return `Exchange support - ${providerLabel}`;
  }

  return 'Exchange support request';
};

const PORTFOLIO_HISTORY_SUPPORT_MAILTO_INTRO_COMPLIANCE =
  'My swap appears to be stuck due to KYC/compliance verification. Could you please advise on the next steps?';

const PORTFOLIO_HISTORY_SUPPORT_MAILTO_INTRO_DEFAULT =
  'I am writing regarding an exchange transaction and would appreciate your assistance in reviewing the details below.';

const buildPortfolioHistorySupportMailtoBody = (
  context: PortfolioHistorySupportMailtoContext,
): string => {
  const { item, fromSymbol, toSymbol } = context;
  const intro = isPortfolioHistoryVerificationRequired(item)
    ? PORTFOLIO_HISTORY_SUPPORT_MAILTO_INTRO_COMPLIANCE
    : PORTFOLIO_HISTORY_SUPPORT_MAILTO_INTRO_DEFAULT;
  const lines = ['Hello,', '', intro, ''];

  appendPortfolioHistorySupportMailtoLine(
    lines,
    'Exchange ID',
    item.providerReferenceId,
  );

  const fromAmountLine = formatPortfolioHistorySupportAmountLine(
    item.fromAmount,
    fromSymbol,
    'From amount',
  );
  if (fromAmountLine) {
    lines.push(fromAmountLine);
  }

  const toAmountLine = formatPortfolioHistorySupportAmountLine(
    item.toAmount,
    toSymbol,
    'To amount',
  );
  if (toAmountLine) {
    lines.push(toAmountLine);
  }

  appendPortfolioHistorySupportMailtoLine(lines, 'From address', item.fromAddress);
  appendPortfolioHistorySupportMailtoLine(lines, 'To address', item.toAddress);

  lines.push('', 'Thank you for your assistance.');
  return lines.join('\r\n');
};

const encodeMailtoQueryValue = (value: string): string =>
  encodeURIComponent(value).replace(/%0A/g, '%0D%0A');

const parseMailtoQueryString = (query: string): Record<string, string> => {
  if (!query.trim()) {
    return {};
  }

  const parsed: Record<string, string> = {};
  const params = new URLSearchParams(query);
  params.forEach((value, key) => {
    parsed[key] = value;
  });
  return parsed;
};

const buildMailtoQueryString = (params: Record<string, string>): string =>
  Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeMailtoQueryValue(value)}`,
    )
    .join('&');

const buildPortfolioHistorySupportMailtoUrl = (
  supportUrl: string,
  context: PortfolioHistorySupportMailtoContext,
): string => {
  const trimmedUrl = supportUrl.trim();
  if (!trimmedUrl.toLowerCase().startsWith(MAILTO_SCHEME)) {
    return trimmedUrl;
  }

  const withoutScheme = trimmedUrl.slice(MAILTO_SCHEME.length);
  const queryIndex = withoutScheme.indexOf('?');
  const address =
    queryIndex >= 0 ? withoutScheme.slice(0, queryIndex) : withoutScheme;
  const existingQuery =
    queryIndex >= 0 ? withoutScheme.slice(queryIndex + 1) : '';
  const queryParams = parseMailtoQueryString(existingQuery);

  if (!queryParams.subject?.trim()) {
    queryParams.subject = buildPortfolioHistorySupportMailtoSubject(context);
  }

  const enrichedBody = buildPortfolioHistorySupportMailtoBody(context);
  const existingBody = queryParams.body?.trim();
  queryParams.body = existingBody
    ? `${existingBody}\r\n\r\n${enrichedBody}`
    : enrichedBody;

  const query = buildMailtoQueryString(queryParams);
  return query ? `${MAILTO_SCHEME}${address}?${query}` : `${MAILTO_SCHEME}${address}`;
};

const openPortfolioHistorySupportUrl = (
  url: string,
  context?: PortfolioHistorySupportMailtoContext,
): void => {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return;
  }

  const resolvedUrl =
    trimmedUrl.toLowerCase().startsWith(MAILTO_SCHEME) && context
      ? buildPortfolioHistorySupportMailtoUrl(trimmedUrl, context)
      : trimmedUrl;

  if (resolvedUrl.toLowerCase().startsWith(MAILTO_SCHEME)) {
    window.open(resolvedUrl);
    return;
  }

  chrome.tabs.create({ url: resolvedUrl });
};

const resolvePortfolioHistoryStatusLabelKey = (
  item: Pick<PortfolioHistoryItem, 'status' | 'failureCode'> &
    Partial<Pick<PortfolioHistoryItem, 'displayStatus'>>,
): string => {
  const statusKind = getPortfolioHistoryStatusKind(item);
  const failureKey = resolvePortfolioHistoryFailureCodeMessageKey(item.failureCode);

  if (
    failureKey &&
    (statusKind === 'failed' || statusKind === 'verification_required')
  ) {
    return failureKey;
  }

  return getPortfolioHistoryStatusMessageKey(item);
};

const isCreatedOrExpiredHistoryStatus = (
  status: PortfolioHistoryStatusInput,
): boolean =>
  CREATED_OR_EXPIRED_STATUSES.has(
    resolvePortfolioHistoryDisplayStatus(status).trim().toLowerCase(),
  );

const formatPortfolioHistoryAmount = (amount: string | null): string => {
  if (!amount) {
    return '';
  }

  const normalized = amount.replace(/,/g, '').trim();
  if (!normalized || !Number.isFinite(Number(normalized))) {
    return amount;
  }

  return FormatUtils.withCommas(normalized, 6, true);
};

/**
 * Prefers the provider-reported fill when status refresh has persisted one.
 * Falls back to the quote estimate (`toAmount`) until then.
 */
const resolvePortfolioHistoryDisplayToAmount = (
  item: Pick<PortfolioHistoryItem, 'toAmount' | 'receivedAmount'>,
): string | null => {
  const receivedAmount = item.receivedAmount?.trim();
  if (receivedAmount) {
    return receivedAmount;
  }

  return item.toAmount;
};

const resolvePortfolioAssetById = (
  assetId: string | null,
  assets: PortfolioCanonicalAsset[],
  hiveEngineTokenLogoUrls: Record<string, string> = {},
): PortfolioCanonicalAsset | undefined => {
  const trimmedAssetId = assetId?.trim();
  if (!trimmedAssetId) {
    return undefined;
  }
  const normalizedAssetId = trimmedAssetId.toLowerCase();

  const asset = assets.find(
    (asset) => asset.assetId.trim().toLowerCase() === normalizedAssetId,
  );
  if (asset) {
    const hiveEngineLogoUrl =
      asset.ecosystem === 'hive_engine'
        ? hiveEngineTokenLogoUrls[asset.symbol.toUpperCase()]
        : undefined;
    return hiveEngineLogoUrl && !asset.logoUrl
      ? { ...asset, logoUrl: hiveEngineLogoUrl }
      : asset;
  }

  const hiveEngineSymbol = getPortfolioHistoryHiveEngineAssetSymbol(assetId);
  if (hiveEngineSymbol) {
    return {
      assetId: trimmedAssetId,
      ecosystem: 'hive_engine',
      symbol: hiveEngineSymbol,
      name: hiveEngineSymbol,
      chainId: 'hive_engine',
      address: null,
      decimals: null,
      isNative: false,
      familyId: `hive_engine:${hiveEngineSymbol.toLowerCase()}`,
      logoUrl: hiveEngineTokenLogoUrls[hiveEngineSymbol] ?? null,
      priceUsd: 0,
      rankScore: 0,
    };
  }

  const hiveSymbol = getPortfolioHistoryHiveAssetSymbol(assetId);
  if (hiveSymbol) {
    return {
      assetId: trimmedAssetId,
      ecosystem: 'hive',
      symbol: hiveSymbol,
      name: hiveSymbol,
      chainId: 'hive',
      address: null,
      decimals: 3,
      isNative: true,
      familyId: `hive:${hiveSymbol.toLowerCase()}`,
      logoUrl: null,
      priceUsd: 0,
      rankScore: 0,
    };
  }

  return undefined;
};

const getPortfolioHistoryHiveEngineAssetSymbol = (
  assetId: string | null,
): string | null => {
  const normalizedAssetId = assetId?.trim() ?? '';
  const lowerAssetId = normalizedAssetId.toLowerCase();
  const prefix = HIVE_ENGINE_ASSET_ID_PREFIXES.find((candidate) =>
    lowerAssetId.startsWith(candidate),
  );
  if (!prefix) {
    return null;
  }

  const symbol = normalizedAssetId.slice(prefix.length).trim().toUpperCase();
  return symbol || null;
};

const getPortfolioHistoryHiveAssetSymbol = (
  assetId: string | null,
): string | null => {
  const normalizedAssetId = assetId?.trim() ?? '';
  const lowerAssetId = normalizedAssetId.toLowerCase();
  const prefix = ['hive:', 'hive-'].find((candidate) =>
    lowerAssetId.startsWith(candidate),
  );
  if (!prefix) {
    return null;
  }

  const symbol = normalizedAssetId.slice(prefix.length).trim().toUpperCase();
  return HIVE_CORE_SYMBOLS.has(symbol) ? symbol : null;
};

const getPortfolioHistoryAssetSymbol = (
  assetId: string | null,
  asset?: PortfolioCanonicalAsset,
  fiatCurrency?: string | null,
): string => {
  if (asset?.symbol) {
    return asset.symbol;
  }

  if (!assetId) {
    const fiatSymbol = fiatCurrency?.trim();
    return fiatSymbol ? fiatSymbol.toUpperCase() : '';
  }

  const hiveSymbol =
    getPortfolioHistoryHiveAssetSymbol(assetId) ??
    getPortfolioHistoryHiveEngineAssetSymbol(assetId);
  if (hiveSymbol) {
    return hiveSymbol;
  }

  const tail = assetId.split(':').filter(Boolean).pop() ?? assetId;
  if (EVM_CONTRACT_ADDRESS_PATTERN.test(tail)) {
    return FormatUtils.shortenString(tail, 4);
  }

  return tail.toUpperCase();
};

const appendPortfolioHistorySearchableValues = (
  values: string[],
  value: unknown,
): void => {
  if (value == null) {
    return;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) {
      values.push(trimmed);
    }
    return;
  }
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    values.push(String(value));
    return;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      appendPortfolioHistorySearchableValues(values, entry);
    }
    return;
  }
  if (typeof value === 'object') {
    for (const entry of Object.values(value as Record<string, unknown>)) {
      appendPortfolioHistorySearchableValues(values, entry);
    }
  }
};

const doesPortfolioHistoryItemMatchTextFilter = (
  item: PortfolioHistoryItem,
  textFilter: string,
): boolean => {
  const needle = textFilter.trim().toLowerCase();
  if (!needle) {
    return true;
  }

  const values: string[] = [];
  appendPortfolioHistorySearchableValues(values, item);

  const fromSymbol = getPortfolioHistoryAssetSymbol(
    item.fromAssetId,
    undefined,
    item.fiatCurrency,
  );
  const toSymbol = getPortfolioHistoryAssetSymbol(
    item.toAssetId,
    undefined,
    item.fiatCurrency,
  );
  if (fromSymbol) {
    values.push(fromSymbol);
  }
  if (toSymbol) {
    values.push(toSymbol);
  }

  return values.some((value) => value.toLowerCase().includes(needle));
};

export const PortfolioHistoryDisplayUtils = {
  resolvePortfolioHistoryDisplayStatus,
  isPortfolioHistoryVerificationRequired,
  getPortfolioHistoryStatusKind,
  getPortfolioHistoryStatusIcon,
  getPortfolioHistoryStatusMessageKey,
  resolvePortfolioHistoryFailureCodeMessageKey,
  resolvePortfolioHistoryFailureActionMessageKey,
  resolvePortfolioHistorySupportActionUrl,
  buildPortfolioHistorySupportMailtoUrl,
  openPortfolioHistorySupportUrl,
  resolvePortfolioHistoryStatusLabelKey,
  isCreatedOrExpiredHistoryStatus,
  formatPortfolioHistoryAmount,
  resolvePortfolioHistoryDisplayToAmount,
  resolvePortfolioAssetById,
  getPortfolioHistoryHiveEngineAssetSymbol,
  getPortfolioHistoryAssetSymbol,
  doesPortfolioHistoryItemMatchTextFilter,
  resolvePortfolioHistoryExplorerUrl,
  resolvePortfolioHistoryStatusLink,
};
