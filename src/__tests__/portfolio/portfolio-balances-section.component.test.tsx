import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { PortfolioBalancesSection } from 'src/portfolio/ui/portfolio-balances-section.component';

jest.mock('src/portfolio/ui/portfolio-token-price-chart.component', () => ({
  PortfolioTokenPriceChart: ({ symbol }: { symbol: string }) => (
    <div data-testid={`portfolio-token-price-chart-${symbol}`} />
  ),
}));

describe('PortfolioBalancesSection', () => {
  const baseProps = {
    hasAccounts: true,
    selectedAccountKey: 'evm:0xabc',
    isHiveAccount: false,
    showNetworkFilter: false,
    accountOptions: [{ value: 'evm:0xabc', label: '0xabc' }],
    networkOptions: [{ value: '', label: 'All networks' }],
    selectedNetwork: '',
    tokenFilter: '',
    expandedRowKeys: [] as string[],
    rowActions: ['swap' as const],
    isLoadingMoreChains: false,
    onSelectedAccountChange: jest.fn(),
    onSelectedNetworkChange: jest.fn(),
    onTokenFilterChange: jest.fn(),
    onToggleRowExpanded: jest.fn(),
    onOpenFlowForRow: jest.fn(),
    renderAccountOption: () => '0xabc',
    renderNetworkOption: () => 'All networks',
  };

  it('groups the account dropdown and token filter as siblings in one controls row', () => {
    const { container } = render(
      <PortfolioBalancesSection {...baseProps} rows={[]} />,
    );

    const controls = container.querySelector('.portfolio-controls');
    const controlChildren = [...(controls?.children ?? [])];

    expect(container.querySelector('.portfolio-header-row')).toBeNull();
    expect(controls?.querySelector('#portfolio-account')).not.toBeNull();
    expect(controls?.querySelector('#portfolio-network')).toBeNull();
    expect(controls?.querySelector('#portfolio-token-filter')).not.toBeNull();
    expect(controlChildren.map((child) => child.className)).toEqual([
      'portfolio-overlay-select portfolio-controls__account',
      'portfolio-token-filter',
    ]);
  });

  it('places the network filter beside account and assets without a nested grid', () => {
    const { container } = render(
      <PortfolioBalancesSection
        {...baseProps}
        showNetworkFilter
        rows={[]}
      />,
    );

    const controls = container.querySelector('.portfolio-controls');
    const controlChildren = [...(controls?.children ?? [])];

    expect(container.querySelector('.portfolio-header-row')).toBeNull();
    expect(controlChildren.map((child) => child.className)).toEqual([
      'portfolio-overlay-select portfolio-controls__account',
      'portfolio-overlay-select portfolio-controls__network',
      'portfolio-token-filter',
    ]);
  });

  it('filters visible rows by token filter and renders totals', () => {
    const { container, rerender } = render(
      <PortfolioBalancesSection
        {...baseProps}
        rows={[
          {
            key: 'eth',
            symbol: 'ETH',
            network: 'Ethereum',
            balance: '1',
            usdValue: 100,
            priceUsd: 100,
          },
          {
            key: 'matic',
            symbol: 'MATIC',
            network: 'Polygon',
            balance: '10',
            usdValue: 10,
            priceUsd: 1,
          },
        ]}
      />,
    );

    expect(container.textContent).toContain('ETH');
    expect(container.textContent).toContain('MATIC');
    expect(
      container.querySelector('[data-testid="portfolio-total-value"]')
        ?.textContent,
    ).toBe('$110.00');
    expect(
      [
        ...container.querySelectorAll(
          '[data-testid="portfolio-allocation-item"]',
        ),
      ].map((item) => item.textContent),
    ).toEqual(['ETHEthereum90.9%', 'MATICPolygon9.1%']);
    expect(
      container.querySelectorAll('[data-testid="portfolio-allocation-slice"]'),
    ).toHaveLength(2);

    rerender(
      <PortfolioBalancesSection
        {...baseProps}
        tokenFilter="matic"
        rows={[
          {
            key: 'eth',
            symbol: 'ETH',
            network: 'Ethereum',
            balance: '1',
            usdValue: 100,
            priceUsd: 100,
          },
          {
            key: 'matic',
            symbol: 'MATIC',
            network: 'Polygon',
            balance: '10',
            usdValue: 10,
            priceUsd: 1,
          },
        ]}
      />,
    );

    expect(container.textContent).toContain('MATIC');
    expect(container.textContent).not.toContain('Ethereum');
    expect(
      container.querySelector('[data-testid="portfolio-total-value"]')
        ?.textContent,
    ).toBe('$10.00');
    expect(
      [
        ...container.querySelectorAll(
          '[data-testid="portfolio-allocation-item"]',
        ),
      ].map((item) => item.textContent),
    ).toEqual(['MATICPolygon100%']);
  });

  it('recalculates the total and donut when the network filter changes', () => {
    const rows = [
      {
        key: 'eth',
        symbol: 'ETH',
        network: 'Ethereum',
        balance: '1',
        usdValue: 75,
        priceUsd: 75,
      },
      {
        key: 'matic',
        symbol: 'MATIC',
        network: 'Polygon',
        balance: '10',
        usdValue: 25,
        priceUsd: 2.5,
      },
    ];
    const { container, rerender } = render(
      <PortfolioBalancesSection
        {...baseProps}
        showNetworkFilter
        selectedNetwork=""
        rows={rows}
      />,
    );

    expect(
      container.querySelector('[data-testid="portfolio-total-value"]')
        ?.textContent,
    ).toBe('$100.00');
    expect(
      container.querySelectorAll('[data-testid="portfolio-allocation-slice"]'),
    ).toHaveLength(2);

    rerender(
      <PortfolioBalancesSection
        {...baseProps}
        showNetworkFilter
        selectedNetwork="Ethereum"
        rows={rows}
      />,
    );

    expect(container.textContent).toContain('ETH');
    expect(container.textContent).not.toContain('MATIC');
    expect(
      container.querySelector('[data-testid="portfolio-total-value"]')
        ?.textContent,
    ).toBe('$75.00');
    expect(
      [
        ...container.querySelectorAll(
          '[data-testid="portfolio-allocation-item"]',
        ),
      ].map((item) => item.textContent),
    ).toEqual(['ETHEthereum100%']);
  });

  it('uses the custom tooltip and includes the chain only for all networks', () => {
    jest.useFakeTimers();
    const rows = [
      {
        key: 'eth',
        symbol: 'ETH',
        network: 'Ethereum',
        balance: '1',
        usdValue: 75,
        priceUsd: 75,
      },
      {
        key: 'matic',
        symbol: 'MATIC',
        network: 'Polygon',
        balance: '10',
        usdValue: 25,
        priceUsd: 2.5,
      },
    ];

    try {
      const { container, rerender } = render(
        <PortfolioBalancesSection
          {...baseProps}
          showNetworkFilter
          selectedNetwork=""
          rows={rows}
        />,
      );

      expect(container.querySelector('.portfolio-allocation title')).toBeNull();
      expect(container.querySelector('.portfolio-allocation [title]')).toBeNull();

      fireEvent.mouseEnter(screen.getAllByTestId('portfolio-allocation-tooltip')[0]);
      act(() => {
        jest.advanceTimersByTime(250);
      });

      expect(screen.getByTestId('tooltip-content').textContent).toBe(
        'ETH · Ethereum · $75.00 · 75%',
      );

      fireEvent.mouseLeave(screen.getAllByTestId('portfolio-allocation-tooltip')[0]);
      act(() => {
        jest.advanceTimersByTime(250);
      });

      rerender(
        <PortfolioBalancesSection
          {...baseProps}
          showNetworkFilter
          selectedNetwork="Ethereum"
          rows={rows}
        />,
      );

      fireEvent.mouseEnter(screen.getByTestId('portfolio-allocation-tooltip'));
      act(() => {
        jest.advanceTimersByTime(250);
      });

      expect(screen.getByTestId('tooltip-content').textContent).toBe(
        'ETH · $75.00 · 100%',
      );
    } finally {
      jest.useRealTimers();
    }
  });

  it('leaves unpriced tokens out of the donut and out of the total', () => {
    const { container } = render(
      <PortfolioBalancesSection
        {...baseProps}
        rows={[
          {
            key: 'eth',
            symbol: 'ETH',
            network: 'Ethereum',
            balance: '1',
            usdValue: 40,
            priceUsd: 40,
          },
          {
            key: 'unknown',
            symbol: 'UNKNOWN',
            network: 'Base',
            balance: '5',
            usdValue: null,
            priceUsd: null,
          },
        ]}
      />,
    );

    expect(container.textContent).toContain('UNKNOWN');
    expect(
      container.querySelector('[data-testid="portfolio-total-value"]')
        ?.textContent,
    ).toBe('$40.00');
    expect(
      [
        ...container.querySelectorAll(
          '[data-testid="portfolio-allocation-item"]',
        ),
      ].map((item) => item.textContent),
    ).toEqual(['ETHEthereum100%']);
  });

  it('invokes onOpenFlowForRow from row actions', () => {
    const onOpenFlowForRow = jest.fn();
    const row = {
      key: 'eth',
      symbol: 'ETH',
      network: 'Ethereum',
      balance: '1',
      usdValue: 100,
      priceUsd: 100,
    };

    const { container } = render(
      <PortfolioBalancesSection
        {...baseProps}
        rows={[row]}
        onOpenFlowForRow={onOpenFlowForRow}
      />,
    );

    fireEvent.click(
      container.querySelector(
        '.portfolio-row-actions button',
      ) as HTMLButtonElement,
    );

    expect(onOpenFlowForRow).toHaveBeenCalledWith(row, 'swap');
    expect(
      container.querySelector('[data-testid="portfolio-row-price-chart-eth"]'),
    ).toBeNull();
  });

  it('expands the home price chart when a row is clicked and ignores action clicks', () => {
    const { container } = render(
      <PortfolioBalancesSection
        {...baseProps}
        rows={[
          {
            key: 'eth',
            symbol: 'ETH',
            network: 'Ethereum',
            balance: '1',
            usdValue: 100,
            priceUsd: 100,
            chainId: '0x1',
          },
          {
            key: 'matic',
            symbol: 'MATIC',
            network: 'Polygon',
            balance: '10',
            usdValue: 10,
            priceUsd: 1,
            chainId: '0x89',
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByTestId('portfolio-balance-row-eth'));

    expect(screen.getByTestId('portfolio-token-price-chart-ETH')).toBeTruthy();
    expect(
      container.querySelector('[data-testid="portfolio-row-price-chart-matic"]'),
    ).toBeNull();

    fireEvent.click(screen.getByTestId('portfolio-balance-row-matic'));

    expect(screen.queryByTestId('portfolio-token-price-chart-ETH')).toBeNull();
    expect(screen.getByTestId('portfolio-token-price-chart-MATIC')).toBeTruthy();

    fireEvent.click(screen.getByTestId('portfolio-balance-row-matic'));

    expect(screen.queryByTestId('portfolio-token-price-chart-MATIC')).toBeNull();
  });

  it('formats Hive balances with token decimals and leaves other chains unchanged', () => {
    const { container } = render(
      <PortfolioBalancesSection
        {...baseProps}
        isHiveAccount
        rows={[
          {
            key: 'hive:HP',
            symbol: 'HP',
            network: 'Hive',
            balance: '5400.452721643283',
            usdValue: 300,
            priceUsd: 0.056965,
            decimals: 3,
          },
          {
            key: 'hive:HBD',
            symbol: 'HBD',
            network: 'Hive',
            balance: '0',
            usdValue: 0,
            priceUsd: null,
            decimals: 3,
          },
          {
            key: 'eth',
            symbol: 'ETH',
            network: 'Ethereum',
            balance: '1.23456789',
            usdValue: 100,
            priceUsd: 100,
            decimals: 18,
          },
        ]}
      />,
    );

    const amounts = [
      ...container.querySelectorAll('.portfolio-amount-total'),
    ].map((element) => element.textContent);

    expect(amounts).toEqual(['0.000', '5,400.453', '1.23456789']);
  });
});
