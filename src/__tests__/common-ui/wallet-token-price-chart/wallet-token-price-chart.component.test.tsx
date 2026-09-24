import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
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
    const attribution = screen.getByTestId(
      'wallet-token-price-chart-attribution-ETH',
    );
    expect(attribution).toHaveTextContent('wallet_token_price_data_provided_by');
    expect(attribution.querySelector('a')).toHaveAttribute(
      'href',
      'https://www.coingecko.com/?utm_source=hivekeychain&utm_medium=referral',
    );
    expect(attribution.querySelector('a')).toHaveTextContent('CoinGecko');
    expect(series.points.length).toBeGreaterThan(1);
    expect(
      screen.getAllByTestId(/wallet-token-price-chart-dot-ETH-/).length,
    ).toBeGreaterThan(1);
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

  it('shows point details in a tooltip when a chart dot is focused without changing the header price', async () => {
    const user = userEvent.setup();
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

    await user.tab();
    const firstDot = screen.getByTestId('wallet-token-price-chart-dot-DAI-0');
    firstDot.focus();

    expect(
      screen.getByTestId('wallet-token-price-chart-tooltip-DAI'),
    ).toHaveTextContent('$0.99');
    expect(
      screen.getByTestId('wallet-token-price-chart-price-DAI'),
    ).toHaveTextContent('$1.01');
  });
});
