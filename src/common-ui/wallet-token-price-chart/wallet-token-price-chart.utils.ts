export interface TokenPriceChartPoint {
  timestamp: number;
  price: number;
}

export interface TokenPriceChartSeries {
  points: TokenPriceChartPoint[];
  currentPrice: number;
  changePercent: number;
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

export const WalletTokenPriceChartUtils = {
  buildFakeTokenPriceSeries,
};
