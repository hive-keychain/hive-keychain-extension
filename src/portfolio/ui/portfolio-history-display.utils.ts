import { SVGIcons } from 'src/common-ui/icons.enum';
import { PortfolioCanonicalAsset } from 'src/portfolio/portfolio-api.interface';
import FormatUtils from 'src/utils/format.utils';

export type PortfolioHistoryStatusKind = 'completed' | 'failed' | 'pending';

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

const getPortfolioHistoryStatusKind = (
  status: string,
): PortfolioHistoryStatusKind => {
  const normalized = status.trim().toLowerCase();
  if (COMPLETED_STATUSES.has(normalized)) {
    return 'completed';
  }
  if (FAILED_STATUSES.has(normalized)) {
    return 'failed';
  }
  return 'pending';
};

const getPortfolioHistoryStatusIcon = (status: string): SVGIcons =>
  STATUS_ICONS[getPortfolioHistoryStatusKind(status)];

const getPortfolioHistoryStatusMessageKey = (status: string): string =>
  STATUS_MESSAGE_KEYS[getPortfolioHistoryStatusKind(status)];

const isCreatedOrExpiredHistoryStatus = (status: string): boolean =>
  CREATED_OR_EXPIRED_STATUSES.has(status.trim().toLowerCase());

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
  getPortfolioHistoryStatusKind,
  getPortfolioHistoryStatusIcon,
  getPortfolioHistoryStatusMessageKey,
  isCreatedOrExpiredHistoryStatus,
  formatPortfolioHistoryAmount,
  resolvePortfolioAssetById,
  getPortfolioHistoryAssetSymbol,
};
