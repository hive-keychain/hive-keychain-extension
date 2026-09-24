import {
  TokenPriceChartPoint,
  TokenPriceChartSeries,
  WalletTokenPriceChartUtils,
} from '@common-ui/wallet-token-price-chart/wallet-token-price-chart.utils';
import React, { useState } from 'react';
import { I18nUtils } from 'src/utils/i18n.utils';

interface Props {
  symbol: string;
  /** Optional real series — falls back to deterministic fake data. */
  points?: TokenPriceChartPoint[];
  currentPrice?: number;
  changePercent?: number;
  currencyPrefix?: string;
}

interface ChartCoordinate {
  x: number;
  y: number;
  point: TokenPriceChartPoint;
  index: number;
}

const CHART_WIDTH = 320;
const CHART_HEIGHT = 148;
const CHART_PADDING_Y = 10;
/** Show every point as a dot when the series is this size or smaller. */
const MAX_VISIBLE_DOTS = 12;

const resolveSeries = (
  symbol: string,
  points?: TokenPriceChartPoint[],
  currentPrice?: number,
  changePercent?: number,
): TokenPriceChartSeries => {
  if (points && points.length > 1) {
    const firstPrice = points[0].price;
    const lastPrice = points[points.length - 1].price;
    return {
      points,
      currentPrice: currentPrice ?? lastPrice,
      changePercent:
        changePercent ??
        (firstPrice === 0 ? 0 : ((lastPrice - firstPrice) / firstPrice) * 100),
    };
  }

  const fakeSeries =
    WalletTokenPriceChartUtils.buildFakeTokenPriceSeries(symbol);
  return {
    points: fakeSeries.points,
    currentPrice: currentPrice ?? fakeSeries.currentPrice,
    changePercent: changePercent ?? fakeSeries.changePercent,
  };
};

const buildChartGeometry = (points: TokenPriceChartPoint[]) => {
  const prices = points.map((point) => point.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;
  const drawableHeight = CHART_HEIGHT - CHART_PADDING_Y * 2;
  const stepX =
    points.length > 1 ? CHART_WIDTH / (points.length - 1) : CHART_WIDTH;

  const coordinates: ChartCoordinate[] = points.map((point, index) => {
    const x = index * stepX;
    const y =
      CHART_PADDING_Y +
      drawableHeight -
      ((point.price - minPrice) / priceRange) * drawableHeight;
    return { x, y, point, index };
  });

  const linePath = coordinates
    .map(
      (coordinate, index) =>
        `${index === 0 ? 'M' : 'L'}${coordinate.x.toFixed(2)} ${coordinate.y.toFixed(2)}`,
    )
    .join(' ');

  const areaPath = `${linePath} L${CHART_WIDTH} ${CHART_HEIGHT} L0 ${CHART_HEIGHT} Z`;

  return { linePath, areaPath, coordinates, stepX };
};

const getVisibleDotIndexes = (pointCount: number): number[] => {
  if (pointCount <= MAX_VISIBLE_DOTS) {
    return Array.from({ length: pointCount }, (_, index) => index);
  }

  const indexes = new Set<number>([0, pointCount - 1]);
  const innerSlots = MAX_VISIBLE_DOTS - 2;
  for (let slot = 1; slot <= innerSlots; slot += 1) {
    const index = Math.round((slot * (pointCount - 1)) / (innerSlots + 1));
    indexes.add(index);
  }

  return Array.from(indexes).sort((left, right) => left - right);
};

const formatUsdPrice = (price: number) => {
  if (price >= 1000) {
    return price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  if (price >= 1) {
    return price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  }
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  });
};

