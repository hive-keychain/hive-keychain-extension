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

export type PortfolioHistoryStatusKind = 'completed' | 'failed' | 'pending';
export type PortfolioHistoryStatusLinkKind = 'provider' | 'explorer';

export type PortfolioHistoryStatusLink = {
  url: string;
  kind: PortfolioHistoryStatusLinkKind;
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

const STATUS_ICONS: Record<PortfolioHistoryStatusKind, SVGIcons> = {
  completed: SVGIcons.SWAPS_STATUS_FINISHED,
  failed: SVGIcons.SWAPS_STATUS_CANCELED,
  pending: SVGIcons.SWAPS_STATUS_PROCESSING,
};

const STATUS_MESSAGE_KEYS: Record<PortfolioHistoryStatusKind, string> = {
  completed: 'portfolio_history_status_completed',
  failed: 'portfolio_history_status_failed',
  pending: 'portfolio_history_status_pending',
};

const CREATED_OR_EXPIRED_STATUSES = new Set(['created', 'expired']);

const EVM_CONTRACT_ADDRESS_PATTERN = /^0x[0-9a-f]{40}$/i;
const EVM_TX_HASH_PATTERN = /^0x[a-fA-F0-9]{64}$/;
const HIVE_TX_HASH_PATTERN = /^[a-fA-F0-9]{40}$/;
const HIVE_TX_EXPLORER_BASE_URL = 'https://hivehub.dev/tx';
const HIVE_ENGINE_TX_EXPLORER_BASE_URL = 'https://he.dtools.dev/tx';

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

const getPortfolioHistoryStatusKind = (
  status: PortfolioHistoryStatusInput,
): PortfolioHistoryStatusKind => {
  const normalized = resolvePortfolioHistoryDisplayStatus(status)
    .trim()
    .toLowerCase();
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

const resolvePortfolioHistoryStatusLabelKey = (
  item: Pick<PortfolioHistoryItem, 'status' | 'failureCode'> &
    Partial<Pick<PortfolioHistoryItem, 'displayStatus'>>,
): string => {
  const failureKey = resolvePortfolioHistoryFailureCodeMessageKey(item.failureCode);
  if (failureKey && getPortfolioHistoryStatusKind(item) === 'failed') {
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
): PortfolioCanonicalAsset | undefined =>
  assetId ? assets.find((asset) => asset.assetId === assetId) : undefined;

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

  const tail = assetId.split(':').filter(Boolean).pop() ?? assetId;
  if (EVM_CONTRACT_ADDRESS_PATTERN.test(tail)) {
    return FormatUtils.shortenString(tail, 4);
  }

  return tail.toUpperCase();
};

export const PortfolioHistoryDisplayUtils = {
  resolvePortfolioHistoryDisplayStatus,
  getPortfolioHistoryStatusKind,
  getPortfolioHistoryStatusIcon,
  getPortfolioHistoryStatusMessageKey,
  resolvePortfolioHistoryFailureCodeMessageKey,
  resolvePortfolioHistoryFailureActionMessageKey,
  resolvePortfolioHistorySupportActionUrl,
  resolvePortfolioHistoryStatusLabelKey,
  isCreatedOrExpiredHistoryStatus,
  formatPortfolioHistoryAmount,
  resolvePortfolioHistoryDisplayToAmount,
  resolvePortfolioAssetById,
  getPortfolioHistoryAssetSymbol,
  resolvePortfolioHistoryExplorerUrl,
  resolvePortfolioHistoryStatusLink,
};
