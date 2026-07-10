import { SVGIcons } from 'src/common-ui/icons.enum';
import {
  PortfolioCanonicalAsset,
  PortfolioFailureAction,
  PortfolioFailureCode,
  PortfolioHistoryItem,
} from 'src/portfolio/portfolio-api.interface';
import FormatUtils from 'src/utils/format.utils';

export type PortfolioHistoryStatusKind = 'completed' | 'failed' | 'pending';
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

const resolvePortfolioAssetById = (
  assetId: string | null,
  assets: PortfolioCanonicalAsset[],
): PortfolioCanonicalAsset | undefined =>
  assetId ? assets.find((asset) => asset.assetId === assetId) : undefined;

const getPortfolioHistoryAssetSymbol = (
  assetId: string | null,
  asset?: PortfolioCanonicalAsset,
): string => {
  if (asset?.symbol) {
    return asset.symbol;
  }

  if (!assetId) {
    return '';
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
  resolvePortfolioHistoryStatusLabelKey,
  isCreatedOrExpiredHistoryStatus,
  formatPortfolioHistoryAmount,
  resolvePortfolioAssetById,
  getPortfolioHistoryAssetSymbol,
};
