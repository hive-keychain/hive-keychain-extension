import {
  TokenPriceChartPoint,
  TokenPriceChartSeries,
  TokenPriceHistory,
  WalletTokenPriceChartUtils,
} from '@common-ui/wallet-token-price-chart/wallet-token-price-chart.utils';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { I18nUtils } from 'src/utils/i18n.utils';

interface Props {
  symbol: string;
  /** Optional real series — falls back to deterministic fake data when no live history is passed. */
  points?: TokenPriceChartPoint[];
  currentPrice?: number;
  changePercent?: number;
  currencyPrefix?: string;
  /** Live EVM history. When set, fake data is not used. */
  priceHistory?: TokenPriceHistory | null;
  priceHistoryLoading?: boolean;
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
  priceHistory,
  priceHistoryLoading = false,
}: Props) => {
  const [activeIndex, setActiveIndex] = useState<number>();
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const canvasRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipPlacement, setTooltipPlacement] = useState({
    left: 0,
    placeBelow: false,
    ready: false,
  });
  const isLiveChart = priceHistory !== undefined || priceHistoryLoading;
  const liveCategories = priceHistory?.categories ?? [];
  const shouldShowCategorySelector =
    isLiveChart &&
    liveCategories.length > 0 &&
    !(
      liveCategories.length === 1 &&
      liveCategories[0].toLowerCase() === '24h'
    );

  useEffect(() => {
    if (!priceHistory) {
      return;
    }
    setSelectedCategory((current) => {
      if (current && priceHistory.categories.includes(current)) {
        return current;
      }
      return WalletTokenPriceChartUtils.getDefaultPriceHistoryCategory(
        priceHistory.categories,
      );
    });
    setActiveIndex(undefined);
  }, [priceHistory]);

  const resolvedCategory =
    selectedCategory && liveCategories.includes(selectedCategory)
      ? selectedCategory
      : WalletTokenPriceChartUtils.getDefaultPriceHistoryCategory(
          liveCategories,
        );
  const livePoints =
    resolvedCategory && priceHistory
      ? priceHistory.seriesByCategory[resolvedCategory]
      : undefined;
  const series: TokenPriceChartSeries | undefined = isLiveChart
    ? livePoints && livePoints.length > 1
      ? WalletTokenPriceChartUtils.getSeriesFromPoints(livePoints)
      : undefined
    : resolveSeries(symbol, points, currentPrice, changePercent);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const tooltip = tooltipRef.current;
    if (!series || activeIndex === undefined || !canvas || !tooltip) {
      return;
    }

    const coordinate = buildChartGeometry(series.points).coordinates[activeIndex];
    if (!coordinate || canvas.clientWidth <= 0) {
      return;
    }

    const left = WalletTokenPriceChartUtils.getClampedTooltipCenter(
      coordinate.x / CHART_WIDTH,
      canvas.clientWidth,
      tooltip.offsetWidth,
    );
    const pointY = (coordinate.y / CHART_HEIGHT) * canvas.clientHeight;
    const placeBelow = WalletTokenPriceChartUtils.shouldPlaceTooltipBelow(
      pointY,
      tooltip.offsetHeight,
    );

    setTooltipPlacement((current) => {
      if (
        current.ready &&
        current.left === left &&
        current.placeBelow === placeBelow
      ) {
        return current;
      }
      return { left, placeBelow, ready: true };
    });
  }, [activeIndex, series]);

  if (!series && priceHistoryLoading) {
    return (
      <div
        className="wallet-token-price-chart wallet-token-price-chart__loading"
        data-testid={`wallet-token-price-chart-${symbol}`}
        aria-label={I18nUtils.getMessage('popup_html_loading')}
        aria-busy="true">
        <div
          className="wallet-token-price-chart__loading-header"
          aria-hidden="true">
          <div className="wallet-token-price-chart__loading-price-block">
            <div className="wallet-token-price-chart__loading-bar label" />
            <div className="wallet-token-price-chart__loading-bar price" />
          </div>
          <div className="wallet-token-price-chart__loading-change-block">
            <div className="wallet-token-price-chart__loading-bar change" />
            <div className="wallet-token-price-chart__loading-bar period" />
          </div>
        </div>
        <div
          className="wallet-token-price-chart__loading-canvas"
          data-testid={`wallet-token-price-chart-loading-${symbol}`}
          aria-hidden="true">
          <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
            <path d="M0 116 C42 104, 64 124, 104 92 S172 78, 208 88 S270 40, 320 54" />
          </svg>
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div
        className="wallet-token-price-chart"
        data-testid={`wallet-token-price-chart-${symbol}`}>
        <div
          className="wallet-token-price-chart__status"
          data-testid={`wallet-token-price-chart-status-${symbol}`}>
          <svg
            className="wallet-token-price-chart__status-icon"
            data-testid={`wallet-token-price-chart-status-icon-${symbol}`}
            viewBox="0 0 24 24"
            aria-hidden="true">
            <path d="M4 19V5M4 19H20M7 15L11 11L14 14L20 8" />
          </svg>
          {I18nUtils.getMessage('wallet_token_price_unavailable')}
        </div>
      </div>
    );
  }

  const periodLabel =
    isLiveChart && resolvedCategory
      ? resolvedCategory
      : I18nUtils.getMessage('wallet_token_price_change_24h');
  const { linePath, areaPath, coordinates, stepX } = buildChartGeometry(
    series.points,
  );
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

  const activateNearestPoint = (event: React.MouseEvent<SVGSVGElement>) => {
    const svg = event.currentTarget;
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
            {periodLabel}
          </span>
        </div>
      </div>
      <div className="wallet-token-price-chart__canvas" ref={canvasRef}>
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
            ref={tooltipRef}
            className="wallet-token-price-chart__tooltip"
            data-testid={`wallet-token-price-chart-tooltip-${symbol}`}
            style={
              tooltipPlacement.ready
                ? {
                    left: tooltipPlacement.left,
                    top: `${(activeCoordinate.y / CHART_HEIGHT) * 100}%`,
                    transform: tooltipPlacement.placeBelow
                      ? 'translate(-50%, 12px)'
                      : 'translate(-50%, calc(-100% - 10px))',
                  }
                : {
                    left: `${(activeCoordinate.x / CHART_WIDTH) * 100}%`,
                    top: `${(activeCoordinate.y / CHART_HEIGHT) * 100}%`,
                    visibility: 'hidden',
                  }
            }>
            <div className="wallet-token-price-chart__tooltip-price">
              {currencyPrefix}
              {formatUsdPrice(activeCoordinate.point.price)}
            </div>
            <div className="wallet-token-price-chart__tooltip-time">
              {formatChartTimestamp(activeCoordinate.point.timestamp)}
            </div>
          </div>
        )}
        {shouldShowCategorySelector && (
          <div
            className="wallet-token-price-chart__categories"
            role="tablist"
            data-testid={`wallet-token-price-chart-categories-${symbol}`}>
            {liveCategories.map((category) => (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={category === resolvedCategory}
                className={`wallet-token-price-chart__category ${
                  category === resolvedCategory ? 'selected' : ''
                }`}
                data-testid={`wallet-token-price-chart-category-${symbol}-${category}`}
                onClick={() => {
                  setSelectedCategory(category);
                  setActiveIndex(undefined);
                }}>
                {category}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
