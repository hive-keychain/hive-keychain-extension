export interface TokenPriceChartPoint {
  timestamp: number;
  price: number;
}

export interface TokenPriceChartSeries {
  points: TokenPriceChartPoint[];
  currentPrice: number;
  changePercent: number;
}

export interface TokenPriceHistory {
  categories: string[];
  seriesByCategory: Record<string, TokenPriceChartPoint[]>;
}

const hashSymbol = (symbol: string): number => {
  let hash = 0;
  for (let index = 0; index < symbol.length; index += 1) {
    hash = (hash * 31 + symbol.charCodeAt(index)) >>> 0;
  }
  return hash || 1;
};

/**
 * Deterministic mock series so each token looks different until real data is wired.
 * Uses a jagged random walk (no sine smoothing) so the polyline stays angular.
 */
const buildFakeTokenPriceSeries = (
  symbol: string,
  pointCount = 10,
): TokenPriceChartSeries => {
  const seed = hashSymbol(symbol.trim().toUpperCase() || 'TOKEN');
  const basePrice = 0.05 + (seed % 5000) / 100;
  const now = Date.now();
  const intervalMs = (24 * 60 * 60 * 1000) / Math.max(pointCount - 1, 1);

  const points: TokenPriceChartPoint[] = [];
  let price = basePrice;
  let state = seed;

  const nextUnit = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };

  for (let index = 0; index < pointCount; index += 1) {
    if (index > 0) {
      const direction = nextUnit() > 0.45 ? 1 : -1;
      const magnitude = 0.02 + nextUnit() * 0.07;
      price = Math.max(basePrice * 0.45, price * (1 + direction * magnitude));
    }
    points.push({
      timestamp: now - (pointCount - 1 - index) * intervalMs,
      price,
    });
  }

  const firstPrice = points[0]?.price ?? basePrice;
  const currentPrice = points[points.length - 1]?.price ?? basePrice;
  const changePercent =
    firstPrice === 0 ? 0 : ((currentPrice - firstPrice) / firstPrice) * 100;

  return {
    points,
    currentPrice,
    changePercent,
  };
};

const parsePriceHistoryPayload = (payload: unknown): TokenPriceHistory => {
  if (!payload || typeof payload !== 'object') {
    return { categories: [], seriesByCategory: {} };
  }

  const categories: string[] = [];
  const seriesByCategory: Record<string, TokenPriceChartPoint[]> = {};

  for (const [category, value] of Object.entries(payload)) {
    if (!Array.isArray(value)) {
      continue;
    }

    const points: TokenPriceChartPoint[] = [];
    for (const entry of value) {
      if (!Array.isArray(entry) || entry.length < 2) {
        continue;
      }
      const timestamp = Date.parse(String(entry[0]));
      const price = Number(entry[1]);
      if (!Number.isFinite(timestamp) || !Number.isFinite(price)) {
        continue;
      }
      points.push({ timestamp, price });
    }

    if (points.length > 1) {
      categories.push(category);
      seriesByCategory[category] = points;
    }
  }

  return { categories, seriesByCategory };
};

const HIVE_PRICE_HISTORY_ASSETS: Record<string, string> = {
  HIVE: 'hive',
  HP: 'hive',
  'SWAP.HIVE': 'hive',
  HBD: 'hbd',
};

const HIVE_ENGINE_HISTORY_WINDOW_MS = 24 * 60 * 60 * 1000;

const toTradeTimestampMs = (timestamp: number): number =>
  timestamp > 1e12 ? timestamp : timestamp * 1000;

const hiveUsdAt = (
  points: TokenPriceChartPoint[],
  timestampMs: number,
): number | undefined => {
  let matched: number | undefined;
  for (const point of points) {
    if (point.timestamp > timestampMs) {
      break;
    }
    matched = point.price;
  }
  return matched ?? points[0]?.price;
};