const formatChartTimestamp = (timestamp: number) =>
  new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const WalletTokenPriceChart = ({
  symbol,
  points,
  currentPrice,
  changePercent,
  currencyPrefix = '$',
}: Props) => {
  const [activeIndex, setActiveIndex] = useState<number>();
  const series = resolveSeries(symbol, points, currentPrice, changePercent);
  const { linePath, areaPath, coordinates, stepX } = buildChartGeometry(
    series.points,
  );
  const visibleDotIndexes = getVisibleDotIndexes(coordinates.length);
  const activeCoordinate =
    activeIndex === undefined ? undefined : coordinates[activeIndex];

  const isPositiveChange = series.changePercent >= 0;
  const changeClassName = isPositiveChange ? 'positive' : 'negative';
  const formattedChange = `${isPositiveChange ? '+' : ''}${series.changePercent.toFixed(2)}%`;
  const areaGradientId = `wallet-token-price-chart-area-${symbol.replace(
    /[^a-zA-Z0-9_-]/g,
    '-',
  )}`;

  const clearActivePoint = () => {
    setActiveIndex(undefined);
  };

  const activateNearestPoint = (
    event: React.MouseEvent<SVGSVGElement> | React.FocusEvent<SVGCircleElement>,
  ) => {
    if (!('clientX' in event)) {
      return;
    }

    const svg = event.currentTarget as SVGSVGElement;
    const bounds = svg.getBoundingClientRect();
    if (bounds.width <= 0) {
      return;
    }

    const relativeX = ((event.clientX - bounds.left) / bounds.width) * CHART_WIDTH;
    const nearestIndex = Math.min(
      coordinates.length - 1,
      Math.max(0, Math.round(relativeX / (stepX || CHART_WIDTH))),
    );
    setActiveIndex(nearestIndex);
  };

  return (
    <div
      className="wallet-token-price-chart"
      data-testid={`wallet-token-price-chart-${symbol}`}>
      <div className="wallet-token-price-chart__header">
        <div className="wallet-token-price-chart__price-block">
          <div className="wallet-token-price-chart__label">
            {I18nUtils.getMessage('wallet_token_price_current')}
          </div>
          <div
            className="wallet-token-price-chart__price"
            data-testid={`wallet-token-price-chart-price-${symbol}`}>
            {currencyPrefix}
            {formatUsdPrice(series.currentPrice)}
          </div>
        </div>
        <div
          className={`wallet-token-price-chart__change ${changeClassName}`}
          data-testid={`wallet-token-price-chart-change-${symbol}`}>
          <span>{formattedChange}</span>
          <span className="wallet-token-price-chart__period">
            {I18nUtils.getMessage('wallet_token_price_change_24h')}
          </span>
        </div>
      </div>
      <div className="wallet-token-price-chart__canvas">
        <svg
          className={`wallet-token-price-chart__svg ${changeClassName}`}
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          preserveAspectRatio="none"
          role="img"
          data-testid={`wallet-token-price-chart-svg-${symbol}`}
          aria-label={`${I18nUtils.getMessage('wallet_token_price_current')}: ${currencyPrefix}${formatUsdPrice(series.currentPrice)}`}
          onMouseMove={activateNearestPoint}
          onMouseLeave={clearActivePoint}>
          <defs>
            <linearGradient
              id={areaGradientId}
              x1="0"
              y1="0"
              x2="0"
              y2="1">
              <stop
                className="wallet-token-price-chart__gradient-start"
                offset="0%"
              />
              <stop
                className="wallet-token-price-chart__gradient-end"
                offset="100%"
              />
            </linearGradient>
          </defs>
          <path
            className="wallet-token-price-chart__area"
            d={areaPath}
            fill={`url(#${areaGradientId})`}
          />
          <path
            className="wallet-token-price-chart__line"
            d={linePath}
            fill="none"
          />
          {visibleDotIndexes.map((index) => {
            const coordinate = coordinates[index];
            const isActive = activeIndex === index;
            return (
              <g key={`dot-${coordinate.point.timestamp}-${index}`}>
                <circle
                  className="wallet-token-price-chart__dot-hitbox"
                  cx={coordinate.x}
                  cy={coordinate.y}
                  r={10}
                  tabIndex={0}
                  role="button"
                  aria-label={`${currencyPrefix}${formatUsdPrice(coordinate.point.price)}, ${formatChartTimestamp(coordinate.point.timestamp)}`}
                  data-testid={`wallet-token-price-chart-dot-${symbol}-${index}`}
                  onFocus={() => setActiveIndex(index)}
                  onBlur={clearActivePoint}
                  onMouseEnter={() => setActiveIndex(index)}
                />
                <circle
                  className={`wallet-token-price-chart__dot ${
                    isActive ? 'active' : ''
                  }`}
                  cx={coordinate.x}
                  cy={coordinate.y}
                  r={isActive ? 4.5 : 3}
                  pointerEvents="none"
                />
              </g>
            );
          })}
          {activeCoordinate && (
            <line
              className="wallet-token-price-chart__guide"
              x1={activeCoordinate.x}
              x2={activeCoordinate.x}
              y1={0}
              y2={CHART_HEIGHT}
              pointerEvents="none"
            />
          )}
        </svg>
        {activeCoordinate && (
          <div
            className="wallet-token-price-chart__tooltip"
            data-testid={`wallet-token-price-chart-tooltip-${symbol}`}
            style={{
              left: `${(activeCoordinate.x / CHART_WIDTH) * 100}%`,
              top: `${(activeCoordinate.y / CHART_HEIGHT) * 100}%`,
            }}>
            <div className="wallet-token-price-chart__tooltip-price">
              {currencyPrefix}
              {formatUsdPrice(activeCoordinate.point.price)}
            </div>
            <div className="wallet-token-price-chart__tooltip-time">
              {formatChartTimestamp(activeCoordinate.point.timestamp)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
