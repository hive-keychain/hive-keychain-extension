import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { WalletTokenPriceChart } from 'src/common-ui/wallet-token-price-chart/wallet-token-price-chart.component';
import { WalletTokenPriceChartUtils } from 'src/common-ui/wallet-token-price-chart/wallet-token-price-chart.utils';
import { I18nUtils } from 'src/utils/i18n.utils';

describe('WalletTokenPriceChart', () => {
  beforeEach(() => {
    I18nUtils.getMessage = jest.fn((key: string) => key);
  });

  it('renders fake current price and chart for a symbol', () => {
    const series = WalletTokenPriceChartUtils.buildFakeTokenPriceSeries('ETH');

    render(<WalletTokenPriceChart symbol="ETH" />);

    expect(screen.getByTestId('wallet-token-price-chart-ETH')).toBeInTheDocument();
    expect(screen.getByTestId('wallet-token-price-chart-price-ETH')).toHaveTextContent(
      '$',
    );
    expect(screen.getByTestId('wallet-token-price-chart-change-ETH')).toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.queryByText('CoinGecko')).not.toBeInTheDocument();
    expect(
      screen.queryByText('wallet_token_price_data_provided_by'),
    ).not.toBeInTheDocument();
    expect(series.points.length).toBeGreaterThan(1);
    expect(
      screen.queryByTestId(/wallet-token-price-chart-dot-ETH-/),
    ).not.toBeInTheDocument();
  });

  it('uses provided points and current price when available', () => {
    render(
      <WalletTokenPriceChart
        symbol="HIVE"
        currentPrice={0.42}
        changePercent={-1.5}
        points={[
          { timestamp: 1, price: 0.4 },
          { timestamp: 2, price: 0.42 },
        ]}
      />,
    );

    expect(screen.getByTestId('wallet-token-price-chart-price-HIVE')).toHaveTextContent(
      '$0.42',
    );
    expect(screen.getByTestId('wallet-token-price-chart-change-HIVE')).toHaveTextContent(
      '-1.50%',
    );
  });

  it('shows point details in a tooltip when the chart is hovered without changing the header price', () => {
    const timestamp = Date.UTC(2026, 8, 24, 10, 30);

    render(
      <WalletTokenPriceChart
        symbol="DAI"
        currentPrice={1.01}
        points={[
          { timestamp, price: 0.99 },
          { timestamp: timestamp + 60_000, price: 1.01 },
        ]}
      />,
    );

    expect(
      screen.getByTestId('wallet-token-price-chart-price-DAI'),
    ).toHaveTextContent('$1.01');

    const svg = screen.getByTestId('wallet-token-price-chart-svg-DAI');
    svg.getBoundingClientRect = () =>
      ({
        left: 0,
        width: 320,
        top: 0,
        height: 148,
        right: 320,
        bottom: 148,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
    fireEvent.mouseMove(svg, { clientX: 0, clientY: 40 });

    expect(
      screen.getByTestId('wallet-token-price-chart-tooltip-DAI'),
    ).toHaveTextContent('$0.99');
    expect(
      screen.getByTestId('wallet-token-price-chart-price-DAI'),
    ).toHaveTextContent('$1.01');
  });

  it('lists every history category and switches the series without using fake data', async () => {
    const user = userEvent.setup();
    const priceHistory = WalletTokenPriceChartUtils.parsePriceHistoryPayload({
      '7d': [
        ['2026-09-22T00:00:00.000Z', 4],
        ['2026-09-28T00:00:00.000Z', 2],
      ],
      '24h': [
        ['2026-09-28T00:00:00.000Z', 1],
        ['2026-09-28T12:00:00.000Z', 1.5],
      ],
      ignored: 'not-a-series',
    });

    render(
      <WalletTokenPriceChart symbol="USDC" priceHistory={priceHistory} />,
    );

    expect(priceHistory.categories).toEqual(['7d', '24h']);
    expect(
      screen.getByTestId('wallet-token-price-chart-category-USDC-24h'),
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByTestId('wallet-token-price-chart-price-USDC'),
    ).toHaveTextContent('$1.50');
    expect(
      screen.getByTestId('wallet-token-price-chart-change-USDC'),
    ).toHaveTextContent('+50.00%');
    expect(
      screen.getByTestId('wallet-token-price-chart-change-USDC'),
    ).toHaveTextContent('24h');

    await user.click(
      screen.getByTestId('wallet-token-price-chart-category-USDC-7d'),
    );

    expect(
      screen.getByTestId('wallet-token-price-chart-price-USDC'),
    ).toHaveTextContent('$2.00');
    expect(
      screen.getByTestId('wallet-token-price-chart-change-USDC'),
    ).toHaveTextContent('-50.00%');
    expect(
      screen.getByTestId('wallet-token-price-chart-change-USDC'),
    ).toHaveTextContent('7d');
  });

  it('hides the category selector when only 24h history is available', () => {
    render(
      <WalletTokenPriceChart
        symbol="HIVE"
        priceHistory={{
          categories: ['24h'],
          seriesByCategory: {
            '24h': [
              { timestamp: 1, price: 0.2 },
              { timestamp: 2, price: 0.25 },
            ],
          },
        }}
      />,
    );

    expect(
      screen.getByTestId('wallet-token-price-chart-svg-HIVE'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('wallet-token-price-chart-categories-HIVE'),
    ).not.toBeInTheDocument();
  });

  it('shows a chart-shaped loading placeholder while live history loads', () => {
    render(
      <WalletTokenPriceChart symbol="ETH" priceHistoryLoading />,
    );

    expect(screen.getByTestId('wallet-token-price-chart-ETH')).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(
      screen.getByTestId('wallet-token-price-chart-loading-ETH'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('wallet-token-price-chart-status-ETH'),
    ).not.toBeInTheDocument();
  });

  it('keeps the tooltip inside the chart near the horizontal edges', () => {
    expect(
      WalletTokenPriceChartUtils.getClampedTooltipCenter(1, 320, 120),
    ).toBe(320 - 60 - 8);
    expect(
      WalletTokenPriceChartUtils.getClampedTooltipCenter(0, 320, 120),
    ).toBe(60 + 8);
    expect(
      WalletTokenPriceChartUtils.getClampedTooltipCenter(0.5, 320, 120),
    ).toBe(160);
  });

  it('places the tooltip below points that sit too close to the top edge', () => {
    expect(WalletTokenPriceChartUtils.shouldPlaceTooltipBelow(8, 40)).toBe(
      true,
    );
    expect(WalletTokenPriceChartUtils.shouldPlaceTooltipBelow(80, 40)).toBe(
      false,
    );
  });

  it('builds Hive, Hive Power, and HBD chart paths and leaves other symbols unset', () => {
    expect(WalletTokenPriceChartUtils.buildHivePriceHistoryPath('HIVE')).toBe(
      'hive/v2/price/hive/history',
    );
    expect(WalletTokenPriceChartUtils.buildHivePriceHistoryPath('HP')).toBe(
      'hive/v2/price/hive/history',
    );
    expect(
      WalletTokenPriceChartUtils.buildHivePriceHistoryPath('SWAP.HIVE'),
    ).toBe('hive/v2/price/hive/history');
    expect(WalletTokenPriceChartUtils.buildHivePriceHistoryPath('hbd')).toBe(
      'hive/v2/price/hbd/history',
    );
    expect(
      WalletTokenPriceChartUtils.buildHivePriceHistoryPath('BEE'),
    ).toBeUndefined();
  });

  it('builds the hourly Hive Engine candle URL', () => {
    expect(WalletTokenPriceChartUtils.buildHiveEngineOhlcvUrl(' bee ')).toBe(
      'https://info-api.tribaldex.com/market/ohlcv?symbol=BEE&interval=hourly',
    );
  });

  it('prices 24h and 7d closes with the matching HIVE series', () => {
    const now = Date.parse('2026-10-01T04:00:00.000Z');
    const history = WalletTokenPriceChartUtils.buildHiveEnginePriceHistory(
      [
        { timestamp: (now - 8 * 24 * 60 * 60 * 1000) / 1000, close: '9' },
        { timestamp: (now - 48 * 60 * 60 * 1000) / 1000, close: '9' },
        { timestamp: (now - 2 * 60 * 60 * 1000) / 1000, close: '2' },
        { timestamp: (now - 60 * 1000) / 1000, close: '4' },
      ],
      {
        '24h': [
          { timestamp: now - 3 * 60 * 60 * 1000, price: 0.5 },
          { timestamp: now - 30 * 60 * 1000, price: 1 },
        ],
        '7d': [{ timestamp: now - 3 * 24 * 60 * 60 * 1000, price: 2 }],
      },
      undefined,
      now,
    );

    expect(history.categories).toEqual(['24h', '7d']);
    expect(history.seriesByCategory['24h']).toEqual([
      { timestamp: now - 2 * 60 * 60 * 1000, price: 1 },
      { timestamp: now - 60 * 1000, price: 4 },
    ]);
    expect(history.seriesByCategory['7d']).toEqual([
      { timestamp: now - 48 * 60 * 60 * 1000, price: 18 },
      { timestamp: now - 2 * 60 * 60 * 1000, price: 4 },
      { timestamp: now - 60 * 1000, price: 8 },
    ]);
  });

  it('keeps 24 hourly closes for 24h and a week of closes for 7d', () => {
    const now = Date.parse('2026-10-01T04:00:00.000Z');
    const candles = Array.from({ length: 25 }, (_, index) => ({
      timestamp: (now - (25 - index) * 30 * 60 * 1000) / 1000,
      close: '1',
    }));
    const history = WalletTokenPriceChartUtils.buildHiveEnginePriceHistory(
      candles,
      {},
      1,
      now,
    );

    expect(history.seriesByCategory['24h']).toHaveLength(24);
    expect(history.seriesByCategory['24h']?.[0]?.timestamp).toBe(
      now - 24 * 30 * 60 * 1000,
    );
    expect(history.seriesByCategory['7d']).toHaveLength(25);
  });

  it('uses the current HIVE price when HIVE history is missing', () => {
    const now = Date.parse('2026-10-01T04:00:00.000Z');
    const history = WalletTokenPriceChartUtils.buildHiveEnginePriceHistory(
      [
        { timestamp: Math.floor((now - 120_000) / 1000), close: '1' },
        { timestamp: Math.floor((now - 60_000) / 1000), close: '2' },
      ],
      {},
      0.25,
      now,
    );

    expect(history.seriesByCategory['24h']?.[1]?.price).toBe(0.5);
    expect(history.seriesByCategory['7d']?.[1]?.price).toBe(0.5);
  });

  it('shows an empty state when live history has no categories', () => {
    render(
      <WalletTokenPriceChart
        symbol="USDC"
        priceHistory={{ categories: [], seriesByCategory: {} }}
      />,
    );

    expect(
      screen.getByTestId('wallet-token-price-chart-status-USDC'),
    ).toHaveTextContent('wallet_token_price_unavailable');
    expect(
      screen.getByTestId('wallet-token-price-chart-status-icon-USDC'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
