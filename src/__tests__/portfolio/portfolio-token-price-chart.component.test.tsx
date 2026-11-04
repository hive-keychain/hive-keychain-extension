import { EvmLightNodeApi } from '@api/evm-light-node';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BaseApi } from 'src/api/base';
import { KeychainApi } from 'src/api/keychain';
import { PortfolioTokenPriceChart } from 'src/portfolio/ui/portfolio-token-price-chart.component';

jest.mock('src/api/keychain', () => ({
  KeychainApi: {
    get: jest.fn(),
  },
}));

jest.mock('src/api/base', () => ({
  BaseApi: {
    get: jest.fn(),
  },
}));

jest.mock('@api/evm-light-node', () => ({
  EvmLightNodeApi: {
    get: jest.fn(),
  },
}));

const liveHistory = {
  '24h': [
    ['2026-09-28T00:00:00.000Z', 1],
    ['2026-09-28T01:00:00.000Z', 1.2],
  ],
};

describe('PortfolioTokenPriceChart', () => {
  beforeEach(() => {
    (KeychainApi.get as jest.Mock).mockReset();
    (BaseApi.get as jest.Mock).mockReset();
    (EvmLightNodeApi.get as jest.Mock).mockReset();
    (KeychainApi.get as jest.Mock).mockResolvedValue(liveHistory);
    (EvmLightNodeApi.get as jest.Mock).mockResolvedValue(liveHistory);
    (BaseApi.get as jest.Mock).mockResolvedValue([]);
  });

  it('loads the same EVM history path as the home chart', async () => {
    const { rerender } = render(
      <PortfolioTokenPriceChart chainId="0x1" priceUsd={1} symbol="ETH" />,
    );

    await waitFor(() => {
      expect(EvmLightNodeApi.get).toHaveBeenCalledWith('price/1/history');
    });
    expect(KeychainApi.get).not.toHaveBeenCalled();

    rerender(
      <PortfolioTokenPriceChart
        chainId="0x1"
        contractAddress="0xAbC"
        priceUsd={1}
        symbol="USDC"
      />,
    );

    await waitFor(() => {
      expect(EvmLightNodeApi.get).toHaveBeenCalledWith(
        'price/1/0xabc/history',
      );
    });
    expect(screen.getByTestId('wallet-token-price-chart-USDC')).toBeTruthy();
  });

  it('loads Hive and Hive Engine history the same way as the home chart', async () => {
    const { rerender } = render(
      <PortfolioTokenPriceChart isHive priceUsd={1} symbol="HIVE" />,
    );

    await waitFor(() => {
      expect(KeychainApi.get).toHaveBeenCalledWith(
        'hive/v2/price/hive/history',
      );
    });
    expect(BaseApi.get).not.toHaveBeenCalled();

    rerender(
      <PortfolioTokenPriceChart
        hiveUsd={0.25}
        isHive
        priceUsd={1}
        symbol="BEE"
      />,
    );

    await waitFor(() => {
      expect(BaseApi.get).toHaveBeenCalledWith(
        'https://info-api.tribaldex.com/market/ohlcv?symbol=BEE&interval=hourly',
      );
    });
    expect(KeychainApi.get).toHaveBeenCalledWith('hive/v2/price/hive/history');
    expect(screen.getByTestId('wallet-token-price-chart-BEE')).toBeTruthy();
  });

  it('does not request history when the token has no price', () => {
    render(
      <PortfolioTokenPriceChart chainId="0x1" priceUsd={null} symbol="DUST" />,
    );

    expect(screen.queryByTestId('wallet-token-price-chart-DUST')).toBeNull();
    expect(EvmLightNodeApi.get).not.toHaveBeenCalled();
    expect(KeychainApi.get).not.toHaveBeenCalled();
    expect(BaseApi.get).not.toHaveBeenCalled();
  });
});