const buildHiveEnginePriceHistory = (
  trades: { timestamp: number; price: string | number }[],
  hiveUsdPoints: TokenPriceChartPoint[],
  fallbackHiveUsd?: number,
  now = Date.now(),
): TokenPriceHistory => {
  const windowStart = now - HIVE_ENGINE_HISTORY_WINDOW_MS;
  const sortedHiveUsd = [...hiveUsdPoints]
    .filter(
      (point) =>
        Number.isFinite(point.timestamp) && Number.isFinite(point.price),
    )
    .sort((left, right) => left.timestamp - right.timestamp);
  const points: TokenPriceChartPoint[] = [];

  const sortedTrades = [...trades].sort(
    (left, right) => left.timestamp - right.timestamp,
  );
  for (const trade of sortedTrades) {
    const timestamp = toTradeTimestampMs(Number(trade.timestamp));
    const swapHivePrice = Number(trade.price);
    if (
      !Number.isFinite(timestamp) ||
      timestamp < windowStart ||
      timestamp > now ||
      !Number.isFinite(swapHivePrice) ||
      swapHivePrice <= 0
    ) {
      continue;
    }

    const hiveUsd = sortedHiveUsd.length
      ? hiveUsdAt(sortedHiveUsd, timestamp)
      : fallbackHiveUsd;
    if (hiveUsd === undefined || !Number.isFinite(hiveUsd) || hiveUsd <= 0) {
      continue;
    }

    points.push({
      timestamp,
      price: swapHivePrice * hiveUsd,
    });
  }

  if (points.length < 2) {
    return { categories: [], seriesByCategory: {} };
  }

  return {
    categories: ['24h'],
    seriesByCategory: { '24h': points },
  };
};

const buildHivePriceHistoryPath = (symbol: string): string | undefined => {
  const asset = HIVE_PRICE_HISTORY_ASSETS[symbol.trim().toUpperCase()];
  if (!asset) {
    return undefined;
  }
  return `hive/v2/price/${asset}/history`;
};

const buildEvmPriceHistoryPath = (
  chainId: string,
  contractAddress?: string,
): string | undefined => {
  const decimalChainId = Number(chainId);
  if (!Number.isFinite(decimalChainId)) {
    return undefined;
  }

  const chainSegment = String(decimalChainId);
  if (!contractAddress) {
    return `price/${chainSegment}/history`;
  }

  return `price/${chainSegment}/${contractAddress.toLowerCase()}/history`;
};

const getDefaultPriceHistoryCategory = (categories: string[]): string | undefined => {
  if (categories.includes('24h')) {
    return '24h';
  }
  return categories[0];
};

const getSeriesFromPoints = (points: TokenPriceChartPoint[]): TokenPriceChartSeries => {
  const firstPrice = points[0]?.price ?? 0;
  const currentPrice = points[points.length - 1]?.price ?? 0;
  const changePercent =
    firstPrice === 0 ? 0 : ((currentPrice - firstPrice) / firstPrice) * 100;

  return { points, currentPrice, changePercent };
};

const getClampedTooltipCenter = (
  pointRatio: number,
  canvasWidth: number,
  tooltipWidth: number,
  padding = 8,
): number => {
  const center = pointRatio * canvasWidth;
  const half = tooltipWidth / 2;
  const minCenter = half + padding;
  const maxCenter = canvasWidth - half - padding;
  if (maxCenter < minCenter) {
    return canvasWidth / 2;
  }
  return Math.min(maxCenter, Math.max(minCenter, center));
};

const shouldPlaceTooltipBelow = (
  pointY: number,
  tooltipHeight: number,
  gap = 10,
): boolean => pointY < tooltipHeight + gap;

export const WalletTokenPriceChartUtils = {
  buildFakeTokenPriceSeries,
  parsePriceHistoryPayload,
  buildHivePriceHistoryPath,
  buildHiveEnginePriceHistory,
  buildEvmPriceHistoryPath,
  getDefaultPriceHistoryCategory,
  getSeriesFromPoints,
  getClampedTooltipCenter,
  shouldPlaceTooltipBelow,
};
